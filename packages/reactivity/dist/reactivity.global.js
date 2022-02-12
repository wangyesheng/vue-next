var VueReactivity = (function (exports) {
    'use strict';

    const isObject = (value) => typeof value === 'object' && value != null;

    function createGetter(isReadonly = false, isShallow = false) {
        return function get(target, key, receiver) {
            const result = Reflect.get(target, key, receiver);
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
            const result = Reflect.set(target, key, value, receiver);
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
        console.log('取值');
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

    exports.reactive = reactive;
    exports.readonly = readonly;
    exports.shallowReactive = shallowReactive;
    exports.shallowReadonly = shallowReadonly;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=reactivity.global.js.map
