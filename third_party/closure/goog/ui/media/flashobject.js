// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2009 Google Inc. All Rights Reserved.

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
 * TODO: take a look at swfobject, and maybe use it instead of the current
 * flash embedding method.
 *
 * Examples of usage:
 *
 * <pre>
 *   var flash = new goog.ui.media.FlashObject('http://hostname/flash.swf');
 *   flash.setFlashVar('myvar', 'foo');
 *   flash.render(goog.dom.$('parent'));
 * </pre>
 *
 * TODO: create a goog.ui.media.BrowserInterfaceFlashObject that
 * subclasses goog.ui.media.FlashObject to provide all the goodness of
 * http://go/browserinterface.as
 *
 */

goog.provide('goog.ui.media.FlashObject');
goog.provide('goog.ui.media.FlashObject.Wmodes');

goog.require('goog.asserts');
goog.require('goog.debug.Logger');
goog.require('goog.events.EventHandler');
goog.require('goog.string');
goog.require('goog.structs.Map');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.Error');
goog.require('goog.userAgent');
goog.require('goog.userAgent.flash');


/**
 * A very simple flash wrapper, that allows you to create flash object
 * programmatically, instead of embedding your own HTML. It extends
 * {@link goog.ui.Component}, which makes it very easy to be embedded on the
 * page.
 *
 * @param {string} flashUrl The flash SWF URL.
 * @param {goog.dom.DomHelper} opt_domHelper An optional DomHelper.
 * @extends {goog.ui.Component}
 * @constructor
 */
goog.ui.media.FlashObject = function(flashUrl, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * The URL of the flash movie to be embedded.
   *
   * @type {string}
   * @private
   */
  this.flashUrl_ = flashUrl;

  /**
   * An event handler used to handle events consistently between browsers.
   * @type {goog.events.EventHandler}
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
   * Allows for z-ordering of the SWF and plays the swf with a transparent BG.
   */
  TRANSPARENT: 'transparent',

  /**
   * The default wmode. Does not allow for z-ordering of the SWF.
   */
  WINDOW: 'window'
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
 * Template for the object tag for IE.
 *
 * @type {string}
 * @private
 */
goog.ui.media.FlashObject.IE_HTML_ =
    '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"' +
           ' id="%s"' +
           ' name="%s"' +
           ' class="%s"' +
           '>' +
      '<param name="movie" value="%s"/>' +
      '<param name="quality" value="high"/>' +
      '<param name="FlashVars" value="%s"/>' +
      '<param name="bgcolor" value="%s"/>' +
      '<param name="AllowScriptAccess" value="sameDomain"/>' +
      '<param name="allowFullScreen" value="true"/>' +
      '<param name="SeamlessTabbing" value="false"/>' +
      '%s' +
    '</object>';


/**
 * Template for the wmode param for IE.
 *
 * @type {string}
 * @private
 */
goog.ui.media.FlashObject.IE_WMODE_PARAMS_ = '<param name="wmode" value="%s"/>';


/**
 * Template for the embed tag for FF.
 *
 * @type {string}
 * @private
 */
goog.ui.media.FlashObject.FF_HTML_ =
    '<embed quality="high"' +
          ' id="%s"' +
          ' name="%s"' +
          ' class="%s"' +
          ' src="%s"' +
          ' FlashVars="%s"' +
          ' bgcolor="%s"' +
          ' AllowScriptAccess="sameDomain"' +
          ' allowFullScreen="true"' +
          ' SeamlessTabbing="false"' +
          ' type="application/x-shockwave-flash"' +
          ' pluginspage="http://www.macromedia.com/go/getflashplayer"' +
          ' %s>' +
    '</embed>';


/**
 * Template for the wmode param for Firefox.
 *
 * @type {string}
 * @private
 */
goog.ui.media.FlashObject.FF_WMODE_PARAMS_ = 'wmode=%s';


/**
 * A logger used for debugging.
 *
 * @type {goog.debug.Logger}
 * @private
 */
goog.ui.media.FlashObject.prototype.logger_ =
    goog.debug.Logger.getLogger('goog.ui.media.FlashObject');


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
 * Sets the flash movie Wmode.
 *
 * @param {goog.ui.media.FlashObject.Wmodes} wmode the flash movie Wmode.
 * @return {goog.ui.media.FlashObject} The flash object instance for chaining.
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
 * @return {goog.ui.media.FlashObject} The flash object instance for chaining.
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
 * @return {goog.ui.media.FlashObject} The flash object instance for chaining.
 */
goog.ui.media.FlashObject.prototype.setFlashVar = function(key, value) {
  this.flashVars_.set(key, value);
  return this;
};


/**
 * Sets flash variables. You can either pass a Map of key->value pairs or you
 * can pass a key, value pair to set a specific variable.
 *
 * TODO: Get rid of this method.
 *
 * @deprecated Use {@link #addFlashVars} or {@link #setFlashVar} instead.
 * @param {goog.structs.Map|Object|string} flashVar A map of variables (given
 *    as a goog.structs.Map or an Object literal) or a key to the optional
 *    {@code opt_value}.
 * @param {string} opt_value The optional value for the flashVar key.
 * @return {goog.ui.media.FlashObject} The flash object instance for chaining.
 */
goog.ui.media.FlashObject.prototype.setFlashVars = function(flashVar,
                                                            opt_value) {
  if (flashVar instanceof goog.structs.Map ||
      goog.typeOf(flashVar) == 'object') {
    this.addFlashVars(flashVar);
  } else {
    goog.asserts.assert(goog.isString(flashVar) && goog.isDef(opt_value),
        'Invalid argument(s)');
    this.setFlashVar(String(flashVar), String(opt_value));
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
 * @return {goog.ui.media.FlashObject} The flash object instance for chaining.
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
 * Sets the width and height of the movie.
 *
 * @param {number|string} width The width of the movie.
 * @param {number|string} height The height of the movie.
 * @return {goog.ui.media.FlashObject} The flash object instance for chaining.
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
 * @return {goog.ui.media.FlashObject} The flash object instance for chaining.
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
 * On {@code enterDocument}, listen for all events to handle them consistently.
 * @inheritDoc
 */
goog.ui.media.FlashObject.prototype.enterDocument = function() {
  goog.ui.media.FlashObject.superClass_.enterDocument.call(this);
  this.eventHandler_.listen(
      this.getElement(),
      goog.object.getValues(goog.events.EventType),
      this.onAnyEvent_);
};


/**
 * Sinks all the events on the bubble phase.
 *
 * Flash plugins propagates events from/to the plugin to the browser
 * inconsistently:
 *
 * 1) FF2 + linux: the flash plugin will stop the propagation of all events from
 * the plugin to the browser.
 * 2) FF3 + mac: the flash plugin will propagate events on the <embed> object
 * but that will get propagated to its parents.
 * 3) Safari 3.1.1 + mac: the flash plugin will propagate the event to the
 * <object> tag that event will propagate to its parents.
 * 4) IE7 + windows: the flash plugin  will eat all events, not propagating
 * anything to the javascript.
 * 5) Chrome + windows: the flash plugin will eat all events, not propagating
 * anything to the javascript.
 *
 * To overcome this inconsistency, all events from/to the plugin are sinked,
 * since you can't assume that the events will be propagated.
 *
 * NOTE: we only sink events on the bubbling phase, since there are no
 * inexpensive/scalable way to stop events on the capturing phase unless we
 * added an event listener on the document for each flash object.
 *
 * @param {goog.events.Event} e The event to be stopped.
 * @private
 */
goog.ui.media.FlashObject.prototype.onAnyEvent_ = function(e) {
  e.stopPropagation();
};


/**
 * Creates the DOM structure.
 *
 * @inheritDoc
 */
goog.ui.media.FlashObject.prototype.createDom = function() {
  if (this.hasRequiredVersion() &&
      !goog.userAgent.flash.isVersion(
          /** @type {string} */ (this.getRequiredVersion()))) {
    this.logger_.warning('Required flash version not found:' +
        this.getRequiredVersion());
    throw Error(goog.ui.Component.Error.NOT_SUPPORTED);
  }

  var element = this.getDomHelper().createElement('div');
  element.className = goog.ui.media.FlashObject.CSS_CLASS;
  element.innerHTML = this.generateSwfTag_();
  this.setElementInternal(element);

  if (this.width_ && this.height_) {
    this.setSize(this.width_, this.height_);
  }
};


/**
 * Writes the HTML to embed the flash object.
 *
 * @return {string} Browser appropriate HTML to add the SWF to the DOM.
 * @private
 */
goog.ui.media.FlashObject.prototype.generateSwfTag_ = function() {
  var template = goog.userAgent.IE ? goog.ui.media.FlashObject.IE_HTML_ :
      goog.ui.media.FlashObject.FF_HTML_;

  var params = goog.userAgent.IE ? goog.ui.media.FlashObject.IE_WMODE_PARAMS_ :
      goog.ui.media.FlashObject.FF_WMODE_PARAMS_;

  params = goog.string.subs(params, this.wmode_);

  var keys = this.flashVars_.getKeys();
  var values = this.flashVars_.getValues();

  var flashVars = [];
  for (var i = 0; i < keys.length; i++) {
    var key = goog.string.urlEncode(keys[i]);
    var value = goog.string.urlEncode(values[i]);
    flashVars.push(key + '=' + value);
  }

  // TODO: find a more efficient way to build the HTML.
  return goog.string.subs(
      template,
      this.getId(),
      this.getId(),
      goog.ui.media.FlashObject.FLASH_CSS_CLASS,
      goog.string.htmlEscape(this.flashUrl_),
      goog.string.htmlEscape(flashVars.join('&')),
      this.backgroundColor_,
      params);
};


/**
 * @return {Element} The flash element.
 */
goog.ui.media.FlashObject.prototype.getFlashElement = function() {
  return /** @type {Element} */ this.getElement().firstChild;
};


/** @inheritDoc */
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

  if (this.getFlashElement().readyState &&
      this.getFlashElement().readyState ==
          goog.ui.media.FlashObject.SwfReadyStates_.COMPLETE) {
    return true;
  }

  if (this.getFlashElement().PercentLoaded &&
      this.getFlashElement().PercentLoaded() == 100) {
    return true;
  }

  return false;
};
