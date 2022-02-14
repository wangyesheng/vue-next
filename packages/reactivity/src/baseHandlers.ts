import { hasOwn, isArray, isIntegerKey, isObject } from "@vue/shared"
import { track, trigger } from "./effect"
import { TrackOpTypes, TriggerOpTypes } from "./operators"
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

// 任意属性
interface ITarget {
    [key: PropertyKey]: any
}
function createSetter(isShallow: boolean = false) {
    return function set(target: ITarget, key: PropertyKey, value: any, receiver: any) {
        const oldValue = target[key]
        const hadKey =
            // 是数组并且是修改数组索引
            isArray(target) && isIntegerKey(key) ?
                Number(key) < target.length :
                hasOwn(target, key)

        const result = Reflect.set(target, key, value, receiver)

        if (!hadKey) {
            // ADD
            trigger(target, TriggerOpTypes.ADD, key, value)
        } else if (oldValue !== value) {
            // EDIT
            trigger(target, TriggerOpTypes.UPDATE, key, value, oldValue)
        }

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