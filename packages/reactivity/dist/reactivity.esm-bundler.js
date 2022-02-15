const isObject = (value) => typeof value === 'object' && value != null;
const isArray = Array.isArray;
const isIntegerKey = (key) => parseInt(key) + '' === key;
const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key);

// vue2.0 watcher
function effect(fn, options = {}) {
    const effect = createReactiveEffect(fn, options);
    if (!options.lazy)
        effect();
    return effect;
}
let uid = 0;
let activeEffect;
const effectStack = [];
function createReactiveEffect(fn, options) {
    const effect = function reactiveEffect() {
        if (!effectStack.includes(effect)) {
            try {
                effectStack.push(effect);
                activeEffect = effect;
                return fn(); // fn 执行完才会去清除 effectStack 中的 effect，而 fn 执行时会进行 track 操作，所以 track 方法中的 activeEffect 永远都是当前运行的函数
            }
            finally {
                effectStack.pop();
                activeEffect = effectStack[effectStack.length - 1];
            }
        }
    };
    effect.id = uid++;
    effect._isEffect = true;
    effect.raw = fn;
    effect.options = options;
    return effect;
}
const targetMap = new WeakMap;
function track(target, type, key) {
    if (activeEffect == undefined)
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map));
    }
    let deps = depsMap.get(key);
    if (!deps) {
        depsMap.set(key, deps = new Set);
    }
    if (!deps.has(activeEffect)) {
        deps.add(activeEffect);
    }
}
// 找属性对应的 effect 让其执行
function trigger(target, type, key, newValue, oldValue) {
    // debugger
    const depsMap = targetMap.get(target);
    // console.log(target, type, key, newValue, oldValue, targetMap)
    if (!depsMap)
        return;
    const effects = new Set;
    const add = (effectToAdd) => effectToAdd.forEach(effect => effects.add(effect));
    if (isArray(target)) {
        if (key === 'length') {
            depsMap.forEach((deps, _key) => {
                if (_key == 'length' ||
                    // 如果更改的长度小于收集的数组索引值，那么这个索引也需要触发 effect 重新执行
                    (typeof _key !== 'symbol' && _key > newValue)) {
                    add(deps);
                }
            });
        }
        if (type == 0 /* ADD */ && isIntegerKey(key)) {
            add(depsMap.get('length'));
        }
    }
    else {
        if (key) {
            const deps = depsMap.get(key);
            if (deps)
                add(deps);
        }
    }
    effects.forEach((effect) => effect());
}

function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key, receiver) {
        const result = Reflect.get(target, key, receiver);
        if (!isReadonly) {
            // 依赖收集
            track(target, 0 /* GET */, key);
        }
        if (isShallow) {
            return result;
        }
        if (isObject(result)) {
            return isReadonly ? readonly(result) : reactive(result);
        }
        return result;
    };
}
function createSetter(isShallow = false) {
    return function set(target, key, value, receiver) {
        const oldValue = target[key];
        const hadKey = 
        // 是数组并且是修改数组索引
        isArray(target) && isIntegerKey(key) ?
            Number(key) < target.length :
            hasOwn(target, key);
        const result = Reflect.set(target, key, value, receiver);
        if (!hadKey) {
            // ADD
            trigger(target, 0 /* ADD */, key, value);
        }
        else if (oldValue !== value) {
            // EDIT
            trigger(target, 1 /* UPDATE */, key, value);
        }
        return result;
    };
}
const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const set = createSetter();
const shallowSet = createSetter(true);
const mutableHandlers = {
    get,
    set
};
const shallowReactiveHandlers = {
    get: shallowGet,
    set: shallowSet
};
const readonlyHandlers = {
    get: readonlyGet,
    set: (target, key) => {
        console.warn(`set on key ${key} falied.`);
    }
};
const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set: (target, key) => {
        console.warn(`set on key ${key} falied.`);
    }
};

const reactiveMap = new WeakMap, readonlyMap = new WeakMap;
function createReactiveObject(target, isReadonly, baseHandlers) {
    if (!isObject(target)) {
        return target;
    }
    const proxyMap = isReadonly ? readonlyMap : reactiveMap;
    // 已经代理过的对象直接返回
    const existProxy = proxyMap.get(target);
    if (existProxy) {
        return existProxy;
    }
    const proxy = new Proxy(target, baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}
function reactive(target) {
    return createReactiveObject(target, false, mutableHandlers);
}
function shallowReactive(target) {
    return createReactiveObject(target, false, shallowReactiveHandlers);
}
function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers);
}
function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandlers);
}

function ref(value) {
    return createRef(value);
}
function shallowRef(value) {
    return createRef(value, true);
}
function createRef(rawValue, isShollow = false) {
    return new RefImpl(rawValue, isShollow);
}
const convert = (value) => isObject(value) ? reactive(value) : value;
class RefImpl {
    rawValue;
    isShollow;
    _value;
    __v_isRef = true;
    constructor(rawValue, isShollow = false) {
        this.rawValue = rawValue;
        this.isShollow = isShollow;
        this._value = isShollow ? rawValue : convert(rawValue);
    }
    // `class` 中的 `get` 与 `set` 等价于 `Object.defineProperty`，
    // `Object.defineProperty` 取值与设置值的时候需要一个公用的 _value 属性来进行操作
    get value() {
        track(this, 0 /* GET */, 'value');
        return this._value;
    }
    set value(newValue) {
        if (newValue !== this.rawValue) {
            this.rawValue = newValue;
            this._value = this.isShollow ? newValue : convert(newValue);
            trigger(this, 1 /* UPDATE */, 'value', newValue);
        }
    }
}

export { effect, reactive, readonly, ref, shallowReactive, shallowReadonly, shallowRef };
//# sourceMappingURL=reactivity.esm-bundler.js.map
