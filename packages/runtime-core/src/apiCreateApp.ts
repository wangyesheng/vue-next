export function createAppAPI(render: any) {
    return function (rootComponent: any, rootProps = {}) {
        const app = {
            mount(container: any) {
                const vnode = {}
                console.log(rootComponent, rootProps, container, vnode)
                render(vnode, container)
            }
        }
        return app
    }
}