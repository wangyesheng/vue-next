import { hasOwn } from "@vue/shared"

export const PublicComponentInstanceHandler = {
    get({ _: instance }: any, key: string, receiver: any) {
        if (key.startsWith('$')) {
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
        }
    },
    set({ _: instance }: any, key: string, value: any, receiver: any) {
        const { setupState, props, data } = instance
        if (hasOwn(setupState, key)) {
            Reflect.set(setupState, key, value, receiver)
        } else if (hasOwn(props, key)) {
            Reflect.set(props, key, value, receiver)
        } else if (hasOwn(data, key)) {
            Reflect.set(data, key, value, receiver)
        }
    }
}