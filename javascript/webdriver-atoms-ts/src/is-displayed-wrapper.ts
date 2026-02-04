// Wrapper for isDisplayed that exports to window.__isDisplayed__
import * as dom from './inject/dom';

(globalThis as any).__isDisplayed__ = (element: any, optWindow?: any): string => {
    return dom.isDisplayed(element, optWindow);
};


