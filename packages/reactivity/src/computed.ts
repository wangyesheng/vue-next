import { isFunction } from "@vue/shared";
import { effect, track, trigger } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./operators";

class ComputedRefImpl {
    public _dirty = true // 默认取值不用缓存的
    public _value: any
    public effect: any

    constructor(
        public getter: () => {},
        public setter: (p1: any) => {}
    ) {
        this.effect = effect(
            getter,
            {
                lazy: true,
                scheduler: () => {
                    if (!this._dirty) {
                        this._dirty = true
                        trigger(this, TriggerOpTypes.UPDATE, 'value')
                    }
                }
            }
        )
    }

    get value() {
        if (this._dirty) {
            this._value = this.effect()
            this._dirty = false
        }
        track(this, TrackOpTypes.GET, 'value')
        return this._value
    }

    set value(newValue) {
        this.setter(newValue)
    }
}

// 1、默认不执行，当访问属性的时候执行
// 2、依赖的值不变，不会去重新计算，一直用缓存的值
// 3、依赖的值变了，也不会去重新计算，当再次调用该计算属性值才重新计算
// 4、effect(()=>{},{lazy:true}) + scheduler + 缓存标志
export function computed(getterOrOptions: any) {
    let getter, setter

    if (isFunction(getterOrOptions)) {
        getter = getterOrOptions
        setter = () => {
            console.warn('computed value must be readonly')
        }
    } else {
        getter = getterOrOptions.getter
        setter = getterOrOptions.setter
    }

    return new ComputedRefImpl(getter, setter)
}

