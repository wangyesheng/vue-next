import { isArray, isIntegerKey } from "@vue/shared"
import { TrackOpTypes, TriggerOpTypes } from "./operators"

interface IEffectOptions {
    lazy?: boolean,
    scheduler?: (p1: any) => void
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
    if (activeEffect == undefined) return

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

// 找属性对应的 effect 让其执行
function trigger(
    target: object,
    type: TriggerOpTypes,
    key: PropertyKey,
    newValue?: any,
    oldValue?: any
) {
    // debugger
    const depsMap = targetMap.get(target)
    // console.log(target, type, key, newValue, oldValue, targetMap)
    if (!depsMap) return

    const effects = new Set
    const add = (effectToAdd: Set<any>) => effectToAdd.forEach(effect => effects.add(effect))

    if (isArray(target)) {
        if (key === 'length') {
            depsMap.forEach((deps: any, _key: any) => {
                if (_key == 'length' ||
                    // 如果更改的长度小于收集的数组索引值，那么这个索引也需要触发 effect 重新执行
                    (typeof _key !== 'symbol' && _key > newValue)
                ) {
                    add(deps)
                }
            })
        }

        if (type == TriggerOpTypes.ADD && isIntegerKey(key)) {
            add(depsMap.get('length'))
        }
    } else {
        if (key) {
            const deps = depsMap.get(key)
            if (deps) add(deps)
        }
    }

    effects.forEach((effect: any) => {
        if (effect.options.scheduler) {
            effect.options.scheduler(effect)
        } else {
            effect()
        }
    })
}

export {
    effect,
    track,
    trigger
}


