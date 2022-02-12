import path from 'path'
import json from '@rollup/plugin-json'
import ts from 'rollup-plugin-typescript2'
import {
    nodeResolve
} from '@rollup/plugin-node-resolve'

const packagesDir = path.resolve(__dirname, 'packages')

const basePackageDir = path.resolve(packagesDir, process.env.TARGET)

// 解析单独的文件
const resolve = dir => path.resolve(basePackageDir, dir)

const packageJSON = require(resolve('package.json'))
const basename = path.basename(basePackageDir)

const outputConfig = {
    'esm-bundler': {
        file: resolve(`dist/${basename}.esm-bundler.js`),
        format: 'es'
    },
    'cjs': {
        file: resolve(`dist/${basename}.cjs.js`),
        format: 'cjs'
    },
    'global': {
        file: resolve(`dist/${basename}.global.js`),
        format: 'iife' // 立即执行函数
    }
}

const buildOptions = packageJSON.buildOptions

function createConfig(format, output) {
    output.name = buildOptions.name
    output.sourcemap = true

    // 生成 rollup 配置
    return {
        input: resolve('src/index.ts'),
        output,
        plugins: [
            json(),
            ts({ // 解析 ts 文件
                tsconfig: path.resolve(__dirname, 'tsconfig.json')
            }),
            nodeResolve() // 解析第三方模块插件
        ]
    }
}

const configs = buildOptions.formats.map(format => createConfig(format, outputConfig[format]))


export default configs