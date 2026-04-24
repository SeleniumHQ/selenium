/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

goog.provide('goog.events.EventType');

goog.require('goog.events.eventTypeHelpers');
goog.require('goog.userAgent');


/**
 * Constants for event names.
 * @enum {string}
 */
goog.events.EventType = {
  // Mouse events
  CLICK: 'click',
  RIGHTCLICK: 'rightclick',
  DBLCLICK: 'dblclick',
  AUXCLICK: 'auxclick',
  MOUSEDOWN: 'mousedown',
  MOUSEUP: 'mouseup',
  MOUSEOVER: 'mouseover',
  MOUSEOUT: 'mouseout',
  MOUSEMOVE: 'mousemove',
  MOUSEENTER: 'mouseenter',
  MOUSELEAVE: 'mouseleave',

  // Non-existent event; will never fire. This exists as a mouse counterpart to
  // POINTERCANCEL.
  MOUSECANCEL: 'mousecancel',

  // Selection events.
  // https://www.w3.org/TR/selection-api/
  SELECTIONCHANGE: 'selectionchange',
  SELECTSTART: 'selectstart',  // IE, Safari, Chrome

  // Wheel events
  // http://www.w3.org/TR/DOM-Level-3-Events/#events-wheelevents
  WHEEL: 'wheel',

  // Key events
  KEYPRESS: 'keypress',
  KEYDOWN: 'keydown',
  KEYUP: 'keyup',

  // Focus
  BLUR: 'blur',
  FOCUS: 'focus',
  DEACTIVATE: 'deactivate',  // IE only
  FOCUSIN: 'focusin',
  FOCUSOUT: 'focusout',

  // Forms
  CHANGE: 'change',
  RESET: 'reset',
  SELECT: 'select',
  SUBMIT: 'submit',
  INPUT: 'input',
  PROPERTYCHANGE: 'propertychange',  // IE only

  // Drag and drop
  DRAGSTART: 'dragstart',
  DRAG: 'drag',
  DRAGENTER: 'dragenter',
  DRAGOVER: 'dragover',
  DRAGLEAVE: 'dragleave',
  DROP: 'drop',
  DRAGEND: 'dragend',

  // Touch events
  // Note that other touch events exist, but we should follow the W3C list here.
  // http://www.w3.org/TR/touch-events/#list-of-touchevent-types
  TOUCHSTART: 'touchstart',
  TOUCHMOVE: 'touchmove',
  TOUCHEND: 'touchend',
  TOUCHCANCEL: 'touchcancel',

  // Misc
  BEFOREUNLOAD: 'beforeunload',
  CONSOLEMESSAGE: 'consolemessage',
  CONTEXTMENU: 'contextmenu',
  DEVICECHANGE: 'devicechange',
  DEVICEMOTION: 'devicemotion',
  DEVICEORIENTATION: 'deviceorientation',
  DOMCONTENTLOADED: 'DOMContentLoaded',
  ERROR: 'error',
  HELP: 'help',
  LOAD: 'load',
  LOSECAPTURE: 'losecapture',
  ORIENTATIONCHANGE: 'orientationchange',
  READYSTATECHANGE: 'readystatechange',
  RESIZE: 'resize',
  SCROLL: 'scroll',
  UNLOAD: 'unload',

  // Media events
  CANPLAY: 'canplay',
  CANPLAYTHROUGH: 'canplaythrough',
  DURATIONCHANGE: 'durationchange',
  EMPTIED: 'emptied',
  ENDED: 'ended',
  LOADEDDATA: 'loadeddata',
  LOADEDMETADATA: 'loadedmetadata',
  PAUSE: 'pause',
  PLAY: 'play',
  PLAYING: 'playing',
  PROGRESS: 'progress',
  RATECHANGE: 'ratechange',
  SEEKED: 'seeked',
  SEEKING: 'seeking',
  STALLED: 'stalled',
  SUSPEND: 'suspend',
  TIMEUPDATE: 'timeupdate',
  VOLUMECHANGE: 'volumechange',
  WAITING: 'waiting',

  // Media Source Extensions events
  // https://www.w3.org/TR/media-source/#mediasource-events
  SOURCEOPEN: 'sourceopen',
  SOURCEENDED: 'sourceended',
  SOURCECLOSED: 'sourceclosed',
  // https://www.w3.org/TR/media-source/#sourcebuffer-events
  ABORT: 'abort',
  UPDATE: 'update',
  UPDATESTART: 'updatestart',
  UPDATEEND: 'updateend',

  // HTML 5 History events
  // See http://www.w3.org/TR/html5/browsers.html#event-definitions-0
  HASHCHANGE: 'hashchange',
  PAGEHIDE: 'pagehide',
  PAGESHOW: 'pageshow',
  POPSTATE: 'popstate',

  // Copy and Paste
  // Support is limited. Make sure it works on your favorite browser
  // before using.
  // http://www.quirksmode.org/dom/events/cutcopypaste.html
  COPY: 'copy',
  PASTE: 'paste',
  CUT: 'cut',
  BEFORECOPY: 'beforecopy',
  BEFORECUT: 'beforecut',
  BEFOREPASTE: 'beforepaste',

  // HTML5 online/offline events.
  // http://www.w3.org/TR/offline-webapps/#related
  ONLINE: 'online',
  OFFLINE: 'offline',

  // HTML 5 worker events
  MESSAGE: 'message',
  CONNECT: 'connect',

  // Service Worker Events - ServiceWorkerGlobalScope context
  // See https://w3c.github.io/ServiceWorker/#execution-context-events
  // Note: message event defined in worker events section
  INSTALL: 'install',
  ACTIVATE: 'activate',
  FETCH: 'fetch',
  FOREIGNFETCH: 'foreignfetch',
  MESSAGEERROR: 'messageerror',

  // Service Worker Events - Document context
  // See https://w3c.github.io/ServiceWorker/#document-context-events
  STATECHANGE: 'statechange',
  UPDATEFOUND: 'updatefound',
  CONTROLLERCHANGE: 'controllerchange',

  // CSS animation events.
  ANIMATIONSTART:
      goog.events.eventTypeHelpers.getVendorPrefixedName('AnimationStart'),
  ANIMATIONEND:
      goog.events.eventTypeHelpers.getVendorPrefixedName('AnimationEnd'),
  ANIMATIONITERATION:
      goog.events.eventTypeHelpers.getVendorPrefixedName('AnimationIteration'),

  // CSS transition events. Based on the browser support described at:
  // https://developer.mozilla.org/en/css/css_transitions#Browser_compatibility
  TRANSITIONEND:
      goog.events.eventTypeHelpers.getVendorPrefixedName('TransitionEnd'),

  // W3C Pointer Events
  // http://www.w3.org/TR/pointerevents/
  POINTERDOWN: 'pointerdown',
  POINTERUP: 'pointerup',
  POINTERCANCEL: 'pointercancel',
  POINTERMOVE: 'pointermove',
  POINTEROVER: 'pointerover',
  POINTEROUT: 'pointerout',
  POINTERENTER: 'pointerenter',
  POINTERLEAVE: 'pointerleave',
  GOTPOINTERCAPTURE: 'gotpointercapture',
  LOSTPOINTERCAPTURE: 'lostpointercapture',

  // IE specific events.
  // See http://msdn.microsoft.com/en-us/library/ie/hh772103(v=vs.85).aspx
  // Note: these events will be supplanted in IE11.
  MSGESTURECHANGE: 'MSGestureChange',
  MSGESTUREEND: 'MSGestureEnd',
  MSGESTUREHOLD: 'MSGestureHold',
  MSGESTURESTART: 'MSGestureStart',
  MSGESTURETAP: 'MSGestureTap',
  MSGOTPOINTERCAPTURE: 'MSGotPointerCapture',
  MSINERTIASTART: 'MSInertiaStart',
  MSLOSTPOINTERCAPTURE: 'MSLostPointerCapture',
  MSPOINTERCANCEL: 'MSPointerCancel',
  MSPOINTERDOWN: 'MSPointerDown',
  MSPOINTERENTER: 'MSPointerEnter',
  MSPOINTERHOVER: 'MSPointerHover',
  MSPOINTERLEAVE: 'MSPointerLeave',
  MSPOINTERMOVE: 'MSPointerMove',
  MSPOINTEROUT: 'MSPointerOut',
  MSPOINTEROVER: 'MSPointerOver',
  MSPOINTERUP: 'MSPointerUp',

  // Native IMEs/input tools events.
  TEXT: 'text',
  // The textInput event is supported in IE9+, but only in lower case. All other
  // browsers use the camel-case event name.
  TEXTINPUT: goog.userAgent.IE ? 'textinput' : 'textInput',
  COMPOSITIONSTART: 'compositionstart',
  COMPOSITIONUPDATE: 'compositionupdate',
  COMPOSITIONEND: 'compositionend',

  // The beforeinput event is initially only supported in Safari. See
  // https://bugs.chromium.org/p/chromium/issues/detail?id=342670 for Chrome
  // implementation tracking.
  BEFOREINPUT: 'beforeinput',

  // Fullscreen API events. See https://fullscreen.spec.whatwg.org/.
  FULLSCREENCHANGE: 'fullscreenchange',
  // iOS-only fullscreen events. See
  // https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/ControllingMediaWithJavaScript/ControllingMediaWithJavaScript.html
  WEBKITBEGINFULLSCREEN: 'webkitbeginfullscreen',
  WEBKITENDFULLSCREEN: 'webkitendfullscreen',

  // Webview tag events
  // See https://developer.chrome.com/apps/tags/webview
  EXIT: 'exit',
  LOADABORT: 'loadabort',
  LOADCOMMIT: 'loadcommit',
  LOADREDIRECT: 'loadredirect',
  LOADSTART: 'loadstart',
  LOADSTOP: 'loadstop',
  RESPONSIVE: 'responsive',
  SIZECHANGED: 'sizechanged',
  UNRESPONSIVE: 'unresponsive',

  // HTML5 Page Visibility API.  See details at
  // `goog.labs.dom.PageVisibilityMonitor`.
  VISIBILITYCHANGE: 'visibilitychange',

  // LocalStorage event.
  STORAGE: 'storage',

  // DOM Level 2 mutation events (deprecated).
  DOMSUBTREEMODIFIED: 'DOMSubtreeModified',
  DOMNODEINSERTED: 'DOMNodeInserted',
  DOMNODEREMOVED: 'DOMNodeRemoved',
  DOMNODEREMOVEDFROMDOCUMENT: 'DOMNodeRemovedFromDocument',
  DOMNODEINSERTEDINTODOCUMENT: 'DOMNodeInsertedIntoDocument',
  DOMATTRMODIFIED: 'DOMAttrModified',
  DOMCHARACTERDATAMODIFIED: 'DOMCharacterDataModified',

  // Print events.
  BEFOREPRINT: 'beforeprint',
  AFTERPRINT: 'afterprint',

  // Web app manifest events.
  BEFOREINSTALLPROMPT: 'beforeinstallprompt',
  APPINSTALLED: 'appinstalled',

  // Web Animation API (WAAPI) playback events
  // https://www.w3.org/TR/web-animations-1/#animation-playback-event-types
  CANCEL: 'cancel',
  FINISH: 'finish',
  REMOVE: 'remove'
};
