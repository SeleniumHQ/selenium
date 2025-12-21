/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Browser capability checks for the events package.
 */

goog.module('goog.events.BrowserFeature');
goog.module.declareLegacyNamespace();


/**
 * Tricks Closure Compiler into believing that a function is pure.  The compiler
 * assumes that any `valueOf` function is pure, without analyzing its contents.
 *
 * @param {function(): T} fn
 * @return {T}
 * @template T
 */
const purify = (fn) => {
  return ({valueOf: fn}).valueOf();
};


/**
 * Enum of browser capabilities.
 * @enum {boolean}
 */
exports = {
  /**
   * Whether touch is enabled in the browser.
   */
  TOUCH_ENABLED:
      ('ontouchstart' in goog.global ||
       !!(goog.global['document'] && document.documentElement &&
          'ontouchstart' in document.documentElement) ||
       // IE10 uses non-standard touch events, so it has a different check.
       !!(goog.global['navigator'] &&
          (goog.global['navigator']['maxTouchPoints'] ||
           goog.global['navigator']['msMaxTouchPoints']))),

  /**
   * Whether addEventListener supports W3C standard pointer events.
   * http://www.w3.org/TR/pointerevents/
   */
  POINTER_EVENTS: ('PointerEvent' in goog.global),

  /**
   * Whether addEventListener supports MSPointer events (only used in IE10).
   * http://msdn.microsoft.com/en-us/library/ie/hh772103(v=vs.85).aspx
   * http://msdn.microsoft.com/library/hh673557(v=vs.85).aspx
   */
  MSPOINTER_EVENTS: false,

  /**
   * Whether addEventListener supports {passive: true}.
   * https://developers.google.com/web/updates/2016/06/passive-event-listeners
   */
  PASSIVE_EVENTS: purify(function() {
    // If we're in a web worker or other custom environment, we can't tell.
    if (!goog.global.addEventListener || !Object.defineProperty) {  // IE 8
      return false;
    }

    var passive = false;
    var options = Object.defineProperty({}, 'passive', {
      get: function() {
        passive = true;
      }
    });
    try {
      const nullFunction = () => {};
      goog.global.addEventListener('test', nullFunction, options);
      goog.global.removeEventListener('test', nullFunction, options);
    } catch (e) {
    }

    return passive;
  })
};
