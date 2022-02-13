import { isObject } from '@vue/shared'
import {
    mutableHandlers,
    shallowReactiveHandlers,
    shallowReadonlyHandlers,
    readonlyHandlers
} from './baseHandlers'

const reactiveMap = new WeakMap, readonlyMap = new WeakMap

function createReactiveObject(target: any, isReadonly: boolean, baseHandlers: any) {
    if (!isObject(target)) {
        return target
    }

    const proxyMap = isReadonly ? readonlyMap : reactiveMap
    // 已经代理过的对象直接返回
    const existProxy = proxyMap.get(target)
    if (existProxy) {
        return existProxy
    }

    const proxy = new Proxy(target, baseHandlers)

    proxyMap.set(target, proxy)

    return proxy
}

export function reactive(target: any) {
    return createReactiveObject(target, false, mutableHandlers)
}
export function shallowReactive(target: any) {
    return createReactiveObject(target, false, shallowReactiveHandlers)
}
export function readonly(target: any) {
    return createReactiveObject(target, true, readonlyHandlers)
}
export function shallowReadonly(target: any) {
    return createReactiveObject(target, true, shallowReadonlyHandlers)
}