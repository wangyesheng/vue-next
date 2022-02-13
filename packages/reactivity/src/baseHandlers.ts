import { hasOwn, isArray, isIntegerKey, isObject } from "@vue/shared"
import { track } from "./effect"
import { TrackOpTypes } from "./operators"
import { readonly, reactive } from "./reactive"

function createGetter(isReadonly: boolean = false, isShallow: boolean = false) {
    return function get(target: object, key: PropertyKey, receiver: any) {
        const result = Reflect.get(target, key, receiver)
        if (!isReadonly) {
            // 依赖收集
            track(target, TrackOpTypes.GET, key)
        }

        if (isShallow) {
            return result
        }

        if (isObject(result)) {
            return isReadonly ? readonly(result) : reactive(result)
        }

        return result
    }
}

function createSetter(isShallow: boolean = false) {
    return function set(target: object, key: PropertyKey, value: any, receiver: any) {
        const result = Reflect.set(target, key, value, receiver)

        const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key)
        // isArray

        return result
    }
}

const get = createGetter()
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

const set = createSetter()
const shallowSet = createSetter(true)


const mutableHandlers = {
    get,
    set
}
const shallowReactiveHandlers = {
    get: shallowGet,
    set: shallowSet
}
const readonlyHandlers = {
    get: readonlyGet,
    set: (target: any, key: string) => {
        console.warn(`set on key ${key} falied.`)
    }
}
const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set: (target: any, key: string) => {
        console.warn(`set on key ${key} falied.`)
    }
}


export {
    mutableHandlers,
    shallowReactiveHandlers,
    shallowReadonlyHandlers,
    readonlyHandlers
}