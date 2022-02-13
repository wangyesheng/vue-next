import { TrackOpTypes } from "./operators"

interface IEffectOptions {
    lazy?: boolean
}

// vue2.0 watcher
function effect(fn: any, options: IEffectOptions = {}) {
    const effect = createReactiveEffect(fn, options)
    if (!options.lazy)
        effect()
    return effect
}

let uid: number = 0
let activeEffect: any | undefined
const effectStack: any[] = []
function createReactiveEffect(fn: any, options: IEffectOptions) {
    const effect = function reactiveEffect() {
        if (!effectStack.includes(effect)) {
            try {
                effectStack.push(effect)
                activeEffect = effect
                return fn() // fn 执行完才会去清除 effectStack 中的 effect，而 fn 执行时会进行 track 操作，所以 track 方法中的 activeEffect 永远都是当前运行的函数
            } finally {
                effectStack.pop()
                activeEffect = effectStack[effectStack.length - 1]
            }
        }
    }

    effect.id = uid++
    effect._isEffect = true
    effect.raw = fn
    effect.options = options

    return effect
}

const targetMap = new WeakMap
function track(target: object, type: TrackOpTypes, key: PropertyKey) {
    if (activeEffect == undefined) {
        return
    }

    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map))
    }

    let deps = depsMap.get(key)
    if (!deps) {
        depsMap.set(key, deps = new Set)
    }

    if (!deps.has(activeEffect)) {
        deps.add(activeEffect)
    }
}

export {
    effect,
    track
}


