import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

// UserScript metadata
const userscriptMetadata = `// ==UserScript==
// @name         UserScript Settings
// @namespace    http://tampermonkey.net/
// @version      ${pkg.version}
// @description  ${pkg.description}
// @author       ${pkg.author}
// @license      ${pkg.license}
// @match        *://*/*
// @grant        none
// @require      https://unpkg.com/react@18/umd/react.production.min.js
// @require      https://unpkg.com/react-dom@18/umd/react-dom.production.min.js
// ==/UserScript==`;

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/index.js',
                format: 'esm',
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
    {
        input: 'src/userscript.ts',
        output: {
            file: 'dist/userscript-settings.user.js',
            format: 'iife',
            name: 'UserScriptSettings',
            banner: userscriptMetadata,
            globals: {
                react: 'React',
                'react-dom': 'ReactDOM'
            }
        },
        plugins: [
            typescript({
                tsconfig: './tsconfig.json',
                useTsconfigDeclarationDir: true
            }),
            nodeResolve(),
            commonjs()
        ],
        external: ['react', 'react-dom']
    }
]; 