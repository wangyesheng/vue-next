import { ShapeFlags } from "@vue/shared"
import { createAppAPI } from "./apiCreateApp"
import { createComponentInstance, setupComponent } from "./component"
import { IVNode } from "./vnode"

/**
 * 创建不同平台的渲染器
 * @param rendererOptions 渲染选项
 * @returns 创建的应用 App 
 */
export function createRenderer(rendererOptions: any) {
    const setupRenderEffect = () => { }

    const mountComponent = (initVNode: IVNode, container: any) => {
        // 组件渲染流程，最核心的就是调用 setup 拿到返回值，获取 render 函数返回结果来进行渲染

        // 1. 先有实例
        const instance = (initVNode.component = createComponentInstance(initVNode))

        // 2. 需要的数据解析到实例上
        setupComponent(instance)

        // 3. 创建 effect 让 render 函数执行
        setupRenderEffect()
    }

    const processComponent = (n1: IVNode | null, n2: IVNode, container: any) => {
        if (n1 == null) {
            // 初始化
            mountComponent(n2, container)
        } else {
            // 更新
        }
    }

    const patch = (n1: IVNode | null, n2: IVNode, container: any) => {
        const { shapeFlag } = n2
        if (shapeFlag & ShapeFlags.ELEMENT) {
            // 元素
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
            // 组件
            processComponent(n1, n2, container)
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
