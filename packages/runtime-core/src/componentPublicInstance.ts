import { hasOwn } from "@vue/shared"
import { IComponentInstance } from "./component"

export const PublicComponentInstanceHandler = {
    get({ _: instance }: any, key: PropertyKey, receiver: any) {
        if ((key as string).startsWith('$')) {
            console.warn(`Can't read properties starting with $`)
            return
        }
        const { setupState, props, data } = instance
        if (hasOwn(setupState, key)) {
            return Reflect.get(setupState, key, receiver)
        } else if (hasOwn(props, key)) {
            return Reflect.get(props, key, receiver)
        } else if (hasOwn(data, key)) {
            return Reflect.get(data, key, receiver)
        } else {
            return undefined
        }
    },
    set(target: any, key: PropertyKey, value: any, receiver: any) {
        Reflect.set(target, key, value, receiver)
    }
}