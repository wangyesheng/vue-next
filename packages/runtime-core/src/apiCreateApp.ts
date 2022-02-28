import { createVNode } from "./vnode"

export function createAppAPI(render: any) {
    return function (rootComponent: any, rootProps = {}) {
        const app = {
            _props: rootProps,
            _component: rootComponent,
            _container: null,
            mount(container: any) {
                app._container = container
                const vnode = createVNode(rootComponent, rootProps)
                render(vnode, container)
            }
        }
        return app
    }
}