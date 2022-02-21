import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/events";
import { patchStyle } from "./modules/style";

export const patchProp = (el: HTMLElement, key: string, prevValue: any, nextValue: any) => {
    switch (key) {
        case 'class':
            patchClass(el, nextValue)
            break;
        case 'style':
            patchStyle(el, key, prevValue, nextValue)
            break
        default:
            if (/^on[A-Z]/.test(key)) {
                patchEvent(el, key, nextValue)
            } else {
                patchAttr(el, key, prevValue, nextValue)
            }
            break;
    }
}