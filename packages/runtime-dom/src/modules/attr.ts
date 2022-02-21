export const patchAttr = (el: HTMLElement, key: string, prev: any, next: any) => {
    if (next == null) {
        el.removeAttribute(key)
    } else {
        el.setAttribute(key, next)
    }
}
