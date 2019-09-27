// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Wrapper on a Flash object embedded in the HTML page.
 * This class contains routines for writing the HTML to create the Flash object
 * using a goog.ui.Component approach. Tested on Firefox 1.5, 2 and 3, IE6, 7,
 * Konqueror, Chrome and Safari.
 *
 * Based on http://go/flashobject.js
 *
 * Based on the following compatibility test suite:
 * http://www.bobbyvandersluis.com/flashembed/testsuite/
 *
 * TODO(user): take a look at swfobject, and maybe use it instead of the current
 * flash embedding method.
 *
 * Examples of usage:
 *
 * <pre>
 *   var url = goog.html.TrustedResourceUrl.fromConstant(
 *       goog.string.Const.from('https://hostname/flash.swf'))
 *   var flash = new goog.ui.media.FlashObject(url);
 *   flash.setFlashVar('myvar', 'foo');
 *   flash.render(goog.dom.getElement('parent'));
 * </pre>
 *
 * TODO(user, jessan): create a goog.ui.media.BrowserInterfaceFlashObject that
 * subclasses goog.ui.media.FlashObject to provide all the goodness of
 * http://go/browserinterface.as
 *
 */

goog.provide('goog.ui.media.FlashObject');
goog.provide('goog.ui.media.FlashObject.ScriptAccessLevel');
goog.provide('goog.ui.media.FlashObject.Wmodes');

goog.require('goog.asserts');
goog.require('goog.dom.TagName');
goog.require('goog.dom.safe');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.html.flash');
goog.require('goog.log');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.structs.Map');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.userAgent');
goog.require('goog.userAgent.flash');



/**
 * A very simple flash wrapper, that allows you to create flash object
 * programmatically, instead of embedding your own HTML. It extends
 * {@link goog.ui.Component}, which makes it very easy to be embedded on the
 * page.
 *
 * @param {!goog.html.TrustedResourceUrl} flashUrl The Flash SWF URL.
 * @param {goog.dom.DomHelper=} opt_domHelper An optional DomHelper.
 * @extends {goog.ui.Component}
 * @constructor
 */
goog.ui.media.FlashObject = function(flashUrl, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * The URL of the flash movie to be embedded.
   *
   * @type {!goog.html.TrustedResourceUrl}
   * @private
   */
  this.flashUrl_ = flashUrl;

  /**
   * An event handler used to handle events consistently between browsers.
   * @type {goog.events.EventHandler<!goog.ui.media.FlashObject>}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

  /**
   * A map of variables to be passed to the flash movie.
   *
   * @type {goog.structs.Map}
   * @private
   */
  this.flashVars_ = new goog.structs.Map();
};
goog.inherits(goog.ui.media.FlashObject, goog.ui.Component);


/**
 * Different states of loaded-ness in which the SWF itself can be
 *
 * Talked about at:
 * http://kb.adobe.com/selfservice/viewContent.do?externalId=tn_12059&sliceId=1
 *
 * @enum {number}
 * @private
 */
goog.ui.media.FlashObject.SwfReadyStates_ = {
  LOADING: 0,
  UNINITIALIZED: 1,
  LOADED: 2,
  INTERACTIVE: 3,
  COMPLETE: 4
};


/**
 * IE specific ready states.
 *
 * @see https://msdn.microsoft.com/en-us/library/ms534359(v=vs.85).aspx
 * @enum {string}
 * @private
 */
goog.ui.media.FlashObject.IeSwfReadyStates_ = {
  LOADING: 'loading',
  UNINITIALIZED: 'uninitialized',
  LOADED: 'loaded',
  INTERACTIVE: 'interactive',
  COMPLETE: 'complete'
};


/**
 * The different modes for displaying a SWF. Note that different wmodes
 * can result in different bugs in different browsers and also that
 * both OPAQUE and TRANSPARENT will result in a performance hit.
 *
 * @enum {string}
 */
goog.ui.media.FlashObject.Wmodes = {
  /**
   * Allows for z-ordering of the SWF.
   */
  OPAQUE: 'opaque',

  /**
   * Allows for z-ordering of the SWF and plays the SWF with a transparent BG.
   */
  TRANSPARENT: 'transparent',

  /**
   * The default wmode. Does not allow for z-ordering of the SWF.
   */
  WINDOW: 'window'
};


/**
 * The different levels of allowScriptAccess.
 *
 * Talked about at:
 * http://kb2.adobe.com/cps/164/tn_16494.html
 *
 * @enum {string}
 */
goog.ui.media.FlashObject.ScriptAccessLevel = {
  /*
   * The flash object can always communicate with its container page.
   */
  ALWAYS: 'always',

  /*
   * The flash object can only communicate with its container page if they are
   * hosted in the same domain.
   */
  SAME_DOMAIN: 'sameDomain',

  /*
   * The flash can not communicate with its container page.
   */
  NEVER: 'never'
};


/**
 * The component CSS namespace.
 *
 * @type {string}
 */
goog.ui.media.FlashObject.CSS_CLASS = goog.getCssName('goog-ui-media-flash');


/**
 * The flash object CSS class.
 *
 * @type {string}
 */
goog.ui.media.FlashObject.FLASH_CSS_CLASS =
    goog.getCssName('goog-ui-media-flash-object');


/**
 * A logger used for debugging.
 *
 * @type {goog.log.Logger}
 * @private
 */
goog.ui.media.FlashObject.prototype.logger_ =
    goog.log.getLogger('goog.ui.media.FlashObject');


/**
 * The wmode for the SWF.
 *
 * @type {goog.ui.media.FlashObject.Wmodes}
 * @private
 */
goog.ui.media.FlashObject.prototype.wmode_ =
    goog.ui.media.FlashObject.Wmodes.WINDOW;


/**
 * The minimum required flash version.
 *
 * @type {?string}
 * @private
 */
goog.ui.media.FlashObject.prototype.requiredVersion_;


/**
 * The flash movie width.
 *
 * @type {string}
 * @private
 */
goog.ui.media.FlashObject.prototype.width_;


/**
 * The flash movie height.
 *
 * @type {string}
 * @private
 */
goog.ui.media.FlashObject.prototype.height_;


/**
 * The flash movie background color.
 *
 * @type {string}
 * @private
 */
goog.ui.media.FlashObject.prototype.backgroundColor_ = '#000000';


/**
 * The flash movie allowScriptAccess setting.
 *
 * @type {string}
 * @private
 */
goog.ui.media.FlashObject.prototype.allowScriptAccess_ =
    goog.ui.media.FlashObject.ScriptAccessLevel.SAME_DOMAIN;


/**
 * Sets the flash movie Wmode.
 *
 * @param {goog.ui.media.FlashObject.Wmodes} wmode the flash movie Wmode.
 * @return {!goog.ui.media.FlashObject} The flash object instance for chaining.
 */
goog.ui.media.FlashObject.prototype.setWmode = function(wmode) {
  this.wmode_ = wmode;
  return this;
};


/**
 * @return {string} Returns the flash movie wmode.
 */
goog.ui.media.FlashObject.prototype.getWmode = function() {
  return this.wmode_;
};


/**
 * Adds flash variables.
 *
 * @param {goog.structs.Map|Object} map A key-value map of variables.
 * @return {!goog.ui.media.FlashObject} The flash object instance for chaining.
 */
goog.ui.media.FlashObject.prototype.addFlashVars = function(map) {
  this.flashVars_.addAll(map);
  return this;
};


/**
 * Sets a flash variable.
 *
 * @param {string} key The name of the flash variable.
 * @param {string} value The value of the flash variable.
 * @return {!goog.ui.media.FlashObject} The flash object instance for chaining.
 */
goog.ui.media.FlashObject.prototype.setFlashVar = function(key, value) {
  this.flashVars_.set(key, value);
  return this;
};


/**
 * Sets flash variables. You can either pass a Map of key->value pairs or you
 * can pass a key, value pair to set a specific variable.
 *
 * TODO(user, martino): Get rid of this method.
 *
 * @deprecated Use {@link #addFlashVars} or {@link #setFlashVar} instead.
 * @param {goog.structs.Map|Object|string} flashVar A map of variables (given
 *    as a goog.structs.Map or an Object literal) or a key to the optional
 *    {@code opt_value}.
 * @param {string=} opt_value The optional value for the flashVar key.
 * @return {!goog.ui.media.FlashObject} The flash object instance for chaining.
 */
goog.ui.media.FlashObject.prototype.setFlashVars = function(
    flashVar, opt_value) {
  if (flashVar instanceof goog.structs.Map ||
      goog.typeOf(flashVar) == 'object') {
    this.addFlashVars(/**@type {!goog.structs.Map|!Object}*/ (flashVar));
  } else {
    goog.asserts.assert(
        goog.isString(flashVar) && goog.isDef(opt_value),
        'Invalid argument(s)');
    this.setFlashVar(
        /**@type {string}*/ (flashVar),
        /**@type {string}*/ (opt_value));
  }
  return this;
};


/**
 * @return {goog.structs.Map} The current flash variables.
 */
goog.ui.media.FlashObject.prototype.getFlashVars = function() {
  return this.flashVars_;
};


/**
 * Sets the background color of the movie.
 *
 * @param {string} color The new color to be set.
 * @return {!goog.ui.media.FlashObject} The flash object instance for chaining.
 */
goog.ui.media.FlashObject.prototype.setBackgroundColor = function(color) {
  this.backgroundColor_ = color;
  return this;
};


/**
 * @return {string} The background color of the movie.
 */
goog.ui.media.FlashObject.prototype.getBackgroundColor = function() {
  return this.backgroundColor_;
};


/**
 * Sets the allowScriptAccess setting of the movie.
 *
 * @param {string} value The new value to be set.
 * @return {!goog.ui.media.FlashObject} The flash object instance for chaining.
 */
goog.ui.media.FlashObject.prototype.setAllowScriptAccess = function(value) {
  this.allowScriptAccess_ = value;
  return this;
};


/**
 * @return {string} The allowScriptAccess setting color of the movie.
 */
goog.ui.media.FlashObject.prototype.getAllowScriptAccess = function() {
  return this.allowScriptAccess_;
};


/**
 * Sets the width and height of the movie.
 *
 * @param {number|string} width The width of the movie.
 * @param {number|string} height The height of the movie.
 * @return {!goog.ui.media.FlashObject} The flash object instance for chaining.
 */
goog.ui.media.FlashObject.prototype.setSize = function(width, height) {
  this.width_ = goog.isString(width) ? width : Math.round(width) + 'px';
  this.height_ = goog.isString(height) ? height : Math.round(height) + 'px';
  if (this.getElement()) {
    goog.style.setSize(this.getFlashElement(), this.width_, this.height_);
  }
  return this;
};


/**
 * @return {?string} The flash required version.
 */
goog.ui.media.FlashObject.prototype.getRequiredVersion = function() {
  return this.requiredVersion_;
};


/**
 * Sets the minimum flash required version.
 *
 * @param {?string} version The minimum required version for this movie to work,
 *     or null if you want to unset it.
 * @return {!goog.ui.media.FlashObject} The flash object instance for chaining.
 */
goog.ui.media.FlashObject.prototype.setRequiredVersion = function(version) {
  this.requiredVersion_ = version;
  return this;
};


/**
 * Returns whether this SWF has a minimum required flash version.
 *
 * @return {boolean} Whether a required version was set or not.
 */
goog.ui.media.FlashObject.prototype.hasRequiredVersion = function() {
  return this.requiredVersion_ != null;
};


/**
 * Writes the Flash embedding {@code HTMLObjectElement} to this components root
 * element and adds listeners for all events to handle them consistently.
 * @override
 */
goog.ui.media.FlashObject.prototype.enterDocument = function() {
  goog.ui.media.FlashObject.superClass_.enterDocument.call(this);

  // The SWF tag must be written after this component's element is appended to
  // the DOM. Otherwise Flash's ExternalInterface is broken in IE.
  goog.dom.safe.setInnerHtml(
      /** @type {!Element} */ (this.getElement()), this.createSwfTag_());
  if (this.width_ && this.height_) {
    this.setSize(this.width_, this.height_);
  }

  // Sinks all the events on the bubble phase.
  //
  // Flash plugins propagates events from/to the plugin to the browser
  // inconsistently:
  //
  // 1) FF2 + linux: the flash plugin will stop the propagation of all events
  // from the plugin to the browser.
  // 2) FF3 + mac: the flash plugin will propagate events on the <embed> object
  // but that will get propagated to its parents.
  // 3) Safari 3.1.1 + mac: the flash plugin will propagate the event to the
  // <object> tag that event will propagate to its parents.
  // 4) IE7 + windows: the flash plugin  will eat all events, not propagating
  // anything to the javascript.
  // 5) Chrome + windows: the flash plugin will eat all events, not propagating
  // anything to the javascript.
  //
  // To overcome this inconsistency, all events from/to the plugin are sinked,
  // since you can't assume that the events will be propagated.
  //
  // NOTE(user): we only sink events on the bubbling phase, since there are no
  // inexpensive/scalable way to stop events on the capturing phase unless we
  // added an event listener on the document for each flash object.
  this.eventHandler_.listen(
      this.getElement(), goog.object.getValues(goog.events.EventType),
      goog.events.Event.stopPropagation);
};


/**
 * Creates the DOM structure.
 *
 * @override
 */
goog.ui.media.FlashObject.prototype.createDom = function() {
  if (this.hasRequiredVersion() &&
      !goog.userAgent.flash.isVersion(
          /** @type {string} */ (this.getRequiredVersion()))) {
    goog.log.warning(
        this.logger_,
        'Required flash version not found:' + this.getRequiredVersion());
    throw Error(goog.ui.Component.Error.NOT_SUPPORTED);
  }

  var element = this.getDomHelper().createElement(goog.dom.TagName.DIV);
  element.className = goog.ui.media.FlashObject.CSS_CLASS;
  this.setElementInternal(element);
};


/**
 * Creates the HTML to embed the flash object.
 *
 * @return {!goog.html.SafeHtml} Browser appropriate HTML to add the SWF to the
 *     DOM.
 * @private
 */
goog.ui.media.FlashObject.prototype.createSwfTag_ = function() {
  var keys = this.flashVars_.getKeys();
  var values = this.flashVars_.getValues();
  var flashVars = [];
  for (var i = 0; i < keys.length; i++) {
    var key = goog.string.urlEncode(keys[i]);
    var value = goog.string.urlEncode(values[i]);
    flashVars.push(key + '=' + value);
  }
  var flashVarsString = flashVars.join('&');
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(11)) {
    return this.createSwfTagOldIe_(flashVarsString);
  } else {
    return this.createSwfTagModern_(flashVarsString);
  }
};


/**
 * Creates the HTML to embed the flash object for IE>=11 and other browsers.
 *
 * @param {string} flashVars The value of the FlashVars attribute.
 * @return {!goog.html.SafeHtml} Browser appropriate HTML to add the SWF to the
 *     DOM.
 * @private
 */
goog.ui.media.FlashObject.prototype.createSwfTagModern_ = function(flashVars) {
  return goog.html.flash.createEmbed(this.flashUrl_, {
    'AllowScriptAccess': this.allowScriptAccess_,
    'allowFullScreen': 'true',
    'allowNetworking': 'all',
    'bgcolor': this.backgroundColor_,
    'class': goog.ui.media.FlashObject.FLASH_CSS_CLASS,
    'FlashVars': flashVars,
    'id': this.getId(),
    'name': this.getId(),
    'quality': 'high',
    'SeamlessTabbing': 'false',
    'wmode': this.wmode_
  });
};


/**
 * Creates the HTML to embed the flash object for IE<11.
 *
 * @param {string} flashVars The value of the FlashVars attribute.
 * @return {!goog.html.SafeHtml} Browser appropriate HTML to add the SWF to the
 *     DOM.
 * @private
 */
goog.ui.media.FlashObject.prototype.createSwfTagOldIe_ = function(flashVars) {
  return goog.html.flash.createObjectForOldIe(
      this.flashUrl_, {
        'allowFullScreen': 'true',
        'AllowScriptAccess': this.allowScriptAccess_,
        'allowNetworking': 'all',
        'bgcolor': this.backgroundColor_,
        'FlashVars': flashVars,
        'quality': 'high',
        'SeamlessTabbing': 'false',
        'wmode': this.wmode_
      },
      {
        'class': goog.ui.media.FlashObject.FLASH_CSS_CLASS,
        'id': this.getId(),
        'name': this.getId()
      });
};


/**
 * @return {HTMLObjectElement} The flash element or null if the element can't
 *     be found.
 */
goog.ui.media.FlashObject.prototype.getFlashElement = function() {
  return /** @type {HTMLObjectElement} */ (
      this.getElement() ? this.getElement().firstChild : null);
};


/** @override */
goog.ui.media.FlashObject.prototype.disposeInternal = function() {
  goog.ui.media.FlashObject.superClass_.disposeInternal.call(this);
  this.flashVars_ = null;

  this.eventHandler_.dispose();
  this.eventHandler_ = null;
};


/**
 * @return {boolean} whether the SWF has finished loading or not.
 */
goog.ui.media.FlashObject.prototype.isLoaded = function() {
  if (!this.isInDocument() || !this.getElement()) {
    return false;
  }

  // IE has different readyState values for elements.
  if (goog.userAgent.EDGE_OR_IE && this.getFlashElement().readyState &&
      this.getFlashElement().readyState ==
          goog.ui.media.FlashObject.IeSwfReadyStates_.COMPLETE) {
    return true;
  }

  if (this.getFlashElement().readyState &&
      this.getFlashElement().readyState ==
          goog.ui.media.FlashObject.SwfReadyStates_.COMPLETE) {
    return true;
  }

  // Use "in" operator to check for PercentLoaded because IE8 throws when
  // accessing directly. See:
  // https://github.com/google/closure-library/pull/373.
  if ('PercentLoaded' in this.getFlashElement() &&
      this.getFlashElement().PercentLoaded() == 100) {
    return true;
  }

  return false;
};
