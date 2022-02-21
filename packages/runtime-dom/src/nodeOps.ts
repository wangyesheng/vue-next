export const nodeOps = {
    createElement(tagName: keyof HTMLElementTagNameMap): HTMLElement | null {
        return document.createElement(tagName)
    },
    remove(child: Node) {
        child.parentNode?.removeChild(child)
    },
    // 在参照物之前插入指定的新元素，如果参照物为 null 相当于 appendChild
    insert(child: Node, parent: Node, anchor: Node | null = null): Node {
        return parent.insertBefore(child, anchor)
    },
    querySelector(selector: keyof HTMLElementTagNameMap): HTMLElement | null {
        return document.querySelector(selector)
    },
    setElementText(el: Node, text: string | null) {
        el.textContent = text
    }
}
