import { effect } from "@vue/reactivity"
import { ShapeFlags } from "@vue/shared"
import { createAppAPI } from "./apiCreateApp"
import { createComponentInstance, IComponentInstance, setupComponent } from "./component"
import { queueJob } from "./scheduler"
import { isSameVNode, IVNode, normalizeVNode, Text } from "./vnode"

/**
 * 创建不同平台的渲染器
 * @param rendererOptions 渲染选项
 * @returns 创建的应用 App 
 */
export function createRenderer(rendererOptions: any) {

    const {
        createElement: hostCreateElement,
        createText: hostCreateText,
        setElementText: hostSetElementText,
        setText: hostSetText,
        remove: hostRemove,
        insert: hostInsert,
        patchProp: hostPatchProp,
        nextSibling: hostNextSibling
    } = rendererOptions

    const setupRenderEffect = (instance: IComponentInstance, container: any) => {
        // 每个组件都有一个 effect，组件级更新
        effect(function componentEffcet() {
            const proxyToUse = instance.proxy
            if (!instance.isMounted) {
                // 初次渲染
                let subTree = instance.subTree = instance.render.call(proxyToUse, proxyToUse)
                patch(null, subTree, container)
                instance.isMounted = true
            } else {
                // 更新
                const prevTree = instance.subTree
                const nexTree = instance.render.call(proxyToUse, proxyToUse)

                patch(prevTree, nexTree, container)
            }
        }, {
            scheduler: queueJob
        })
    }

    const mountComponent = (initVNode: IVNode, container: any) => {
        // 组件渲染流程，最核心的就是调用 setup 拿到返回值，获取 render 函数返回结果来进行渲染

        // 1. 先有实例
        const instance = (initVNode.component = createComponentInstance(initVNode))

        // 2. 需要的数据解析到实例上
        setupComponent(instance)

        // 3. 创建 effect 让 render 函数执行
        setupRenderEffect(instance, container)
    }

    const processComponent = (n1: IVNode | null, n2: IVNode, container: any) => {
        if (n1 == null) {
            // 初始化
            mountComponent(n2, container)
        } else {
            // 更新
        }
    }

    const mountChildren = (children: any[], container: any) => {
        for (let i = 0; i < children.length; i++) {
            const child = normalizeVNode(children[i])
            patch(null, child, container)
        }
    }

    const mountElement = (vnode: IVNode, container: any, anchor: any | null) => {
        const { type, props, children, shapeFlag } = vnode
        const el = vnode.el = hostCreateElement(type)
        for (const key in props) {
            hostPatchProp(el, key, null, props[key])
        }
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            hostSetElementText(el, children)
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            // 孩子是数组
            mountChildren(children, el)
        }
        hostInsert(el, container, anchor)
    }

    const patchProps = (oldProps: any, newProps: any, el: HTMLElement) => {
        if (newProps !== oldProps) {
            for (const key in newProps) {
                const oldValue = oldProps[key]
                const newValue = newProps[key]
                if (oldValue !== newValue) {
                    hostPatchProp(el, key, oldValue, newValue)
                }
            }
            for (const key in oldProps) {
                if (!(key in newProps)) {
                    hostPatchProp(el, key, oldProps[key], null)
                }
            }

            // for (const key in oldProps) {
            //     const oldValue = oldProps[key]
            //     const newValue = newProps[key]
            //     if (!(key in newProps)) {
            //         hostPatchProp(el, key, oldValue, null)
            //     }
            //     if (oldValue !== newValue) {
            //         hostPatchProp(el, key, oldValue, newValue)
            //     }
            // }
        }
    }

    const unmountChildren = (children: any[]) => {
        for (let i = 0; i < children.length; i++) {
            unmount(children[i])
        }
    }

    const patchChildren = (n1: IVNode, n2: IVNode, el: HTMLElement) => {
        const c1 = n1.children
        const c2 = n2.children
        // 新的有儿子老的没儿子，老的有儿子新的没儿子，新老都有儿子，新老都是文本
        const oldShapeFlag = n1.shapeFlag
        const currentShapeFlag = n2.shapeFlag
        if (currentShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(c1) // 如果 c1 中包含组件，需要调用组件的卸载方法
            }
            // 新老都是文本
            if (c2 !== c1) {
                hostSetElementText(el, c2)
            }
        } else {
            // 现在是元素，上一次有可能是文本或者数组
            if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                if (currentShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    // 当前是数组，之前是数组 -- diff core
                } else {
                    // 没有孩子，特殊情况，当前是 null，删除掉老的
                    unmountChildren(c1)
                }

            } else {
                // 上一次是文本
                if (oldShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                    hostSetElementText(el, '')
                }
                if (currentShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    mountChildren(c2, el)
                }
            }
        }
    }

    const patchElement = (n1: IVNode, n2: IVNode, container: any) => {
        let el = (n2.el = n1.el)
        const oldProps = n1.props
        const newProps = n2.props
        patchProps(oldProps, newProps, el!)
        patchChildren(n1, n2, el!)
    }

    const processElement = (n1: IVNode | null, n2: IVNode, container: any, anchor: any | null) => {
        if (n1 == null) {
            mountElement(n2, container, anchor)
        } else {
            patchElement(n1, n2, container)
        }
    }

    const processText = (n1: IVNode | null, n2: IVNode, container: any) => {
        if (n1 == null) {
            hostInsert((n2.el = hostCreateText(n2.children)), container)
        }
    }

    const unmount = (node: IVNode) => {
        // TODO: 如果是组件，处理组件的生命周期
        hostRemove(node.el)
    }

    const patch = (n1: IVNode | null, n2: IVNode, container: any, anchor: any | null = null) => {
        if (n1 && !isSameVNode(n1, n2)) {
            // 不是相同的元素 无需 diff
            anchor = hostNextSibling(n1.el)
            unmount(n1)
            n1 = null
        }
        const { shapeFlag, type } = n2
        switch (type) {
            case Text:
                processText(n1, n2, container)
                break;

            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 元素
                    processElement(n1, n2, container, anchor)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 组件
                    processComponent(n1, n2, container)
                }
        }
    }

    const render = function (vnode: IVNode, container: any) {
        patch(null, vnode, container)
    }

    return {
        /**
         * 针对不同平台创建的不同 App
         * @param rootComponent 根组件
         * @param rootProps 根组件 props
         * @returns 
         */
        createApp: createAppAPI(render)
    }
}
