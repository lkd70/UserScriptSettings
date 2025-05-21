import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

// UserScript metadata
const userscriptMeta = `
// ==UserScript==
// @name         UserScript Settings
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  A flexible and type-safe settings management system for UserScripts with a modern React-based UI
// @author       LKD70
// @license      AGPL-3.0
// @require      https://unpkg.com/react@18/umd/react.production.min.js
// @require      https://unpkg.com/react-dom@18/umd/react-dom.production.min.js
// ==/UserScript==
`;

// Process polyfill
const processPolyfill = `
// Process polyfill
window.process = {
    env: {
        NODE_ENV: 'production'
    }
};
`;

export default [
  // Library files
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: true
      }
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        useTsconfigDeclarationDir: true
      }),
      nodeResolve(),
      commonjs()
    ],
    external: ['react', 'react-dom']
  },
  // UserScript bundle
  {
    input: 'src/userscript.ts',
    output: {
      file: 'dist/userscript-settings.user.js',
      format: 'iife',
      name: 'UserScriptSettings',
      banner: userscriptMeta + processPolyfill,
      globals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
      }
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        useTsconfigDeclarationDir: true
      }),
      nodeResolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs({
        transformMixedEsModules: true,
        requireReturnsDefault: 'auto'
      })
    ],
    external: ['react', 'react-dom']
  }
]; 