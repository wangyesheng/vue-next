import { ShapeFlags } from "./shapeFlag"

const isObject = (value: any) => typeof value === 'object' && value != null
const isArray = Array.isArray
const isFunction = (value: any) => typeof value === 'function'
const isNumber = (value: any) => typeof value === 'number'
const isString = (value: any) => typeof value === 'string'
const isIntegerKey = (key: any) => parseInt(key) + '' === key
const hasOwn = (target: object, key: PropertyKey) => Object.prototype.hasOwnProperty.call(target, key)

export {
    isObject,
    isArray,
    isFunction,
    isNumber,
    isString,
    isIntegerKey,
    hasOwn,
    ShapeFlags
}