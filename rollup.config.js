import { defineConfig } from 'rollup'
import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import fs from 'fs'

fs.rmSync('dist', { recursive: true, force: true })

// Remove all comments for rollup to work
const config = defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.common.js',
      format: 'cjs',
      exports: 'named'
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
      exports: 'named'
    }
  ],
  external: ['ajv', 'axios', 'chalk', 'compression', 'cors', 'ejs', 'express', 'joi', 'os'],
  plugins: [
    typescript({ tsconfig: './tsconfig.json' }),
    babel({
      plugins: ['@babel/plugin-transform-runtime'],
      presets: ['@babel/env'],
      exclude: ['node_modules/**'],
      babelHelpers: 'runtime'
    })
  ]
})

export default [config]
