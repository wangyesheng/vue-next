export const patchEvent = (el: any, key: string, value: any) => {
    const invokers = el._vei || (el._vei = {})
    const exists = invokers[key]
    if (value && exists) {
        exists.value = value
    } else {
        const eventName: keyof HTMLElementEventMap | string = key.slice(2).toLocaleLowerCase()
        if (value) {
            const invoker = invokers[eventName] = createInvoker(value)
            el.addEventListener(eventName, invoker)
        } else {
            (el as HTMLElement).removeEventListener(eventName, exists)
            invokers[eventName] = undefined
        }
    }
}

function createInvoker(value: any): any {
    const invoker = (e: any) => {
        invoker.value(e)
    }
    invoker.value = value
    return invoker
}