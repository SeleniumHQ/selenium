// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Base class for bubble plugins.
 *
 */

goog.provide('goog.editor.plugins.LinkBubble');
goog.provide('goog.editor.plugins.LinkBubble.Action');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.editor.Command');
goog.require('goog.editor.Link');
goog.require('goog.editor.plugins.AbstractBubblePlugin');
goog.require('goog.editor.range');
goog.require('goog.functions');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.ui.editor.messages');
goog.require('goog.uri.utils');
goog.require('goog.window');



/**
 * Property bubble plugin for links.
 * @param {...!goog.editor.plugins.LinkBubble.Action} var_args List of
 *     extra actions supported by the bubble.
 * @constructor
 * @extends {goog.editor.plugins.AbstractBubblePlugin}
 */
goog.editor.plugins.LinkBubble = function(var_args) {
  goog.editor.plugins.LinkBubble.base(this, 'constructor');

  /**
   * List of extra actions supported by the bubble.
   * @type {Array<!goog.editor.plugins.LinkBubble.Action>}
   * @private
   */
  this.extraActions_ = goog.array.toArray(arguments);

  /**
   * List of spans corresponding to the extra actions.
   * @type {Array<!Element>}
   * @private
   */
  this.actionSpans_ = [];

  /**
   * A list of whitelisted URL schemes which are safe to open.
   * @type {Array<string>}
   * @private
   */
  this.safeToOpenSchemes_ = ['http', 'https', 'ftp'];
};
goog.inherits(goog.editor.plugins.LinkBubble,
    goog.editor.plugins.AbstractBubblePlugin);


/**
 * Element id for the link text.
 * type {string}
 * @private
 */
goog.editor.plugins.LinkBubble.LINK_TEXT_ID_ = 'tr_link-text';


/**
 * Element id for the test link span.
 * type {string}
 * @private
 */
goog.editor.plugins.LinkBubble.TEST_LINK_SPAN_ID_ = 'tr_test-link-span';


/**
 * Element id for the test link.
 * type {string}
 * @private
 */
goog.editor.plugins.LinkBubble.TEST_LINK_ID_ = 'tr_test-link';


/**
 * Element id for the change link span.
 * type {string}
 * @private
 */
goog.editor.plugins.LinkBubble.CHANGE_LINK_SPAN_ID_ = 'tr_change-link-span';


/**
 * Element id for the link.
 * type {string}
 * @private
 */
goog.editor.plugins.LinkBubble.CHANGE_LINK_ID_ = 'tr_change-link';


/**
 * Element id for the delete link span.
 * type {string}
 * @private
 */
goog.editor.plugins.LinkBubble.DELETE_LINK_SPAN_ID_ = 'tr_delete-link-span';


/**
 * Element id for the delete link.
 * type {string}
 * @private
 */
goog.editor.plugins.LinkBubble.DELETE_LINK_ID_ = 'tr_delete-link';


/**
 * Element id for the link bubble wrapper div.
 * type {string}
 * @private
 */
goog.editor.plugins.LinkBubble.LINK_DIV_ID_ = 'tr_link-div';


/**
 * @desc Text label for link that lets the user click it to see where the link
 *     this bubble is for point to.
 */
goog.editor.plugins.LinkBubble.MSG_LINK_BUBBLE_TEST_LINK = goog.getMsg(
    'Go to link: ');


/**
 * @desc Label that pops up a dialog to change the link.
 */
goog.editor.plugins.LinkBubble.MSG_LINK_BUBBLE_CHANGE = goog.getMsg(
    'Change');


/**
 * @desc Label that allow the user to remove this link.
 */
goog.editor.plugins.LinkBubble.MSG_LINK_BUBBLE_REMOVE = goog.getMsg(
    'Remove');


/**
 * @desc Message shown in a link bubble when the link is not a valid url.
 */
goog.editor.plugins.LinkBubble.MSG_INVALID_URL_LINK_BUBBLE = goog.getMsg(
    'invalid url');


/**
 * Whether to stop leaking the page's url via the referrer header when the
 * link text link is clicked.
 * @type {boolean}
 * @private
 */
goog.editor.plugins.LinkBubble.prototype.stopReferrerLeaks_ = false;


/**
 * Whether to block opening links with a non-whitelisted URL scheme.
 * @type {boolean}
 * @private
 */
goog.editor.plugins.LinkBubble.prototype.blockOpeningUnsafeSchemes_ =
    true;


/**
 * Tells the plugin to stop leaking the page's url via the referrer header when
 * the link text link is clicked. When the user clicks on a link, the
 * browser makes a request for the link url, passing the url of the current page
 * in the request headers. If the user wants the current url to be kept secret
 * (e.g. an unpublished document), the owner of the url that was clicked will
 * see the secret url in the request headers, and it will no longer be a secret.
 * Calling this method will not send a referrer header in the request, just as
 * if the user had opened a blank window and typed the url in themselves.
 */
goog.editor.plugins.LinkBubble.prototype.stopReferrerLeaks = function() {
  // TODO(user): Right now only 2 plugins have this API to stop
  // referrer leaks. If more plugins need to do this, come up with a way to
  // enable the functionality in all plugins at once. Same thing for
  // setBlockOpeningUnsafeSchemes and associated functionality.
  this.stopReferrerLeaks_ = true;
};


/**
 * Tells the plugin whether to block URLs with schemes not in the whitelist.
 * If blocking is enabled, this plugin will not linkify the link in the bubble
 * popup.
 * @param {boolean} blockOpeningUnsafeSchemes Whether to block non-whitelisted
 *     schemes.
 */
goog.editor.plugins.LinkBubble.prototype.setBlockOpeningUnsafeSchemes =
    function(blockOpeningUnsafeSchemes) {
  this.blockOpeningUnsafeSchemes_ = blockOpeningUnsafeSchemes;
};


/**
 * Sets a whitelist of allowed URL schemes that are safe to open.
 * Schemes should all be in lowercase. If the plugin is set to block opening
 * unsafe schemes, user-entered URLs will be converted to lowercase and checked
 * against this list. The whitelist has no effect if blocking is not enabled.
 * @param {Array<string>} schemes String array of URL schemes to allow (http,
 *     https, etc.).
 */
goog.editor.plugins.LinkBubble.prototype.setSafeToOpenSchemes =
    function(schemes) {
  this.safeToOpenSchemes_ = schemes;
};


/** @override */
goog.editor.plugins.LinkBubble.prototype.getTrogClassId = function() {
  return 'LinkBubble';
};


/** @override */
goog.editor.plugins.LinkBubble.prototype.isSupportedCommand =
    function(command) {
  return command == goog.editor.Command.UPDATE_LINK_BUBBLE;
};


/** @override */
goog.editor.plugins.LinkBubble.prototype.execCommandInternal =
    function(command, var_args) {
  if (command == goog.editor.Command.UPDATE_LINK_BUBBLE) {
    this.updateLink_();
  }
};


/**
 * Updates the href in the link bubble with a new link.
 * @private
 */
goog.editor.plugins.LinkBubble.prototype.updateLink_ = function() {
  var targetEl = this.getTargetElement();
  if (targetEl) {
    this.closeBubble();
    this.createBubble(targetEl);
  }
};


/** @override */
goog.editor.plugins.LinkBubble.prototype.getBubbleTargetFromSelection =
    function(selectedElement) {
  var bubbleTarget = goog.dom.getAncestorByTagNameAndClass(selectedElement,
      goog.dom.TagName.A);

  if (!bubbleTarget) {
    // See if the selection is touching the right side of a link, and if so,
    // show a bubble for that link.  The check for "touching" is very brittle,
    // and currently only guarantees that it will pop up a bubble at the
    // position the cursor is placed at after the link dialog is closed.
    // NOTE(robbyw): This assumes this method is always called with
    // selected element = range.getContainerElement().  Right now this is true,
    // but attempts to re-use this method for other purposes could cause issues.
    // TODO(robbyw): Refactor this method to also take a range, and use that.
    var range = this.getFieldObject().getRange();
    if (range && range.isCollapsed() && range.getStartOffset() == 0) {
      var startNode = range.getStartNode();
      var previous = startNode.previousSibling;
      if (previous && previous.tagName == goog.dom.TagName.A) {
        bubbleTarget = previous;
      }
    }
  }

  return /** @type {Element} */ (bubbleTarget);
};


/**
 * Set the optional function for getting the "test" link of a url.
 * @param {function(string) : string} func The function to use.
 */
goog.editor.plugins.LinkBubble.prototype.setTestLinkUrlFn = function(func) {
  this.testLinkUrlFn_ = func;
};


/**
 * Returns the target element url for the bubble.
 * @return {string} The url href.
 * @protected
 */
goog.editor.plugins.LinkBubble.prototype.getTargetUrl = function() {
  // Get the href-attribute through getAttribute() rather than the href property
  // because Google-Toolbar on Firefox with "Send with Gmail" turned on
  // modifies the href-property of 'mailto:' links but leaves the attribute
  // untouched.
  return this.getTargetElement().getAttribute('href') || '';
};


/** @override */
goog.editor.plugins.LinkBubble.prototype.getBubbleType = function() {
  return goog.dom.TagName.A;
};


/** @override */
goog.editor.plugins.LinkBubble.prototype.getBubbleTitle = function() {
  return goog.ui.editor.messages.MSG_LINK_CAPTION;
};


/**
 * Returns the message to display for testing a link.
 * @return {string} The message for testing a link.
 * @protected
 */
goog.editor.plugins.LinkBubble.prototype.getTestLinkMessage = function() {
  return goog.editor.plugins.LinkBubble.MSG_LINK_BUBBLE_TEST_LINK;
};


/** @override */
goog.editor.plugins.LinkBubble.prototype.createBubbleContents = function(
    bubbleContainer) {
  var linkObj = this.getLinkToTextObj_();

  // Create linkTextSpan, show plain text for e-mail address or truncate the
  // text to <= 48 characters so that property bubbles don't grow too wide and
  // create a link if URL.  Only linkify valid links.
  // TODO(robbyw): Repalce this color with a CSS class.
  var color = linkObj.valid ? 'black' : 'red';
  var shouldOpenUrl = this.shouldOpenUrl(linkObj.linkText);
  var linkTextSpan;
  if (goog.editor.Link.isLikelyEmailAddress(linkObj.linkText) ||
      !linkObj.valid || !shouldOpenUrl) {
    linkTextSpan = this.dom_.createDom(goog.dom.TagName.SPAN,
        {
          id: goog.editor.plugins.LinkBubble.LINK_TEXT_ID_,
          style: 'color:' + color
        }, this.dom_.createTextNode(linkObj.linkText));
  } else {
    var testMsgSpan = this.dom_.createDom(goog.dom.TagName.SPAN,
        {id: goog.editor.plugins.LinkBubble.TEST_LINK_SPAN_ID_},
        this.getTestLinkMessage());
    linkTextSpan = this.dom_.createDom(goog.dom.TagName.SPAN,
        {
          id: goog.editor.plugins.LinkBubble.LINK_TEXT_ID_,
          style: 'color:' + color
        }, '');
    var linkText = goog.string.truncateMiddle(linkObj.linkText, 48);
    // Actually creates a pseudo-link that can't be right-clicked to open in a
    // new tab, because that would avoid the logic to stop referrer leaks.
    this.createLink(goog.editor.plugins.LinkBubble.TEST_LINK_ID_,
                    this.dom_.createTextNode(linkText).data,
                    this.testLink,
                    linkTextSpan);
  }

  var changeLinkSpan = this.createLinkOption(
      goog.editor.plugins.LinkBubble.CHANGE_LINK_SPAN_ID_);
  this.createLink(goog.editor.plugins.LinkBubble.CHANGE_LINK_ID_,
      goog.editor.plugins.LinkBubble.MSG_LINK_BUBBLE_CHANGE,
      this.showLinkDialog_, changeLinkSpan);

  // This function is called multiple times - we have to reset the array.
  this.actionSpans_ = [];
  for (var i = 0; i < this.extraActions_.length; i++) {
    var action = this.extraActions_[i];
    var actionSpan = this.createLinkOption(action.spanId_);
    this.actionSpans_.push(actionSpan);
    this.createLink(action.linkId_, action.message_,
        function() {
          action.actionFn_(this.getTargetUrl());
        },
        actionSpan);
  }

  var removeLinkSpan = this.createLinkOption(
      goog.editor.plugins.LinkBubble.DELETE_LINK_SPAN_ID_);
  this.createLink(goog.editor.plugins.LinkBubble.DELETE_LINK_ID_,
      goog.editor.plugins.LinkBubble.MSG_LINK_BUBBLE_REMOVE,
      this.deleteLink_, removeLinkSpan);

  this.onShow();

  var bubbleContents = this.dom_.createDom(goog.dom.TagName.DIV,
      {id: goog.editor.plugins.LinkBubble.LINK_DIV_ID_},
      testMsgSpan || '', linkTextSpan, changeLinkSpan);

  for (i = 0; i < this.actionSpans_.length; i++) {
    bubbleContents.appendChild(this.actionSpans_[i]);
  }
  bubbleContents.appendChild(removeLinkSpan);

  goog.dom.appendChild(bubbleContainer, bubbleContents);
};


/**
 * Tests the link by opening it in a new tab/window. Should be used as the
 * click event handler for the test pseudo-link.
 * @param {!Event=} opt_event If passed in, the event will be stopped.
 * @protected
 */
goog.editor.plugins.LinkBubble.prototype.testLink = function(opt_event) {
  goog.window.open(this.getTestLinkAction_(),
      {
        'target': '_blank',
        'noreferrer': this.stopReferrerLeaks_
      }, this.getFieldObject().getAppWindow());
  if (opt_event) {
    opt_event.stopPropagation();
    opt_event.preventDefault();
  }
};


/**
 * Returns whether the URL should be considered invalid.  This always returns
 * false in the base class, and should be overridden by subclasses that wish
 * to impose validity rules on URLs.
 * @param {string} url The url to check.
 * @return {boolean} Whether the URL should be considered invalid.
 */
goog.editor.plugins.LinkBubble.prototype.isInvalidUrl = goog.functions.FALSE;


/**
 * Gets the text to display for a link, based on the type of link
 * @return {!Object} Returns an object of the form:
 *     {linkText: displayTextForLinkTarget, valid: ifTheLinkIsValid}.
 * @private
 */
goog.editor.plugins.LinkBubble.prototype.getLinkToTextObj_ = function() {
  var isError;
  var targetUrl = this.getTargetUrl();

  if (this.isInvalidUrl(targetUrl)) {

    targetUrl = goog.editor.plugins.LinkBubble.MSG_INVALID_URL_LINK_BUBBLE;
    isError = true;
  } else if (goog.editor.Link.isMailto(targetUrl)) {
    targetUrl = targetUrl.substring(7); // 7 == "mailto:".length
  }

  return {linkText: targetUrl, valid: !isError};
};


/**
 * Shows the link dialog.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
goog.editor.plugins.LinkBubble.prototype.showLinkDialog_ = function(e) {
  // Needed when this occurs due to an ENTER key event, else the newly created
  // dialog manages to have its OK button pressed, causing it to disappear.
  e.preventDefault();

  this.getFieldObject().execCommand(goog.editor.Command.MODAL_LINK_EDITOR,
      new goog.editor.Link(
          /** @type {HTMLAnchorElement} */ (this.getTargetElement()),
          false));
  this.closeBubble();
};


/**
 * Deletes the link associated with the bubble
 * @private
 */
goog.editor.plugins.LinkBubble.prototype.deleteLink_ = function() {
  this.getFieldObject().dispatchBeforeChange();

  var link = this.getTargetElement();
  var child = link.lastChild;
  goog.dom.flattenElement(link);
  goog.editor.range.placeCursorNextTo(child, false);

  this.closeBubble();

  this.getFieldObject().dispatchChange();
  this.getFieldObject().focus();
};


/**
 * Sets the proper state for the action links.
 * @protected
 * @override
 */
goog.editor.plugins.LinkBubble.prototype.onShow = function() {
  var linkDiv = this.dom_.getElement(
      goog.editor.plugins.LinkBubble.LINK_DIV_ID_);
  if (linkDiv) {
    var testLinkSpan = this.dom_.getElement(
        goog.editor.plugins.LinkBubble.TEST_LINK_SPAN_ID_);
    if (testLinkSpan) {
      var url = this.getTargetUrl();
      goog.style.setElementShown(testLinkSpan, !goog.editor.Link.isMailto(url));
    }

    for (var i = 0; i < this.extraActions_.length; i++) {
      var action = this.extraActions_[i];
      var actionSpan = this.dom_.getElement(action.spanId_);
      if (actionSpan) {
        goog.style.setElementShown(actionSpan, action.toShowFn_(
            this.getTargetUrl()));
      }
    }
  }
};


/**
 * Gets the url for the bubble test link.  The test link is the link in the
 * bubble the user can click on to make sure the link they entered is correct.
 * @return {string} The url for the bubble link href.
 * @private
 */
goog.editor.plugins.LinkBubble.prototype.getTestLinkAction_ = function() {
  var targetUrl = this.getTargetUrl();
  return this.testLinkUrlFn_ ? this.testLinkUrlFn_(targetUrl) : targetUrl;
};


/**
 * Checks whether the plugin should open the given url in a new window.
 * @param {string} url The url to check.
 * @return {boolean} If the plugin should open the given url in a new window.
 * @protected
 */
goog.editor.plugins.LinkBubble.prototype.shouldOpenUrl = function(url) {
  return !this.blockOpeningUnsafeSchemes_ || this.isSafeSchemeToOpen_(url);
};


/**
 * Determines whether or not a url has a scheme which is safe to open.
 * Schemes like javascript are unsafe due to the possibility of XSS.
 * @param {string} url A url.
 * @return {boolean} Whether the url has a safe scheme.
 * @private
 */
goog.editor.plugins.LinkBubble.prototype.isSafeSchemeToOpen_ =
    function(url) {
  var scheme = goog.uri.utils.getScheme(url) || 'http';
  return goog.array.contains(this.safeToOpenSchemes_, scheme.toLowerCase());
};



/**
 * Constructor for extra actions that can be added to the link bubble.
 * @param {string} spanId The ID for the span showing the action.
 * @param {string} linkId The ID for the link showing the action.
 * @param {string} message The text for the link showing the action.
 * @param {function(string):boolean} toShowFn Test function to determine whether
 *     to show the action for the given URL.
 * @param {function(string):void} actionFn Action function to run when the
 *     action is clicked.  Takes the current target URL as a parameter.
 * @constructor
 * @final
 */
goog.editor.plugins.LinkBubble.Action = function(spanId, linkId, message,
    toShowFn, actionFn) {
  this.spanId_ = spanId;
  this.linkId_ = linkId;
  this.message_ = message;
  this.toShowFn_ = toShowFn;
  this.actionFn_ = actionFn;
};
