const queue: any[] = []
export function queueJob(job: any) {
    if (!queue.includes(job)) {
        queue.push(job)
        queueFlush()
    }
}

let isFlushPending = false
export function queueFlush() {
    if (!isFlushPending) {
        isFlushPending = true
        // 异步更新策略
        Promise.resolve().then(flushJob)
    }
}

function flushJob() {
    isFlushPending = false
    // 清空时需要根据调用的顺序依次刷新，保证先刷新父亲再刷新儿子，和组件挂载的顺序一致
    queue.sort((a, b) => a.id - b.id)
    for (let i = 0; i < queue.length; i++) {
        queue[i]()
    }
    queue.length = 0
}