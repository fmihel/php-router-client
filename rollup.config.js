import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
// import { terser } from 'rollup-plugin-terser';
import commonJs from 'rollup-plugin-commonjs';

export default {
    input: './index.js',
    output: {
        file: './dist/fmihel-router-client.js',
        format: 'cjs', // umd cjs iife
        name: 'fmihel_router_client',
    },
    external: ['jquery'],
    plugins: [

        resolve(),
        commonJs(),
        babel({
            exclude: 'node_modules/**', // only transpile our source code
        }),
        // terser(),
    ],

};
