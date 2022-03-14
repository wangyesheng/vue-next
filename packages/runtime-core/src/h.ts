import { isArray, isObject } from "@vue/shared"
import { createVNode, isVNode } from "./vnode"

/**
 * h('div',{},'hello')
 * h('div',{})
 * h('div',{},[h('p',{},'hello')])
 * h('div',h('p',{},'hello'))
 * h('div','hello')
 * h('div','hello','-','world') ❌
 * h('div',{},'hello','-','world') ✔
 * @param type 
 * @param propsOrChildren 
 * @param children 儿子节点要么是数组要么是字符串
 * @returns 
 */
export function h(type: string, propsOrChildren: any, children: any) {
    const len = arguments.length
    if (len == 2) {
        // 类型 + 属性，类型 + 孩子
        // 如果第二个参数不是对象，一定是孩子
        if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
            if (isVNode(propsOrChildren)) {
                return createVNode(type, null, [propsOrChildren])
            }
            return createVNode(type, propsOrChildren)
        } else {
            return createVNode(type, null, propsOrChildren)
        }
    } else {
        if (len > 3) {
            // 这种情况必须确保第二个参数为属性
            children = Array.prototype.slice.call(arguments, 2)
        } else if (len == 3 && isVNode(children)) {
            children = [children]
        }
        return createVNode(type, propsOrChildren, children)
    }
}
