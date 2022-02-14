import { isObject } from "@vue/shared"
import { reactive } from "./reactive"

type RefValue = string | number | boolean | symbol | undefined

function ref(value: RefValue) {
    if (isObject(value)) {
        return reactive(value)
    }
    return createRef(value)
}

function shallowRef(value: RefValue) {

    return createRef(value, true)
}

function createRef(rawValue: RefValue, isShollow: boolean = false) { }


export {
    ref,
    shallowRef
}
