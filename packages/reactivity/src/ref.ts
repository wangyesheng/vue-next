import { isArray, isObject } from "@vue/shared"
import { track, trigger } from "./effect"
import { TrackOpTypes, TriggerOpTypes } from "./operators"
import { reactive } from "./reactive"

type RefValue = string | number | boolean | symbol | undefined | object

function ref(value: RefValue) {
    return createRef(value)
}

function shallowRef(value: RefValue) {
    return createRef(value, true)
}

function createRef(rawValue: RefValue, isShollow: boolean = false) {
    return new RefImpl(rawValue, isShollow)
}

const convert = (value: RefValue) => isObject(value) ? reactive(value) : value

class RefImpl {
    public _value: any;
    public __v_isRef = true

    constructor(
        public rawValue: RefValue,
        public isShollow: boolean = false
    ) {
        this._value = isShollow ? rawValue : convert(rawValue)
    }

    // `class` 中的 `get` 与 `set` 等价于 `Object.defineProperty`，
    // `Object.defineProperty` 取值与设置值的时候需要一个公用的 _value 属性来进行操作
    get value() {
        track(this, TrackOpTypes.GET, 'value')
        return this._value
    }

    set value(newValue) {
        if (newValue !== this.rawValue) {
            this.rawValue = newValue
            this._value = this.isShollow ? newValue : convert(newValue)
            trigger(this, TriggerOpTypes.UPDATE, 'value', newValue)
        }
    }
}

class ObjectRefImpl {
    public __v_isRef = true

    constructor(public target: any, public key: PropertyKey) { }

    get value() {
        return this.target[this.key]
    }

    set value(newValue) {
        this.target[this.key] = newValue
    }
}

function toRef(target: any, key: PropertyKey) {
    return new ObjectRefImpl(target, key)
}

function toRefs(target: any) {
    const result: any = isArray(target) ? new Array(target.length) : {}
    for (const key in target) {
        result[key] = toRef(target, key)
    }
    return result
}

export {
    ref,
    shallowRef,
    toRef,
    toRefs
}
