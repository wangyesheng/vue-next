import { effect } from "@vue/reactivity"
import { ShapeFlags } from "@vue/shared"
import { createAppAPI } from "./apiCreateApp"
import { createComponentInstance, IComponentInstance, setupComponent } from "./component"
import { queueJob } from "./scheduler"
import { IVNode, normalizeVNode, Text } from "./vnode"

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
        patchProp: hostPatchProp
    } = rendererOptions

    const setupRenderEffect = (instance: IComponentInstance, container: any) => {
        // 每个组件都有一个 effect，组件级更新
        effect(function componentEffcet() {
            if (!instance.isMounted) {
                // 初次渲染
                const proxyToUse = instance.proxy
                let subTree = instance.render.call(proxyToUse, proxyToUse)
                patch(null, subTree, container)
                instance.isMounted = true
            } else {
                // 更新
                console.log('更新啦')
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

    const mountElement = (vnode: IVNode, container: any) => {
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
        hostInsert(el, container)
    }

    const processElement = (n1: IVNode | null, n2: IVNode, container: any) => {
        if (n1 == null) {
            mountElement(n2, container)
        }
    }

    const processText = (n1: IVNode | null, n2: IVNode, container: any) => {
        if (n1 == null) {
            hostInsert((n2.el = hostCreateText(n2.children)), container)
        }
    }

    const patch = (n1: IVNode | null, n2: IVNode, container: any) => {
        const { shapeFlag, type } = n2

        switch (type) {
            case Text:
                processText(n1, n2, container)
                break;

            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 元素
                    processElement(n1, n2, container)
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
