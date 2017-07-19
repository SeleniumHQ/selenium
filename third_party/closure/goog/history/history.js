// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Browser history stack management class.
 *
 * The goog.History object allows a page to create history state without leaving
 * the current document. This allows users to, for example, hit the browser's
 * back button without leaving the current page.
 *
 * The history object can be instantiated in one of two modes. In user visible
 * mode, the current history state is shown in the browser address bar as a
 * document location fragment (the portion of the URL after the '#'). These
 * addresses can be bookmarked, copied and pasted into another browser, and
 * modified directly by the user like any other URL.
 *
 * If the history object is created in invisible mode, the user can still
 * affect the state using the browser forward and back buttons, but the current
 * state is not displayed in the browser address bar. These states are not
 * bookmarkable or editable.
 *
 * It is possible to use both types of history object on the same page, but not
 * currently recommended due to browser deficiencies.
 *
 * Tested to work in:
 * <ul>
 *   <li>Firefox 1.0-4.0
 *   <li>Internet Explorer 5.5-9.0
 *   <li>Opera 9+
 *   <li>Safari 4+
 * </ul>
 *
 * @author brenneman@google.com (Shawn Brenneman)
 * @see ../demos/history1.html
 * @see ../demos/history2.html
 */

/* Some browser specific implementation notes:
 *
 * Firefox (through version 2.0.0.1):
 *
 * Ideally, navigating inside the hidden iframe could be done using
 * about:blank#state instead of a real page on the server. Setting the hash on
 * about:blank creates history entries, but the hash is not recorded and is lost
 * when the user hits the back button. This is true in Opera as well. A blank
 * HTML page must be provided for invisible states to be recorded in the iframe
 * hash.
 *
 * After leaving the page with the History object and returning to it (by
 * hitting the back button from another site), the last state of the iframe is
 * overwritten. The most recent state is saved in a hidden input field so the
 * previous state can be restored.
 *
 * Firefox does not store the previous value of dynamically generated input
 * elements. To save the state, the hidden element must be in the HTML document,
 * either in the original source or added with document.write. If a reference
 * to the input element is not provided as a constructor argument, then the
 * history object creates one using document.write, in which case the history
 * object must be created from a script in the body element of the page.
 *
 * Manually editing the address field to a different hash link prevents further
 * updates to the address bar. The page continues to work as normal, but the
 * address shown will be incorrect until the page is reloaded.
 *
 * NOTE(user): It should be noted that Firefox will URL encode any non-regular
 * ascii character, along with |space|, ", <, and >, when added to the fragment.
 * If you expect these characters in your tokens you should consider that
 * setToken('<b>') would result in the history fragment "%3Cb%3E", and
 * "esp&eacute;re" would show "esp%E8re".  (IE allows unicode characters in the
 * fragment)
 *
 * TODO(user): Should we encapsulate this escaping into the API for visible
 * history and encode all characters that aren't supported by Firefox?  It also
 * needs to be optional so apps can elect to handle the escaping themselves.
 *
 *
 * Internet Explorer (through version 7.0):
 *
 * IE does not modify the history stack when the document fragment is changed.
 * We create history entries instead by using document.open and document.write
 * into a hidden iframe.
 *
 * IE destroys the history stack when navigating from /foo.html#someFragment to
 * /foo.html. The workaround is to always append the # to the URL. This is
 * somewhat unfortunate when loading the page without any # specified, because
 * a second "click" sound will play on load as the fragment is automatically
 * appended. If the hash is always present, this can be avoided.
 *
 * Manually editing the hash in the address bar in IE6 and then hitting the back
 * button can replace the page with a blank page. This is a Bad User Experience,
 * but probably not preventable.
 *
 * IE also has a bug when the page is loaded via a server redirect, setting
 * a new hash value on the window location will force a page reload. This will
 * happen the first time setToken is called with a new token. The only known
 * workaround is to force a client reload early, for example by setting
 * window.location.hash = window.location.hash, which will otherwise be a no-op.
 *
 * Internet Explorer 8.0, Webkit 532.1 and Gecko 1.9.2:
 *
 * IE8 has introduced the support to the HTML5 onhashchange event, which means
 * we don't have to do any polling to detect fragment changes. Chrome and
 * Firefox have added it on their newer builds, wekbit 532.1 and gecko 1.9.2.
 * http://www.w3.org/TR/html5/history.html
 * NOTE(goto): it is important to note that the document needs to have the
 * <!DOCTYPE html> tag to enable the IE8 HTML5 mode. If the tag is not present,
 * IE8 will enter IE7 compatibility mode (which can also be enabled manually).
 *
 * Opera (through version 9.02):
 *
 * Navigating through pages at a rate faster than some threshold causes Opera
 * to cancel all outstanding timeouts and intervals, including the location
 * polling loop. Since this condition cannot be detected, common input events
 * are captured to cause the loop to restart.
 *
 * location.replace is adding a history entry inside setHash_, despite
 * documentation that suggests it should not.
 *
 *
 * Safari (through version 2.0.4):
 *
 * After hitting the back button, the location.hash property is no longer
 * readable from JavaScript. This is fixed in later WebKit builds, but not in
 * currently shipping Safari. For now, the only recourse is to disable history
 * states in Safari. Pages are still navigable via the History object, but the
 * back button cannot restore previous states.
 *
 * Safari sets history states on navigation to a hashlink, but doesn't allow
 * polling of the hash, so following actual anchor links in the page will create
 * useless history entries. Using location.replace does not seem to prevent
 * this. Not a terribly good user experience, but fixed in later Webkits.
 *
 *
 * WebKit (nightly version 420+):
 *
 * This almost works. Returning to a page with an invisible history object does
 * not restore the old state, however, and there is no pageshow event that fires
 * in this browser. Holding off on finding a solution for now.
 *
 *
 * HTML5 capable browsers (Firefox 4, Chrome, Safari 5)
 *
 * No known issues. The goog.history.Html5History class provides a simpler
 * implementation more suitable for recent browsers. These implementations
 * should be merged so the history class automatically invokes the correct
 * implementation.
 */


goog.provide('goog.History');
goog.provide('goog.History.Event');
goog.provide('goog.History.EventType');

goog.require('goog.Timer');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.InputType');
goog.require('goog.dom.safe');
/** @suppress {extraRequire} */
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.history.Event');
goog.require('goog.history.EventType');
goog.require('goog.html.SafeHtml');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.labs.userAgent.device');
goog.require('goog.memoize');
goog.require('goog.string');
goog.require('goog.string.Const');
goog.require('goog.userAgent');



/**
 * A history management object. Can be instantiated in user-visible mode (uses
 * the address fragment to manage state) or in hidden mode. This object should
 * be created from a script in the document body before the document has
 * finished loading.
 *
 * To store the hidden states in browsers other than IE, a hidden iframe is
 * used. It must point to a valid html page on the same domain (which can and
 * probably should be blank.)
 *
 * Sample instantiation and usage:
 *
 * <pre>
 * // Instantiate history to use the address bar for state.
 * var h = new goog.History();
 * goog.events.listen(h, goog.history.EventType.NAVIGATE, navCallback);
 * h.setEnabled(true);
 *
 * // Any changes to the location hash will call the following function.
 * function navCallback(e) {
 *   alert('Navigated to state "' + e.token + '"');
 * }
 *
 * // The history token can also be set from code directly.
 * h.setToken('foo');
 * </pre>
 *
 * @param {boolean=} opt_invisible True to use hidden history states instead of
 *     the user-visible location hash.
 * @param {!goog.html.TrustedResourceUrl=} opt_blankPageUrl A URL to a
 *     blank page on the same server. Required if opt_invisible is true.
 *     This URL is also used as the src for the iframe used to track history
 *     state in IE (if not specified the iframe is not given a src attribute).
 *     Access is Denied error may occur in IE7 if the window's URL's scheme
 *     is https, and this URL is not specified.
 * @param {HTMLInputElement=} opt_input The hidden input element to be used to
 *     store the history token.  If not provided, a hidden input element will
 *     be created using document.write.
 * @param {HTMLIFrameElement=} opt_iframe The hidden iframe that will be used by
 *     IE for pushing history state changes, or by all browsers if opt_invisible
 *     is true. If not provided, a hidden iframe element will be created using
 *     document.write.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.History = function(
    opt_invisible, opt_blankPageUrl, opt_input, opt_iframe) {
  goog.events.EventTarget.call(this);

  if (opt_invisible && !opt_blankPageUrl) {
    throw Error('Can\'t use invisible history without providing a blank page.');
  }

  var input;
  if (opt_input) {
    input = opt_input;
  } else {
    var inputId = 'history_state' + goog.History.historyCount_;
    var inputHtml = goog.html.SafeHtml.create('input', {
      type: goog.dom.InputType.TEXT,
      name: inputId,
      id: inputId,
      style: goog.string.Const.from('display:none')
    });
    goog.dom.safe.documentWrite(document, inputHtml);
    input = goog.dom.getElement(inputId);
  }

  /**
   * An input element that stores the current iframe state. Used to restore
   * the state when returning to the page on non-IE browsers.
   * @type {HTMLInputElement}
   * @private
   */
  this.hiddenInput_ = /** @type {HTMLInputElement} */ (input);

  /**
   * The window whose location contains the history token fragment. This is
   * the window that contains the hidden input. It's typically the top window.
   * It is not necessarily the same window that the js code is loaded in.
   * @type {Window}
   * @private
   */
  this.window_ = opt_input ?
      goog.dom.getWindow(goog.dom.getOwnerDocument(opt_input)) :
      window;

  /**
   * The base URL for the hidden iframe. Must refer to a document in the
   * same domain as the main page.
   * @type {!goog.html.TrustedResourceUrl|undefined}
   * @private
   */
  this.iframeSrc_ = opt_blankPageUrl;

  if (goog.userAgent.IE && !opt_blankPageUrl) {
    if (window.location.protocol == 'https') {
      this.iframeSrc_ = goog.html.TrustedResourceUrl.fromConstant(
          goog.string.Const.from('https:///'));
    } else {
      this.iframeSrc_ = goog.html.TrustedResourceUrl.fromConstant(
          goog.string.Const.from('javascript:""'));
    }
  }

  /**
   * A timer for polling the current history state for changes.
   * @type {goog.Timer}
   * @private
   */
  this.timer_ = new goog.Timer(goog.History.PollingType.NORMAL);
  this.registerDisposable(this.timer_);

  /**
   * True if the state tokens are displayed in the address bar, false for hidden
   * history states.
   * @type {boolean}
   * @private
   */
  this.userVisible_ = !opt_invisible;

  /**
   * An object to keep track of the history event listeners.
   * @type {goog.events.EventHandler<!goog.History>}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

  if (opt_invisible || goog.History.LEGACY_IE) {
    var iframe;
    if (opt_iframe) {
      iframe = opt_iframe;
    } else {
      var iframeId = 'history_iframe' + goog.History.historyCount_;
      // Using a "sandbox" attribute on the iframe might be possible, but
      // this HTML didn't initially have it and when it was refactored
      // to SafeHtml it was kept without it.
      var iframeHtml = goog.html.SafeHtml.createIframe(this.iframeSrc_, null, {
        id: iframeId,
        style: goog.string.Const.from('display:none'),
        sandbox: undefined
      });
      goog.dom.safe.documentWrite(document, iframeHtml);
      iframe = goog.dom.getElement(iframeId);
    }

    /**
     * Internet Explorer uses a hidden iframe for all history changes. Other
     * browsers use the iframe only for pushing invisible states.
     * @type {HTMLIFrameElement}
     * @private
     */
    this.iframe_ = /** @type {HTMLIFrameElement} */ (iframe);

    /**
     * Whether the hidden iframe has had a document written to it yet in this
     * session.
     * @type {boolean}
     * @private
     */
    this.unsetIframe_ = true;
  }

  if (goog.History.LEGACY_IE) {
    // IE relies on the hidden input to restore the history state from previous
    // sessions, but input values are only restored after window.onload. Set up
    // a callback to poll the value after the onload event.
    this.eventHandler_.listen(
        this.window_, goog.events.EventType.LOAD, this.onDocumentLoaded);

    /**
     * IE-only variable for determining if the document has loaded.
     * @type {boolean}
     * @protected
     */
    this.documentLoaded = false;

    /**
     * IE-only variable for storing whether the history object should be enabled
     * once the document finishes loading.
     * @type {boolean}
     * @private
     */
    this.shouldEnable_ = false;
  }

  // Set the initial history state.
  if (this.userVisible_) {
    this.setHash_(this.getToken(), true);
  } else {
    this.setIframeToken_(this.hiddenInput_.value);
  }

  goog.History.historyCount_++;
};
goog.inherits(goog.History, goog.events.EventTarget);


/**
 * Status of when the object is active and dispatching events.
 * @type {boolean}
 * @private
 */
goog.History.prototype.enabled_ = false;


/**
 * Whether the object is performing polling with longer intervals. This can
 * occur for instance when setting the location of the iframe when in invisible
 * mode and the server that is hosting the blank html page is down. In FF, this
 * will cause the location of the iframe to no longer be accessible, with
 * permision denied exceptions being thrown on every access of the history
 * token. When this occurs, the polling interval is elongated. This causes
 * exceptions to be thrown at a lesser rate while allowing for the history
 * object to resurrect itself when the html page becomes accessible.
 * @type {boolean}
 * @private
 */
goog.History.prototype.longerPolling_ = false;


/**
 * The last token set by the history object, used to poll for changes.
 * @type {?string}
 * @private
 */
goog.History.prototype.lastToken_ = null;


/**
 * Whether the browser supports HTML5 history management's onhashchange event.
 * {@link http://www.w3.org/TR/html5/history.html}. IE 9 in compatibility mode
 * indicates that onhashchange is in window, but testing reveals the event
 * isn't actually fired.
 * @return {boolean} Whether onhashchange is supported.
 */
goog.History.isOnHashChangeSupported = goog.memoize(function() {
  return goog.userAgent.IE ? goog.userAgent.isDocumentModeOrHigher(8) :
                             'onhashchange' in goog.global;
});


/**
 * Whether the current browser is Internet Explorer prior to version 8. Many IE
 * specific workarounds developed before version 8 are unnecessary in more
 * current versions.
 * @type {boolean}
 */
goog.History.LEGACY_IE =
    goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(8);


/**
 * Whether the browser always requires the hash to be present. Internet Explorer
 * before version 8 will reload the HTML page if the hash is omitted.
 * @type {boolean}
 */
goog.History.HASH_ALWAYS_REQUIRED = goog.History.LEGACY_IE;


/**
 * If not null, polling in the user invisible mode will be disabled until this
 * token is seen. This is used to prevent a race condition where the iframe
 * hangs temporarily while the location is changed.
 * @type {?string}
 * @private
 */
goog.History.prototype.lockedToken_ = null;


/** @override */
goog.History.prototype.disposeInternal = function() {
  goog.History.superClass_.disposeInternal.call(this);
  this.eventHandler_.dispose();
  this.setEnabled(false);
};


/**
 * Starts or stops the History polling loop. When enabled, the History object
 * will immediately fire an event for the current location. The caller can set
 * up event listeners between the call to the constructor and the call to
 * setEnabled.
 *
 * On IE, actual startup may be delayed until the iframe and hidden input
 * element have been loaded and can be polled. This behavior is transparent to
 * the caller.
 *
 * @param {boolean} enable Whether to enable the history polling loop.
 */
goog.History.prototype.setEnabled = function(enable) {

  if (enable == this.enabled_) {
    return;
  }

  if (goog.History.LEGACY_IE && !this.documentLoaded) {
    // Wait until the document has actually loaded before enabling the
    // object or any saved state from a previous session will be lost.
    this.shouldEnable_ = enable;
    return;
  }

  if (enable) {
    if (goog.userAgent.OPERA) {
      // Capture events for common user input so we can restart the timer in
      // Opera if it fails. Yes, this is distasteful. See operaDefibrillator_.
      this.eventHandler_.listen(
          this.window_.document, goog.History.INPUT_EVENTS_,
          this.operaDefibrillator_);
    } else if (goog.userAgent.GECKO) {
      // Firefox will not restore the correct state after navigating away from
      // and then back to the page with the history object. This can be fixed
      // by restarting the history object on the pageshow event.
      this.eventHandler_.listen(this.window_, 'pageshow', this.onShow_);
    }

    // TODO(user): make HTML5 and invisible history work by listening to the
    // iframe # changes instead of the window.
    if (goog.History.isOnHashChangeSupported() && this.userVisible_) {
      this.eventHandler_.listen(
          this.window_, goog.events.EventType.HASHCHANGE, this.onHashChange_);
      this.enabled_ = true;
      this.dispatchEvent(new goog.history.Event(this.getToken(), false));
    } else if (
        !(goog.userAgent.IE && !goog.labs.userAgent.device.isMobile()) ||
        this.documentLoaded) {
      // Start dispatching history events if all necessary loading has
      // completed (always true for browsers other than IE.)
      this.eventHandler_.listen(
          this.timer_, goog.Timer.TICK, goog.bind(this.check_, this, true));

      this.enabled_ = true;

      // Initialize last token at startup except on IE < 8, where the last token
      // must only be set in conjunction with IFRAME updates, or the IFRAME will
      // start out of sync and remove any pre-existing URI fragment.
      if (!goog.History.LEGACY_IE) {
        this.lastToken_ = this.getToken();
        this.dispatchEvent(new goog.history.Event(this.getToken(), false));
      }

      this.timer_.start();
    }

  } else {
    this.enabled_ = false;
    this.eventHandler_.removeAll();
    this.timer_.stop();
  }
};


/**
 * Callback for the window onload event in IE. This is necessary to read the
 * value of the hidden input after restoring a history session. The value of
 * input elements is not viewable until after window onload for some reason (the
 * iframe state is similarly unavailable during the loading phase.)  If
 * setEnabled is called before the iframe has completed loading, the history
 * object will actually be enabled at this point.
 * @protected
 */
goog.History.prototype.onDocumentLoaded = function() {
  this.documentLoaded = true;

  if (this.hiddenInput_.value) {
    // Any saved value in the hidden input can only be read after the document
    // has been loaded due to an IE limitation. Restore the previous state if
    // it has been set.
    this.setIframeToken_(this.hiddenInput_.value, true);
  }

  this.setEnabled(this.shouldEnable_);
};


/**
 * Handler for the Gecko pageshow event. Restarts the history object so that the
 * correct state can be restored in the hash or iframe.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.History.prototype.onShow_ = function(e) {
  // NOTE(user): persisted is a property passed in the pageshow event that
  // indicates whether the page is being persisted from the cache or is being
  // loaded for the first time.
  if (e.getBrowserEvent()['persisted']) {
    this.setEnabled(false);
    this.setEnabled(true);
  }
};


/**
 * Handles HTML5 onhashchange events on browsers where it is supported.
 * This is very similar to {@link #check_}, except that it is not executed
 * continuously. It is only used when
 * {@code goog.History.isOnHashChangeSupported()} is true.
 * @param {goog.events.BrowserEvent} e The browser event.
 * @private
 */
goog.History.prototype.onHashChange_ = function(e) {
  var hash = this.getLocationFragment_(this.window_);
  if (hash != this.lastToken_) {
    this.update_(hash, true);
  }
};


/**
 * @return {string} The current token.
 */
goog.History.prototype.getToken = function() {
  if (this.lockedToken_ != null) {
    return this.lockedToken_;
  } else if (this.userVisible_) {
    return this.getLocationFragment_(this.window_);
  } else {
    return this.getIframeToken_() || '';
  }
};


/**
 * Sets the history state. When user visible states are used, the URL fragment
 * will be set to the provided token.  Sometimes it is necessary to set the
 * history token before the document title has changed, in this case IE's
 * history drop down can be out of sync with the token.  To get around this
 * problem, the app can pass in a title to use with the hidden iframe.
 * @param {string} token The history state identifier.
 * @param {string=} opt_title Optional title used when setting the hidden iframe
 *     title in IE.
 */
goog.History.prototype.setToken = function(token, opt_title) {
  this.setHistoryState_(token, false, opt_title);
};


/**
 * Replaces the current history state without affecting the rest of the history
 * stack.
 * @param {string} token The history state identifier.
 * @param {string=} opt_title Optional title used when setting the hidden iframe
 *     title in IE.
 */
goog.History.prototype.replaceToken = function(token, opt_title) {
  this.setHistoryState_(token, true, opt_title);
};


/**
 * Gets the location fragment for the current URL.  We don't use location.hash
 * directly as the browser helpfully urlDecodes the string for us which can
 * corrupt the tokens.  For example, if we want to store: label/%2Froot it would
 * be returned as label//root.
 * @param {Window} win The window object to use.
 * @return {string} The fragment.
 * @private
 */
goog.History.prototype.getLocationFragment_ = function(win) {
  var href = win.location.href;
  var index = href.indexOf('#');
  return index < 0 ? '' : href.substring(index + 1);
};


/**
 * Sets the history state. When user visible states are used, the URL fragment
 * will be set to the provided token. Setting opt_replace to true will cause the
 * navigation to occur, but will replace the current history entry without
 * affecting the length of the stack.
 *
 * @param {string} token The history state identifier.
 * @param {boolean} replace Set to replace the current history entry instead of
 *    appending a new history state.
 * @param {string=} opt_title Optional title used when setting the hidden iframe
 *     title in IE.
 * @private
 */
goog.History.prototype.setHistoryState_ = function(token, replace, opt_title) {
  if (this.getToken() != token) {
    if (this.userVisible_) {
      this.setHash_(token, replace);

      if (!goog.History.isOnHashChangeSupported()) {
        if (goog.userAgent.IE && !goog.labs.userAgent.device.isMobile()) {
          // IE must save state using the iframe.
          this.setIframeToken_(token, replace, opt_title);
        }
      }

      // This condition needs to be called even if
      // goog.History.isOnHashChangeSupported() is true so the NAVIGATE event
      // fires sychronously.
      if (this.enabled_) {
        this.check_(false);
      }
    } else {
      // Fire the event immediately so that setting history is synchronous, but
      // set a suspendToken so that polling doesn't trigger a 'back'.
      this.setIframeToken_(token, replace);
      this.lockedToken_ = this.lastToken_ = this.hiddenInput_.value = token;
      this.dispatchEvent(new goog.history.Event(token, false));
    }
  }
};


/**
 * Sets or replaces the URL fragment. The token does not need to be URL encoded
 * according to the URL specification, though certain characters (like newline)
 * are automatically stripped.
 *
 * If opt_replace is not set, non-IE browsers will append a new entry to the
 * history list. Setting the hash does not affect the history stack in IE
 * (unless there is a pre-existing named anchor for that hash.)
 *
 * Older versions of Webkit cannot query the location hash, but it still can be
 * set. If we detect one of these versions, always replace instead of creating
 * new history entries.
 *
 * window.location.replace replaces the current state from the history stack.
 * http://www.whatwg.org/specs/web-apps/current-work/#dom-location-replace
 * http://www.whatwg.org/specs/web-apps/current-work/#replacement-enabled
 *
 * @param {string} token The new string to set.
 * @param {boolean=} opt_replace Set to true to replace the current token
 *    without appending a history entry.
 * @private
 */
goog.History.prototype.setHash_ = function(token, opt_replace) {
  // If the page uses a BASE element, setting location.hash directly will
  // navigate away from the current document. Also, the original URL path may
  // possibly change from HTML5 history pushState. To account for these, the
  // full path is always specified.
  var loc = this.window_.location;
  var url = loc.href.split('#')[0];

  // If a hash has already been set, then removing it programmatically will
  // reload the page. Once there is a hash, we won't remove it.
  var hasHash = goog.string.contains(loc.href, '#');

  if (goog.History.HASH_ALWAYS_REQUIRED || hasHash || token) {
    url += '#' + token;
  }

  if (url != loc.href) {
    if (opt_replace) {
      loc.replace(url);
    } else {
      loc.href = url;
    }
  }
};


/**
 * Sets the hidden iframe state. On IE, this is accomplished by writing a new
 * document into the iframe. In Firefox, the iframe's URL fragment stores the
 * state instead.
 *
 * Older versions of webkit cannot set the iframe, so ignore those browsers.
 *
 * @param {string} token The new string to set.
 * @param {boolean=} opt_replace Set to true to replace the current iframe state
 *     without appending a new history entry.
 * @param {string=} opt_title Optional title used when setting the hidden iframe
 *     title in IE.
 * @private
 */
goog.History.prototype.setIframeToken_ = function(
    token, opt_replace, opt_title) {
  if (this.unsetIframe_ || token != this.getIframeToken_()) {
    this.unsetIframe_ = false;
    token = goog.string.urlEncode(token);

    if (goog.userAgent.IE) {
      // Caching the iframe document results in document permission errors after
      // leaving the page and returning. Access it anew each time instead.
      var doc = goog.dom.getFrameContentDocument(this.iframe_);

      doc.open('text/html', opt_replace ? 'replace' : undefined);
      var iframeSourceHtml = goog.html.SafeHtml.concat(
          goog.html.SafeHtml.create(
              'title', {}, (opt_title || this.window_.document.title)),
          goog.html.SafeHtml.create('body', {}, token));
      goog.dom.safe.documentWrite(doc, iframeSourceHtml);
      doc.close();
    } else {
      goog.asserts.assertInstanceof(
          this.iframeSrc_, goog.html.TrustedResourceUrl,
          'this.iframeSrc_ must be set on calls to setIframeToken_');
      var url =
          goog.html.TrustedResourceUrl.unwrap(
              /** @type {!goog.html.TrustedResourceUrl} */ (this.iframeSrc_)) +
          '#' + token;

      // In Safari, it is possible for the contentWindow of the iframe to not
      // be present when the page is loading after a reload.
      var contentWindow = this.iframe_.contentWindow;
      if (contentWindow) {
        if (opt_replace) {
          contentWindow.location.replace(url);
        } else {
          contentWindow.location.href = url;
        }
      }
    }
  }
};


/**
 * Return the current state string from the hidden iframe. On internet explorer,
 * this is stored as a string in the document body. Other browsers use the
 * location hash of the hidden iframe.
 *
 * Older versions of webkit cannot access the iframe location, so always return
 * null in that case.
 *
 * @return {?string} The state token saved in the iframe (possibly null if the
 *     iframe has never loaded.).
 * @private
 */
goog.History.prototype.getIframeToken_ = function() {
  if (goog.userAgent.IE) {
    var doc = goog.dom.getFrameContentDocument(this.iframe_);
    return doc.body ? goog.string.urlDecode(doc.body.innerHTML) : null;
  } else {
    // In Safari, it is possible for the contentWindow of the iframe to not
    // be present when the page is loading after a reload.
    var contentWindow = this.iframe_.contentWindow;
    if (contentWindow) {
      var hash;

      try {
        // Iframe tokens are urlEncoded
        hash = goog.string.urlDecode(this.getLocationFragment_(contentWindow));
      } catch (e) {
        // An exception will be thrown if the location of the iframe can not be
        // accessed (permission denied). This can occur in FF if the the server
        // that is hosting the blank html page goes down and then a new history
        // token is set. The iframe will navigate to an error page, and the
        // location of the iframe can no longer be accessed. Due to the polling,
        // this will cause constant exceptions to be thrown. In this case,
        // we enable longer polling. We do not have to attempt to reset the
        // iframe token because (a) we already fired the NAVIGATE event when
        // setting the token, (b) we can rely on the locked token for current
        // state, and (c) the token is still in the history and
        // accesible on forward/back.
        if (!this.longerPolling_) {
          this.setLongerPolling_(true);
        }

        return null;
      }

      // There was no exception when getting the hash so turn off longer polling
      // if it is on.
      if (this.longerPolling_) {
        this.setLongerPolling_(false);
      }

      return hash || null;
    } else {
      return null;
    }
  }
};


/**
 * Checks the state of the document fragment and the iframe title to detect
 * navigation changes. If {@code goog.HistoryisOnHashChangeSupported()} is
 * {@code false}, then this runs approximately twenty times per second.
 * @param {boolean} isNavigation True if the event was initiated by a browser
 *     action, false if it was caused by a setToken call. See
 *     {@link goog.history.Event}.
 * @private
 */
goog.History.prototype.check_ = function(isNavigation) {
  if (this.userVisible_) {
    var hash = this.getLocationFragment_(this.window_);
    if (hash != this.lastToken_) {
      this.update_(hash, isNavigation);
    }
  }

  // Old IE uses the iframe for both visible and non-visible versions.
  if (!this.userVisible_ || goog.History.LEGACY_IE) {
    var token = this.getIframeToken_() || '';
    if (this.lockedToken_ == null || token == this.lockedToken_) {
      this.lockedToken_ = null;
      if (token != this.lastToken_) {
        this.update_(token, isNavigation);
      }
    }
  }
};


/**
 * Updates the current history state with a given token. Called after a change
 * to the location or the iframe state is detected by poll_.
 *
 * @param {string} token The new history state.
 * @param {boolean} isNavigation True if the event was initiated by a browser
 *     action, false if it was caused by a setToken call. See
 *     {@link goog.history.Event}.
 * @private
 */
goog.History.prototype.update_ = function(token, isNavigation) {
  this.lastToken_ = this.hiddenInput_.value = token;

  if (this.userVisible_) {
    if (goog.History.LEGACY_IE) {
      this.setIframeToken_(token);
    }

    this.setHash_(token);
  } else {
    this.setIframeToken_(token);
  }

  this.dispatchEvent(new goog.history.Event(this.getToken(), isNavigation));
};


/**
 * Sets if the history oject should use longer intervals when polling.
 *
 * @param {boolean} longerPolling Whether to enable longer polling.
 * @private
 */
goog.History.prototype.setLongerPolling_ = function(longerPolling) {
  if (this.longerPolling_ != longerPolling) {
    this.timer_.setInterval(
        longerPolling ? goog.History.PollingType.LONG :
                        goog.History.PollingType.NORMAL);
  }
  this.longerPolling_ = longerPolling;
};


/**
 * Opera cancels all outstanding timeouts and intervals after any rapid
 * succession of navigation events, including the interval used to detect
 * navigation events. This function restarts the interval so that navigation can
 * continue. Ideally, only events which would be likely to cause a navigation
 * change (mousedown and keydown) would be bound to this function. Since Opera
 * seems to ignore keydown events while the alt key is pressed (such as
 * alt-left or right arrow), this function is also bound to the much more
 * frequent mousemove event. This way, when the update loop freezes, it will
 * unstick itself as the user wiggles the mouse in frustration.
 * @private
 */
goog.History.prototype.operaDefibrillator_ = function() {
  this.timer_.stop();
  this.timer_.start();
};


/**
 * List of user input event types registered in Opera to restart the history
 * timer (@see goog.History#operaDefibrillator_).
 * @type {Array<string>}
 * @private
 */
goog.History.INPUT_EVENTS_ = [
  goog.events.EventType.MOUSEDOWN, goog.events.EventType.KEYDOWN,
  goog.events.EventType.MOUSEMOVE
];


/**
 * Counter for the number of goog.History objects that have been instantiated.
 * Used to create unique IDs.
 * @type {number}
 * @private
 */
goog.History.historyCount_ = 0;


/**
 * Types of polling. The values are in ms of the polling interval.
 * @enum {number}
 */
goog.History.PollingType = {
  NORMAL: 150,
  LONG: 10000
};


/**
 * Constant for the history change event type.
 * @enum {string}
 * @deprecated Use goog.history.EventType.
 */
goog.History.EventType = goog.history.EventType;



/**
 * Constant for the history change event type.
 * @constructor
 * @deprecated Use goog.history.Event.
 * @final
 */
goog.History.Event = goog.history.Event;
