import { rollup } from 'rollup'
import dts from 'rollup-plugin-dts'

export default async function build(src = '', dest = '') {
  const bundle = await rollup({
    input: src,
    plugins: [dts({ respectExternal: false })]
  })

  await bundle.write({
    file: dest,
    format: 'es'
  })

  console.log(`Typed bridge exported to ${dest}`)
}
