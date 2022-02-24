import { createAppAPI } from "./apiCreateApp"

/**
 * 创建不同平台的渲染器
 * @param rendererOptions 渲染选项
 * @returns 创建的应用 App 
 */
export function createRenderer(rendererOptions: any) {
    const render = function (vnode: any, container: any) {

    }

    console.log('render')

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
