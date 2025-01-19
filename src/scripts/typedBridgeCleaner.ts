import * as ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'

// Snippet to inject at the end
const proxySnippet = () => `
type typedBridgeConfig = {
  host: string
  headers: { [key: string]: string }
}

export const typedBridgeConfig: typedBridgeConfig = {
  host: '',
  headers: { 'Content-Type': 'application/json' }
}

export const typedBridge = new Proxy(
  {},
  {
    get(_, methodName: string) {
      return async (args: any) => {
        const response = await fetch(
          typedBridgeConfig.host + (typedBridgeConfig.host.endsWith('/') ? '' : '/') + methodName,
          {
            method: 'POST',
            headers: typedBridgeConfig.headers,
            body: JSON.stringify(args)
          }
        )
        if (response.status !== 200) throw new Error('typed-bridge server error!')
        return response.json()
      }
    }
  }
) as typeof _default

export default typedBridge
`

/**
 * Transformer #1:
 * Remove the second parameter from any function type node.
 */
const removeSecondParamTransformer: ts.TransformerFactory<ts.SourceFile> = context => {
  return sourceFile => {
    function visitor(node: ts.Node): ts.Node {
      if (ts.isFunctionTypeNode(node) && node.parameters.length > 1) {
        return ts.factory.updateFunctionTypeNode(
          node,
          node.typeParameters,
          ts.factory.createNodeArray([node.parameters[0]]),
          node.type
        )
      }
      return ts.visitEachChild(node, visitor, context)
    }
    return ts.visitEachChild(sourceFile, visitor, context) as ts.SourceFile
  }
}

/**
 * Transformer #2:
 * Remove "export { _default as default }" if it exists.
 */
const removeDefaultExportTransformer: ts.TransformerFactory<ts.SourceFile> = context => {
  return sourceFile => {
    function visitor(node: ts.Node): ts.Node | undefined {
      // Look for `export { _default as default }` and drop it
      if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
        const [el] = node.exportClause.elements
        if (
          node.exportClause.elements.length === 1 &&
          el.propertyName?.text === '_default' &&
          el.name.text === 'default'
        ) {
          return undefined
        }
      }
      return ts.visitEachChild(node, visitor, context)
    }

    const updatedStatements: ts.Statement[] = []
    for (const stmt of sourceFile.statements) {
      const newStmt = ts.visitNode(stmt, visitor)
      if (newStmt) updatedStatements.push(newStmt as ts.Statement)
    }
    return ts.factory.updateSourceFile(sourceFile, ts.factory.createNodeArray(updatedStatements))
  }
}

/**
 * Main cleaner function.
 *  1. Ensures top comment is present.
 *  2. Transforms code with the above transformers.
 *  3. Writes the final file output.
 */
export default function cleanTsFile(src: string) {
  let sourceCode = fs.readFileSync(src, 'utf-8')

  // Ensure the top comment is present if missing
  if (!sourceCode.startsWith('/* eslint-disable @typescript-eslint/no-unused-vars */')) {
    sourceCode = '/* eslint-disable @typescript-eslint/no-unused-vars */\n' + sourceCode
  }

  // Parse the source
  const sourceFile = ts.createSourceFile(path.basename(src), sourceCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

  // Run the transformers
  const result = ts.transform(sourceFile, [removeSecondParamTransformer, removeDefaultExportTransformer])

  // Print final code
  const printer = ts.createPrinter()
  const transformedCode = printer.printFile(result.transformed[0]).concat(proxySnippet())

  // Write back to the same file
  fs.writeFileSync(src, transformedCode, 'utf-8')
  console.log(`Cleaned file: ${src}`)
}
