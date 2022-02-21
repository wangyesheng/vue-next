export const patchClass = (el: HTMLElement, value: any) => {
    if (value == null) {
        value = ''
    }
    el.className = value
}
