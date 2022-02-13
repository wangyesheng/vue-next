const execa = require('execa')

// 开发环境下对只需要用到的文件进行打包
const target = 'reactivity'

async function build(target) {
    await execa('rollup',
        // `-c` 执行 rollup 配置文件
        // `-wc` 执行并监控 rollup 配置文件
        ['-c', '--environment', [`TARGET:${target}`]], {
            stdio: 'inherit' // 将子进程打包的信息共享给父进程
        }
    )
}

build(target)

