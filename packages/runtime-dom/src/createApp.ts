import { createRenderer } from '@vue/runtime-core'
import { isString } from '@vue/shared'
import {
    nodeOps
} from './nodeOps'
import {
    patchProp
} from './patchProp'

const rendererOptions = Object.assign({ patchProp }, nodeOps)

export function createApp(rootComponent: any, rootProps = {}) {
    const app: any = createRenderer(rendererOptions).createApp(rootComponent, rootProps)
    const { mount } = app

    app.mount = function (container: any) {
        container = isString(container) ? nodeOps.querySelector(container) : container
        // 一开始不管根容器上有些什么内容都需要进行清空
        container.innerHTML = ''
        mount(container)
    }

    return app
}