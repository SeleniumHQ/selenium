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
 * @fileoverview A dialog for editing/creating a link.
 *
 */

goog.provide('goog.ui.editor.LinkDialog');
goog.provide('goog.ui.editor.LinkDialog.BeforeTestLinkEvent');
goog.provide('goog.ui.editor.LinkDialog.EventType');
goog.provide('goog.ui.editor.LinkDialog.OkEvent');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.Link');
goog.require('goog.editor.focus');
goog.require('goog.editor.node');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.events.InputHandler');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.LinkButtonRenderer');
goog.require('goog.ui.editor.AbstractDialog');
goog.require('goog.ui.editor.TabPane');
goog.require('goog.ui.editor.messages');
goog.require('goog.userAgent');
goog.require('goog.window');



/**
 * A type of goog.ui.editor.AbstractDialog for editing/creating a link.
 * @param {goog.dom.DomHelper} domHelper DomHelper to be used to create the
 *     dialog's dom structure.
 * @param {goog.editor.Link} link The target link.
 * @constructor
 * @extends {goog.ui.editor.AbstractDialog}
 */
goog.ui.editor.LinkDialog = function(domHelper, link) {
  goog.base(this, domHelper);
  this.targetLink_ = link;

  /**
   * The event handler for this dialog.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);
};
goog.inherits(goog.ui.editor.LinkDialog, goog.ui.editor.AbstractDialog);


/**
 * Events specific to the link dialog.
 * @enum {string}
 */
goog.ui.editor.LinkDialog.EventType = {
  BEFORE_TEST_LINK: 'beforetestlink'
};



/**
 * OK event object for the link dialog.
 * @param {string} linkText Text the user chose to display for the link.
 * @param {string} linkUrl Url the user chose for the link to point to.
 * @param {boolean} openInNewWindow Whether the link should open in a new window
 *     when clicked.
 * @param {boolean} noFollow Whether the link should have 'rel=nofollow'
 *     attribute.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.ui.editor.LinkDialog.OkEvent = function(
    linkText, linkUrl, openInNewWindow, noFollow) {
  goog.base(this, goog.ui.editor.AbstractDialog.EventType.OK);

  /**
   * The text of the link edited in the dialog.
   * @type {string}
   */
  this.linkText = linkText;

  /**
   * The url of the link edited in the dialog.
   * @type {string}
   */
  this.linkUrl = linkUrl;

  /**
   * Whether the link should open in a new window when clicked.
   * @type {boolean}
   */
  this.openInNewWindow = openInNewWindow;

  /**
   * Whether the link should have 'rel=nofollow' attribute.
   * @type {boolean}
   */
  this.noFollow = noFollow;
};
goog.inherits(goog.ui.editor.LinkDialog.OkEvent, goog.events.Event);



/**
 * Event fired before testing a link by opening it in another window.
 * Calling preventDefault will stop the link from being opened.
 * @param {string} url Url of the link being tested.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.ui.editor.LinkDialog.BeforeTestLinkEvent = function(url) {
  goog.base(this, goog.ui.editor.LinkDialog.EventType.BEFORE_TEST_LINK);

  /**
   * The url of the link being tested.
   * @type {string}
   */
  this.url = url;
};
goog.inherits(goog.ui.editor.LinkDialog.BeforeTestLinkEvent, goog.events.Event);


/**
 * Optional warning to show about email addresses.
 * @type {string|undefined}
 * @private
 */
goog.ui.editor.LinkDialog.prototype.emailWarning_;


/**
 * Whether to show a checkbox where the user can choose to have the link open in
 * a new window.
 * @type {boolean}
 * @private
 */
goog.ui.editor.LinkDialog.prototype.showOpenLinkInNewWindow_ = false;


/**
 * Whether the "open link in new window" checkbox should be checked when the
 * dialog is shown, and also whether it was checked last time the dialog was
 * closed.
 * @type {boolean}
 * @private
 */
goog.ui.editor.LinkDialog.prototype.isOpenLinkInNewWindowChecked_ = false;


/**
 * Whether to show a checkbox where the user can choose to have 'rel=nofollow'
 * attribute added to the link.
 * @type {boolean}
 * @private
 */
goog.ui.editor.LinkDialog.prototype.showRelNoFollow_ = false;


/**
 * Sets the warning message to show to users about including email addresses on
 * public web pages.
 * @param {string} emailWarning Warning message to show users about including
 *     email addresses on the web.
 */
goog.ui.editor.LinkDialog.prototype.setEmailWarning = function(
    emailWarning) {
  this.emailWarning_ = emailWarning;
};


/**
 * Tells the dialog to show a checkbox where the user can choose to have the
 * link open in a new window.
 * @param {boolean} startChecked Whether to check the checkbox the first
 *     time the dialog is shown. Subesquent times the checkbox will remember its
 *     previous state.
 */
goog.ui.editor.LinkDialog.prototype.showOpenLinkInNewWindow = function(
    startChecked) {
  this.showOpenLinkInNewWindow_ = true;
  this.isOpenLinkInNewWindowChecked_ = startChecked;
};


/**
 * Tells the dialog to show a checkbox where the user can choose to add
 * 'rel=nofollow' attribute to the link.
 */
goog.ui.editor.LinkDialog.prototype.showRelNoFollow = function() {
  this.showRelNoFollow_ = true;
};


/** @override */
goog.ui.editor.LinkDialog.prototype.show = function() {
  goog.base(this, 'show');


  this.selectAppropriateTab_(this.textToDisplayInput_.value,
                             this.getTargetUrl_());
  this.syncOkButton_();

  if (this.showOpenLinkInNewWindow_) {
    if (!this.targetLink_.isNew()) {
      // If link is not new, checkbox should reflect current target.
      this.isOpenLinkInNewWindowChecked_ =
          this.targetLink_.getAnchor().target == '_blank';
    }
    this.openInNewWindowCheckbox_.checked = this.isOpenLinkInNewWindowChecked_;
  }

  if (this.showRelNoFollow_) {
    this.relNoFollowCheckbox_.checked =
        goog.ui.editor.LinkDialog.hasNoFollow(this.targetLink_.getAnchor().rel);
  }
};


/** @override */
goog.ui.editor.LinkDialog.prototype.hide = function() {
  this.disableAutogenFlag_(false);
  goog.base(this, 'hide');
};


/**
 * Tells the dialog whether to show the 'text to display' div.
 * When the target element of the dialog is an image, there is no link text
 * to modify. This function can be used for this kind of situations.
 * @param {boolean} visible Whether to make 'text to display' div visible.
 */
goog.ui.editor.LinkDialog.prototype.setTextToDisplayVisible = function(
    visible) {
  if (this.textToDisplayDiv_) {
    goog.style.setStyle(this.textToDisplayDiv_, 'display',
                        visible ? 'block' : 'none');
  }
};


/**
 * Tells the plugin whether to stop leaking the page's url via the referrer
 * header when the "test this link" link is clicked.
 * @param {boolean} stop Whether to stop leaking the referrer.
 */
goog.ui.editor.LinkDialog.prototype.setStopReferrerLeaks = function(stop) {
  this.stopReferrerLeaks_ = stop;
};


/**
 * Tells the dialog whether the autogeneration of text to display is to be
 * enabled.
 * @param {boolean} enable Whether to enable the feature.
 */
goog.ui.editor.LinkDialog.prototype.setAutogenFeatureEnabled = function(
    enable) {
  this.autogenFeatureEnabled_ = enable;
};


/**
 * Checks if {@code str} contains {@code "nofollow"} as a separate word.
 * @param {string} str String to be tested.  This is usually {@code rel}
 *     attribute of an {@code HTMLAnchorElement} object.
 * @return {boolean} {@code true} if {@code str} contains {@code nofollow}.
 */
goog.ui.editor.LinkDialog.hasNoFollow = function(str) {
  return goog.ui.editor.LinkDialog.NO_FOLLOW_REGEX_.test(str);
};


/**
 * Removes {@code "nofollow"} from {@code rel} if it's present as a separate
 * word.
 * @param {string} rel Input string.  This is usually {@code rel} attribute of
 *     an {@code HTMLAnchorElement} object.
 * @return {string} {@code rel} with any {@code "nofollow"} removed.
 */
goog.ui.editor.LinkDialog.removeNoFollow = function(rel) {
  return rel.replace(goog.ui.editor.LinkDialog.NO_FOLLOW_REGEX_, '');
};


// *** Protected interface ************************************************** //


/** @override */
goog.ui.editor.LinkDialog.prototype.createDialogControl = function() {
  var builder = new goog.ui.editor.AbstractDialog.Builder(this);
  builder.setTitle(goog.ui.editor.messages.MSG_EDIT_LINK)
      .setContent(this.createDialogContent_());
  return builder.build();
};


/**
 * Creates and returns the event object to be used when dispatching the OK
 * event to listeners based on which tab is currently selected and the contents
 * of the input fields of that tab.
 * @return {goog.ui.editor.LinkDialog.OkEvent} The event object to be used when
 *     dispatching the OK event to listeners.
 * @protected
 * @override
 */
goog.ui.editor.LinkDialog.prototype.createOkEvent = function() {
  if (this.tabPane_.getCurrentTabId() ==
      goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_TAB) {
    return this.createOkEventFromEmailTab_();
  } else {
    return this.createOkEventFromWebTab_();
  }
};


/** @override */
goog.ui.editor.LinkDialog.prototype.disposeInternal = function() {
  this.eventHandler_.dispose();
  this.eventHandler_ = null;

  this.tabPane_.dispose();
  this.tabPane_ = null;

  this.urlInputHandler_.dispose();
  this.urlInputHandler_ = null;
  this.emailInputHandler_.dispose();
  this.emailInputHandler_ = null;

  goog.base(this, 'disposeInternal');
};


// *** Private implementation *********************************************** //


/**
 * Regular expression that matches {@code nofollow} value in an
 * {@code * HTMLAnchorElement}'s {@code rel} element.
 * @type {RegExp}
 * @private
 */
goog.ui.editor.LinkDialog.NO_FOLLOW_REGEX_ = /\bnofollow\b/i;


/**
 * The link being modified by this dialog.
 * @type {goog.editor.Link}
 * @private
 */
goog.ui.editor.LinkDialog.prototype.targetLink_;


/**
 * EventHandler object that keeps track of all handlers set by this dialog.
 * @type {goog.events.EventHandler}
 * @private
 */
goog.ui.editor.LinkDialog.prototype.eventHandler_;


/**
 * InputHandler object to listen for changes in the url input field.
 * @type {goog.events.InputHandler}
 * @private
 */
goog.ui.editor.LinkDialog.prototype.urlInputHandler_;


/**
 * InputHandler object to listen for changes in the email input field.
 * @type {goog.events.InputHandler}
 * @private
 */
goog.ui.editor.LinkDialog.prototype.emailInputHandler_;


/**
 * The tab bar where the url and email tabs are.
 * @type {goog.ui.editor.TabPane}
 * @private
 */
goog.ui.editor.LinkDialog.prototype.tabPane_;


/**
 * The div element holding the link's display text input.
 * @type {HTMLDivElement}
 * @private
 */
goog.ui.editor.LinkDialog.prototype.textToDisplayDiv_;


/**
 * The input element holding the link's display text.
 * @type {HTMLInputElement}
 * @private
 */
goog.ui.editor.LinkDialog.prototype.textToDisplayInput_;


/**
 * Whether or not the feature of automatically generating the display text is
 * enabled.
 * @type {boolean}
 * @private
 */
goog.ui.editor.LinkDialog.prototype.autogenFeatureEnabled_ = true;


/**
 * Whether or not we should automatically generate the display text.
 * @type {boolean}
 * @private
 */
goog.ui.editor.LinkDialog.prototype.autogenerateTextToDisplay_;


/**
 * Whether or not automatic generation of the display text is disabled.
 * @type {boolean}
 * @private
 */
goog.ui.editor.LinkDialog.prototype.disableAutogen_;


/**
 * The input element (checkbox) to indicate that the link should open in a new
 * window.
 * @type {HTMLInputElement}
 * @private
 */
goog.ui.editor.LinkDialog.prototype.openInNewWindowCheckbox_;


/**
 * The input element (checkbox) to indicate that the link should have
 * 'rel=nofollow' attribute.
 * @type {HTMLInputElement}
 * @private
 */
goog.ui.editor.LinkDialog.prototype.relNoFollowCheckbox_;


/**
 * Whether to stop leaking the page's url via the referrer header when the
 * "test this link" link is clicked.
 * @type {boolean}
 * @private
 */
goog.ui.editor.LinkDialog.prototype.stopReferrerLeaks_ = false;


/**
 * Creates contents of this dialog.
 * @return {Element} Contents of the dialog as a DOM element.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.createDialogContent_ = function() {
  this.textToDisplayDiv_ = /** @type {HTMLDivElement} */(
      this.buildTextToDisplayDiv_());
  var content = this.dom.createDom(goog.dom.TagName.DIV, null,
      this.textToDisplayDiv_);

  this.tabPane_ = new goog.ui.editor.TabPane(this.dom,
      goog.ui.editor.messages.MSG_LINK_TO);
  this.tabPane_.addTab(goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB,
      goog.ui.editor.messages.MSG_ON_THE_WEB,
      goog.ui.editor.messages.MSG_ON_THE_WEB_TIP,
      goog.ui.editor.LinkDialog.BUTTON_GROUP_,
      this.buildTabOnTheWeb_());
  this.tabPane_.addTab(goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_TAB,
      goog.ui.editor.messages.MSG_EMAIL_ADDRESS,
      goog.ui.editor.messages.MSG_EMAIL_ADDRESS_TIP,
      goog.ui.editor.LinkDialog.BUTTON_GROUP_,
      this.buildTabEmailAddress_());
  this.tabPane_.render(content);

  this.eventHandler_.listen(this.tabPane_, goog.ui.Component.EventType.SELECT,
      this.onChangeTab_);

  if (this.showOpenLinkInNewWindow_) {
    content.appendChild(this.buildOpenInNewWindowDiv_());
  }
  if (this.showRelNoFollow_) {
    content.appendChild(this.buildRelNoFollowDiv_());
  }

  return content;
};


/**
 * Builds and returns the text to display section of the edit link dialog.
 * @return {Element} A div element to be appended into the dialog div.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.buildTextToDisplayDiv_ = function() {
  var table = this.dom.createTable(1, 2);
  table.cellSpacing = '0';
  table.cellPadding = '0';
  table.style.fontSize = '10pt';
  // Build the text to display input.
  var textToDisplayDiv = this.dom.createDom(goog.dom.TagName.DIV);
  table.rows[0].cells[0].innerHTML = '<span style="position: relative;' +
      ' bottom: 2px; padding-right: 1px; white-space: nowrap;">' +
      goog.ui.editor.messages.MSG_TEXT_TO_DISPLAY + '&nbsp;</span>';
  this.textToDisplayInput_ = /** @type {HTMLInputElement} */(
      this.dom.createDom(goog.dom.TagName.INPUT,
          {id: goog.ui.editor.LinkDialog.Id_.TEXT_TO_DISPLAY}));
  var textInput = this.textToDisplayInput_;
  // 98% prevents scroll bars in standards mode.
  // TODO(robbyw): Is this necessary for quirks mode?
  goog.style.setStyle(textInput, 'width', '98%');
  goog.style.setStyle(table.rows[0].cells[1], 'width', '100%');
  goog.dom.appendChild(table.rows[0].cells[1], textInput);

  textInput.value = this.targetLink_.getCurrentText();
  this.eventHandler_.listen(textInput,
                            goog.events.EventType.KEYUP,
                            goog.bind(this.onTextToDisplayEdit_, this));

  goog.dom.appendChild(textToDisplayDiv, table);
  return textToDisplayDiv;
};


/**
 * Builds and returns the "checkbox to open the link in a new window" section of
 * the edit link dialog.
 * @return {Element} A div element to be appended into the dialog div.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.buildOpenInNewWindowDiv_ = function() {
  this.openInNewWindowCheckbox_ = /** @type {HTMLInputElement} */(
      this.dom.createDom(goog.dom.TagName.INPUT, {'type': 'checkbox'}));
  return this.dom.createDom(goog.dom.TagName.DIV, null,
      this.dom.createDom(goog.dom.TagName.LABEL, null,
                         this.openInNewWindowCheckbox_,
                         goog.ui.editor.messages.MSG_OPEN_IN_NEW_WINDOW));
};


/**
 * Creates a DIV with a checkbox for {@code rel=nofollow} option.
 * @return {Element} Newly created DIV element.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.buildRelNoFollowDiv_ = function() {
  /** @desc Checkbox text for adding 'rel=nofollow' attribute to a link. */
  var MSG_ADD_REL_NOFOLLOW_ATTR = goog.getMsg(
      "Add '{$relNoFollow}' attribute ({$linkStart}Learn more{$linkEnd})", {
        'relNoFollow': 'rel=nofollow',
        'linkStart': '<a href="http://support.google.com/webmasters/bin/' +
            'answer.py?hl=en&answer=96569" target="_blank">',
        'linkEnd': '</a>'
      });

  this.relNoFollowCheckbox_ = /** @type {HTMLInputElement} */(
      this.dom.createDom(goog.dom.TagName.INPUT, {'type': 'checkbox'}));
  return this.dom.createDom(goog.dom.TagName.DIV, null,
      this.dom.createDom(goog.dom.TagName.LABEL, null,
          this.relNoFollowCheckbox_,
          goog.dom.htmlToDocumentFragment(MSG_ADD_REL_NOFOLLOW_ATTR)));
};


/**
* Builds and returns the div containing the tab "On the web".
* @return {Element} The div element containing the tab.
* @private
*/
goog.ui.editor.LinkDialog.prototype.buildTabOnTheWeb_ = function() {
  var onTheWebDiv = this.dom.createElement(goog.dom.TagName.DIV);

  var headingDiv = this.dom.createDom(goog.dom.TagName.DIV,
      {innerHTML: '<b>' + goog.ui.editor.messages.MSG_WHAT_URL + '</b>'});
  var urlInput = this.dom.createDom(goog.dom.TagName.INPUT,
      {
        id: goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT,
        className: goog.ui.editor.LinkDialog.TARGET_INPUT_CLASSNAME_
      });
  // IE throws on unknown values for type.
  if (!goog.userAgent.IE) {
    // On browsers that support Web Forms 2.0, allow autocompletion of URLs.
    // (As of now, this is only supported by Opera 9)
    urlInput.type = 'url';
  }

  if (goog.editor.BrowserFeature.NEEDS_99_WIDTH_IN_STANDARDS_MODE &&
      goog.editor.node.isStandardsMode(urlInput)) {
    urlInput.style.width = '99%';
  }

  var inputDiv = this.dom.createDom(goog.dom.TagName.DIV, null, urlInput);

  this.urlInputHandler_ = new goog.events.InputHandler(urlInput);
  this.eventHandler_.listen(this.urlInputHandler_,
      goog.events.InputHandler.EventType.INPUT,
      this.onUrlOrEmailInputChange_);

  var testLink = new goog.ui.Button(goog.ui.editor.messages.MSG_TEST_THIS_LINK,
      goog.ui.LinkButtonRenderer.getInstance(),
      this.dom);
  testLink.render(inputDiv);
  testLink.getElement().style.marginTop = '1em';
  this.eventHandler_.listen(testLink,
      goog.ui.Component.EventType.ACTION,
      this.onWebTestLink_);

  // Build the "On the web" explanation text div.
  var explanationDiv = this.dom.createDom(goog.dom.TagName.DIV,
      {
        className: goog.ui.editor.LinkDialog.EXPLANATION_TEXT_CLASSNAME_,
        innerHTML: goog.ui.editor.messages.MSG_TR_LINK_EXPLANATION
      });
  onTheWebDiv.appendChild(headingDiv);
  onTheWebDiv.appendChild(inputDiv);
  onTheWebDiv.appendChild(explanationDiv);

  return onTheWebDiv;
};


/**
 * Builds and returns the div containing the tab "Email address".
 * @return {Element} the div element containing the tab.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.buildTabEmailAddress_ = function() {
  var emailTab = this.dom.createDom(goog.dom.TagName.DIV);

  var headingDiv = this.dom.createDom(goog.dom.TagName.DIV,
      {innerHTML: '<b>' + goog.ui.editor.messages.MSG_WHAT_EMAIL + '</b>'});
  goog.dom.appendChild(emailTab, headingDiv);
  var emailInput = this.dom.createDom(goog.dom.TagName.INPUT,
      {
        id: goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_INPUT,
        className: goog.ui.editor.LinkDialog.TARGET_INPUT_CLASSNAME_
      });

  if (goog.editor.BrowserFeature.NEEDS_99_WIDTH_IN_STANDARDS_MODE &&
      goog.editor.node.isStandardsMode(emailInput)) {
    // Standards mode sizes this too large.
    emailInput.style.width = '99%';
  }

  goog.dom.appendChild(emailTab, emailInput);

  this.emailInputHandler_ = new goog.events.InputHandler(emailInput);
  this.eventHandler_.listen(this.emailInputHandler_,
      goog.events.InputHandler.EventType.INPUT,
      this.onUrlOrEmailInputChange_);

  goog.dom.appendChild(emailTab,
      this.dom.createDom(goog.dom.TagName.DIV,
          {
            id: goog.ui.editor.LinkDialog.Id_.EMAIL_WARNING,
            className: goog.ui.editor.LinkDialog.EMAIL_WARNING_CLASSNAME_,
            style: 'visibility:hidden'
          }, goog.ui.editor.messages.MSG_INVALID_EMAIL));

  if (this.emailWarning_) {
    var explanationDiv = this.dom.createDom(goog.dom.TagName.DIV,
        {
          className: goog.ui.editor.LinkDialog.EXPLANATION_TEXT_CLASSNAME_,
          innerHTML: this.emailWarning_
        });
    goog.dom.appendChild(emailTab, explanationDiv);
  }
  return emailTab;
};


/**
 * Returns the url that the target points to.
 * @return {string} The url that the target points to.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.getTargetUrl_ = function() {
  // Get the href-attribute through getAttribute() rather than the href property
  // because Google-Toolbar on Firefox with "Send with Gmail" turned on
  // modifies the href-property of 'mailto:' links but leaves the attribute
  // untouched.
  return this.targetLink_.getAnchor().getAttribute('href') || '';
};


/**
 * Selects the correct tab based on the URL, and fills in its inputs.
 * For new links, it suggests a url based on the link text.
 * @param {string} text The inner text of the link.
 * @param {string} url The href for the link.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.selectAppropriateTab_ = function(
    text, url) {
  if (this.isNewLink_()) {
    // Newly created non-empty link: try to infer URL from the link text.
    this.guessUrlAndSelectTab_(text);
  } else if (goog.editor.Link.isMailto(url)) {
    // The link is for an email.
    this.tabPane_.setSelectedTabId(
        goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_TAB);
    this.dom.getElement(goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_INPUT)
        .value = url.substring(url.indexOf(':') + 1);
    this.setAutogenFlagFromCurInput_();
  } else {
    // No specific tab was appropriate, default to on the web tab.
    this.tabPane_.setSelectedTabId(goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB);
    this.dom.getElement(goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT)
        .value = this.isNewLink_() ? 'http://' : url;
    this.setAutogenFlagFromCurInput_();
  }
};


/**
 * Select a url/tab based on the link's text. This function is simply
 * the isNewLink_() == true case of selectAppropriateTab_().
 * @param {string} text The inner text of the link.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.guessUrlAndSelectTab_ = function(text) {
  if (goog.editor.Link.isLikelyEmailAddress(text)) {
    // The text is for an email address.
    this.tabPane_.setSelectedTabId(
        goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_TAB);
    this.dom.getElement(goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_INPUT)
        .value = text;
    this.setAutogenFlag_(true);
    // TODO(user): Why disable right after enabling? What bug are we
    // working around?
    this.disableAutogenFlag_(true);
  } else if (goog.editor.Link.isLikelyUrl(text)) {
    // The text is for a web URL.
    this.tabPane_.setSelectedTabId(goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB);
    this.dom.getElement(goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT)
        .value = text;
    this.setAutogenFlag_(true);
    this.disableAutogenFlag_(true);
  } else {
    // No meaning could be deduced from text, choose a default tab.
    if (!this.targetLink_.getCurrentText()) {
      this.setAutogenFlag_(true);
    }
    this.tabPane_.setSelectedTabId(goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB);
  }
};


/**
 * Called on a change to the url or email input. If either one of those tabs
 * is active, sets the OK button to enabled/disabled accordingly.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.syncOkButton_ = function() {
  var inputValue;
  if (this.tabPane_.getCurrentTabId() ==
      goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_TAB) {
    inputValue = this.dom.getElement(
        goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_INPUT).value;
    this.toggleInvalidEmailWarning_(inputValue != '' &&
        !goog.editor.Link.isLikelyEmailAddress(inputValue));
  } else if (this.tabPane_.getCurrentTabId() ==
      goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB) {
    inputValue = this.dom.getElement(
        goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT).value;
  } else {
    return;
  }
  this.getOkButtonElement().disabled = goog.string.isEmpty(inputValue);
};


/**
 * Show/hide the Invalid Email Address warning.
 * @param {boolean} on Whether to show the warning.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.toggleInvalidEmailWarning_ = function(on) {
  this.dom.getElement(goog.ui.editor.LinkDialog.Id_.EMAIL_WARNING)
      .style.visibility = (on ? 'visible' : 'hidden');
};


/**
 * Changes the autogenerateTextToDisplay flag so that text to
 * display stops autogenerating.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.onTextToDisplayEdit_ = function() {
  var inputEmpty = this.textToDisplayInput_.value == '';
  if (inputEmpty) {
    this.setAutogenFlag_(true);
  } else {
    this.setAutogenFlagFromCurInput_();
  }
};


/**
 * The function called when hitting OK with the "On the web" tab current.
 * @return {goog.ui.editor.LinkDialog.OkEvent} The event object to be used when
 *     dispatching the OK event to listeners.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.createOkEventFromWebTab_ = function() {
  var input = /** @type {HTMLInputElement} */(
      this.dom.getElement(goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT));
  var linkURL = input.value;
  if (goog.editor.Link.isLikelyEmailAddress(linkURL)) {
    // Make sure that if user types in an e-mail address, it becomes "mailto:".
    return this.createOkEventFromEmailTab_(
        goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT);
  } else {
    if (linkURL.search(/:/) < 0) {
      linkURL = 'http://' + goog.string.trimLeft(linkURL);
    }
    return this.createOkEventFromUrl_(linkURL);
  }
};


/**
 * The function called when hitting OK with the "email address" tab current.
 * @param {string=} opt_inputId Id of an alternate input to check.
 * @return {goog.ui.editor.LinkDialog.OkEvent} The event object to be used when
 *     dispatching the OK event to listeners.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.createOkEventFromEmailTab_ = function(
    opt_inputId) {
  var linkURL = this.dom.getElement(
      opt_inputId || goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_INPUT).value;
  linkURL = 'mailto:' + linkURL;
  return this.createOkEventFromUrl_(linkURL);
};


/**
 * Function to test a link from the on the web tab.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.onWebTestLink_ = function() {
  var input = /** @type {HTMLInputElement} */(
      this.dom.getElement(goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT));
  var url = input.value;
  if (url.search(/:/) < 0) {
    url = 'http://' + goog.string.trimLeft(url);
  }
  if (this.dispatchEvent(
      new goog.ui.editor.LinkDialog.BeforeTestLinkEvent(url))) {
    var win = this.dom.getWindow();
    var size = goog.dom.getViewportSize(win);
    var openOptions = {
      target: '_blank',
      width: Math.max(size.width - 50, 50),
      height: Math.max(size.height - 50, 50),
      toolbar: true,
      scrollbars: true,
      location: true,
      statusbar: false,
      menubar: true,
      'resizable': true,
      'noreferrer': this.stopReferrerLeaks_
    };
    goog.window.open(url, openOptions, win);
  }
};


/**
 * Called whenever the url or email input is edited. If the text to display
 * matches the text to display, turn on auto. Otherwise if auto is on, update
 * the text to display based on the url.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.onUrlOrEmailInputChange_ = function() {
  if (this.autogenerateTextToDisplay_) {
    this.setTextToDisplayFromAuto_();
  } else if (this.textToDisplayInput_.value == '') {
    this.setAutogenFlagFromCurInput_();
  }
  this.syncOkButton_();
};


/**
 * Called when the currently selected tab changes.
 * @param {goog.events.Event} e The tab change event.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.onChangeTab_ = function(e) {
  var tab = /** @type {goog.ui.Tab} */ (e.target);

  // Focus on the input field in the selected tab.
  var input = this.dom.getElement(tab.getId() +
      goog.ui.editor.LinkDialog.Id_.TAB_INPUT_SUFFIX);
  goog.editor.focus.focusInputField(input);

  // For some reason, IE does not fire onpropertychange events when the width
  // is specified as a percentage, which breaks the InputHandlers.
  input.style.width = '';
  input.style.width = input.offsetWidth + 'px';

  this.syncOkButton_();
  this.setTextToDisplayFromAuto_();
};


/**
 * If autogen is turned on, set the value of text to display based on the
 * current selection or url.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.setTextToDisplayFromAuto_ = function() {
  if (this.autogenFeatureEnabled_ && this.autogenerateTextToDisplay_) {
    var inputId = this.tabPane_.getCurrentTabId() +
        goog.ui.editor.LinkDialog.Id_.TAB_INPUT_SUFFIX;
    this.textToDisplayInput_.value =
        /** @type {HTMLInputElement} */(this.dom.getElement(inputId)).value;
  }
};


/**
 * Turn on the autogenerate text to display flag, and set some sort of indicator
 * that autogen is on.
 * @param {boolean} val Boolean value to set autogenerate to.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.setAutogenFlag_ = function(val) {
  // TODO(user): This whole autogen thing is very confusing. It needs
  // to be refactored and/or explained.
  this.autogenerateTextToDisplay_ = val;
};


/**
 * Disables autogen so that onUrlOrEmailInputChange_ doesn't act in cases
 * that are undesirable.
 * @param {boolean} autogen Boolean value to set disableAutogen to.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.disableAutogenFlag_ = function(autogen) {
  this.setAutogenFlag_(!autogen);
  this.disableAutogen_ = autogen;
};


/**
 * Creates an OK event from the text to display input and the specified link.
 * If text to display input is empty, then generate the auto value for it.
 * @return {goog.ui.editor.LinkDialog.OkEvent} The event object to be used when
 *     dispatching the OK event to listeners.
 * @param {string} url Url the target element should point to.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.createOkEventFromUrl_ = function(url) {
  // Fill in the text to display input in case it is empty.
  this.setTextToDisplayFromAuto_();
  if (this.showOpenLinkInNewWindow_) {
    // Save checkbox state for next time.
    this.isOpenLinkInNewWindowChecked_ = this.openInNewWindowCheckbox_.checked;
  }
  return new goog.ui.editor.LinkDialog.OkEvent(this.textToDisplayInput_.value,
      url, this.showOpenLinkInNewWindow_ && this.isOpenLinkInNewWindowChecked_,
      this.showRelNoFollow_ && this.relNoFollowCheckbox_.checked);
};


/**
 * If an email or url is being edited, set autogenerate to on if the text to
 * display matches the url.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.setAutogenFlagFromCurInput_ = function() {
  var autogen = false;
  if (!this.disableAutogen_) {
    var tabInput = this.dom.getElement(this.tabPane_.getCurrentTabId() +
        goog.ui.editor.LinkDialog.Id_.TAB_INPUT_SUFFIX);
    autogen = (tabInput.value == this.textToDisplayInput_.value);
  }
  this.setAutogenFlag_(autogen);
};


/**
 * @return {boolean} Whether the link is new.
 * @private
 */
goog.ui.editor.LinkDialog.prototype.isNewLink_ = function() {
  return this.targetLink_.isNew();
};


/**
 * IDs for relevant DOM elements.
 * @enum {string}
 * @private
 */
goog.ui.editor.LinkDialog.Id_ = {
  TEXT_TO_DISPLAY: 'linkdialog-text',
  ON_WEB_TAB: 'linkdialog-onweb',
  ON_WEB_INPUT: 'linkdialog-onweb-tab-input',
  EMAIL_ADDRESS_TAB: 'linkdialog-email',
  EMAIL_ADDRESS_INPUT: 'linkdialog-email-tab-input',
  EMAIL_WARNING: 'linkdialog-email-warning',
  TAB_INPUT_SUFFIX: '-tab-input'
};


/**
 * Base name for the radio buttons group.
 * @type {string}
 * @private
 */
goog.ui.editor.LinkDialog.BUTTON_GROUP_ = 'linkdialog-buttons';


/**
 * Class name for the url and email input elements.
 * @type {string}
 * @private
 */
goog.ui.editor.LinkDialog.TARGET_INPUT_CLASSNAME_ =
    goog.getCssName('tr-link-dialog-target-input');


/**
 * Class name for the email address warning element.
 * @type {string}
 * @private
 */
goog.ui.editor.LinkDialog.EMAIL_WARNING_CLASSNAME_ =
    goog.getCssName('tr-link-dialog-email-warning');


/**
 * Class name for the explanation text elements.
 * @type {string}
 * @private
 */
goog.ui.editor.LinkDialog.EXPLANATION_TEXT_CLASSNAME_ =
    goog.getCssName('tr-link-dialog-explanation-text');
