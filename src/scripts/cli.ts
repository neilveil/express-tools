#!/usr/bin/env node
import { program } from 'commander'
import buildTypedBridge from './buildTypeBridge'
import typedBridgeCleaner from './typedBridgeCleaner'

program
  .command('gen-typed-bridge')
  .description('Generate a typed bridge')
  .option('--src <string>', 'Set typed bridge source file path')
  .option('--dest <string>', 'Set typed bridge destination file path', 'typedBridge.ts')
  .action(async options => {
    const { src = '', dest = '' } = options

    if (!src) throw new Error('--src required')
    if (!dest) throw new Error('--dest required')

    await buildTypedBridge(src, dest)
    typedBridgeCleaner(dest)
  })

program.parse()
