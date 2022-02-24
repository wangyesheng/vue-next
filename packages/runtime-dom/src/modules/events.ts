export const patchEvent = (el: Element & { _vei?: any }, key: string, value: any) => {
    const invokers = el._vei || (el._vei = {})
    const existsInvoker = invokers[key]
    if (value && existsInvoker) {
        existsInvoker.value = value
    } else {
        const eventName: keyof HTMLElementEventMap | string = key.slice(2).toLocaleLowerCase()
        if (value) {
            const invoker = invokers[key] = createInvoker(value)
            el.addEventListener(eventName, invoker)
        } else {
            el.removeEventListener(eventName, existsInvoker)
            invokers[key] = undefined
        }
    }
}

function createInvoker(value: any): any {
    const invoker = (e: MouseEvent) => {
        invoker.value(e)
    }
    invoker.value = value
    return invoker
}