const fs = require('fs')
const execa = require('execa')

const targets = fs.readdirSync('packages')
    .filter(dir => fs.statSync(`packages/${dir}`).isDirectory())

// 对目标并行打包
function runParallel(targets, iteratorFn) {
    const promises = []
    targets.forEach(target => {
        promises.push(iteratorFn(target))
    })
    return Promise.all(promises)
}

async function build(target) {
    await execa('rollup',
        // `-c` 执行 rollup 配置文件
        // `-wc` 执行并监控 rollup 配置文件
        ['-c', '--environment', [`TARGET:${target}`]], {
            stdio: 'inherit' // 将子进程打包的信息共享给父进程
        }
    )
}

runParallel(targets, build)