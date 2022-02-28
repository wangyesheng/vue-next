import { ShapeFlags } from "@vue/shared";
import { PublicComponentInstanceHandler } from "./componentPublicInstance";
import { IVNode } from "./vnode";

export interface IComponentInstance {
    vnode: IVNode,
    type: any,
    props: any,
    attrs: any,
    slots: any,
    children: any,
    render: any,
    setupState: any, // setup 函数的返回值
    data: any, // options api data
    ctx: any,
    isMounted: boolean, // 组件是否挂载过 
}

export function createComponentInstance(vnode: IVNode) {
    const instance: IComponentInstance = {
        vnode,
        type: vnode.type,
        props: {},
        attrs: {},
        slots: {},
        children: null,
        render: null,
        setupState: {}, // setup 函数的返回值
        data: {
            b: 2
        },
        ctx: {},
        isMounted: false, // 组件是否挂载过 
    }
    instance.ctx = { _: instance }
    return instance
}

export function setupComponent(instance: IComponentInstance) {
    const { props, children } = instance.vnode
    // 根据 props 解析出 props 和 attrs，将其放到 instance 上
    instance.props = props
    instance.children = children

    // 先看下是有状态组件还是函数组件
    const isStateful = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
    if (isStateful) {
        // 带状态组件，调用当前实例的 setup 方法，用 setup 的返回值填充 setupState 和 render 方法
        setupStatefulComponent(instance)
    }
}

function setupStatefulComponent(instance: IComponentInstance) {
    // 1. 代理传递给 render 函数的参数
    const instanceProxy = new Proxy(instance.ctx, PublicComponentInstanceHandler as any)

    // 2. 获取组件的类型 拿到组件的 setup 方法 
    const Component = instance.type
    const { setup, render } = Component
    const setupContext = createSetupContext(instance)
    instance.setupState = setup(instance.props, setupContext)
    render && render(instanceProxy)
}

function createSetupContext(instance: IComponentInstance) {
    return {
        props: instance.props, // 开发有，生产没有
        attrs: instance.attrs,
        slots: instance.slots,
        emit: () => { },
        expose: () => { }
    }
}