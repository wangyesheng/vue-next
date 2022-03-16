import { isArray, isObject, isString, ShapeFlags } from "@vue/shared"


export interface IVNode {
    __v_isVnode: boolean,
    type: any,
    props: any,
    component: any,
    children: any,
    key: any,
    el: HTMLElement | null,
    shapeFlag: ShapeFlags
}

export function isVNode(vnode: IVNode) {
    return vnode.__v_isVnode
}

export function isSameVNode(n1: IVNode, n2: IVNode) {
    return n1.type === n2.type && n1.key === n2.key
}

export function createVNode(type: any, props: any, children: any[] | string | null = null) {
    // 根据 type 来区分是组件还是普通元素
    const shapeFlag =
        isString(type) ?
            ShapeFlags.ELEMENT :
            isObject(type) ?
                ShapeFlags.STATEFUL_COMPONENT :
                0

    const vnode: IVNode = {
        __v_isVnode: true,
        type,
        props,
        component: null, // 组件对应的实例
        children,
        key: props && props.key, // diff
        el: null, // 与虚拟节点相对应的真实 DOM 节点
        shapeFlag // 判断当前自己的类型和儿子的类型
    }

    normalizeChildren(vnode, children)

    return vnode
}


function normalizeChildren(vnode: any, children: any) {
    let type = 0
    if (children == null) {

    } else if (isArray(children)) {
        type = ShapeFlags.ARRAY_CHILDREN
    } else {
        type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag |= type
}

export const Text = Symbol('Text')
export function normalizeVNode(vnode: number | string | IVNode): IVNode {
    if (isObject(vnode)) return vnode as IVNode
    return createVNode(Text, null, String(vnode))
}

