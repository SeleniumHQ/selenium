// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

goog.provide('WebElement');

goog.require('Utils');
goog.require('WebLoadingListener');
goog.require('bot.ErrorCode');
goog.require('bot.action');
goog.require('bot.dom');
goog.require('fxdriver.io');
goog.require('fxdriver.logging');
goog.require('fxdriver.moz');
goog.require('fxdriver.preconditions');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.selection');
goog.require('goog.log');
goog.require('goog.math.Coordinate');
goog.require('webdriver.atoms.element');


/**
 * @private {goog.log.Logger}
 * @const
 */
WebElement.LOG_ = fxdriver.logging.getLogger('fxdriver.WebElement');


WebElement.elementEquals = function(respond, parameters) {
  try {
    var elementA = Utils.getElementAt(parameters.id,
                                      respond.session.getDocument());
    var elementB = Utils.getElementAt(parameters.other,
                                      respond.session.getDocument());
    respond.value = elementA == elementB;
  } catch (e) {
    if (e.code && e.code == bot.ErrorCode.STALE_ELEMENT_REFERENCE) {
      // Assume any style elements are not equal to any others.
      // Users shouldn't care about equality of stale elements.
      respond.value = false;
    } else {
      throw e;
    }
  }
  respond.send();
};

WebElement.clickElement = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  var unwrapped = fxdriver.moz.unwrapFor4(element);

  var offset = Utils.getClickablePoint(unwrapped);

  var inViewAfterScroll = Utils.scrollIntoView(
      unwrapped,
      (respond.session.elementScrollBehavior == 0),
      new goog.math.Coordinate(offset.x, offset.y));

  Utils.installWindowCloseListener(respond);
  Utils.installClickListener(respond, WebLoadingListener);

  var res = this.mouse.move(element, offset.x, offset.y);
  if (res.status != bot.ErrorCode.SUCCESS) {
    respond.status = res.status;
    respond.value = res.message;
    respond.send();
    return;
  }

  res = this.mouse.click(element);
  respond.status = res.status;
  respond.value = res.message;
};
WebElement.clickElement.preconditions =
    [fxdriver.preconditions.visible];


WebElement.getElementText = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());
  respond.value = webdriver.atoms.element.getText(element);
  respond.send();
};


WebElement.sendKeysToElement = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  var browser = respond.session.getBrowser();
  var dispatcher = browser.ownerDocument.commandDispatcher;
  var currentDocument =
      dispatcher.focusedElement && goog.dom.getOwnerDocument(dispatcher.focusedElement);
  currentDocument = currentDocument ? new XPCNativeWrapper(currentDocument) : null;

  var alreadyFocused = true;
  var currentlyActive = Utils.getActiveElement(respond.session.getDocument());
  var newDocument = goog.dom.getOwnerDocument(currentlyActive);

  if (currentlyActive != element || currentDocument != new XPCNativeWrapper(newDocument)) {
    goog.log.info(WebElement.LOG_, 'Need to switch focus');
    alreadyFocused = false;
    currentlyActive.blur();
    element.focus();
    element.ownerDocument.defaultView.focus();
  } else {
    goog.log.info(WebElement.LOG_, 'No need to switch focus');
  }

  var use = element;
  var tagName = element.tagName.toLowerCase();
  if (tagName == 'body' && element.ownerDocument.defaultView.frameElement) {
    element.ownerDocument.defaultView.focus();

    // Turns out, this is what we should be using as the target
    // to send events to
    use = element.ownerDocument.getElementsByTagName('html')[0];
  }

  // Handle the special case of the file input element here

  if (bot.dom.isElement(element, goog.dom.TagName.INPUT)) {
    var inputtype = element.getAttribute('type');
    if (inputtype && inputtype.toLowerCase() == 'file') {
      element.value = parameters.value.join('');
      Utils.fireHtmlEvent(element, 'change');
      respond.send();
      return;
    }
  }

  var originalDriver = this;

  // We may need a beat for firefox to hand over focus.
  this.jsTimer.setTimeout(function() {
    if (!alreadyFocused && bot.dom.isEditable(element)) {
      var length = element.value ? element.value.length : goog.dom.getTextContent(element).length;

      if (bot.dom.isContentEditable(element) && length) {
        var setCursorTo = element;
        if (element.lastElementChild) {
          setCursorTo = element.lastElementChild;
        }
        goog.log.info(WebElement.LOG_, 'ContentEditable ' + element + " " + length);
        var doc = element.ownerDocument || element.document;
        var rng = doc.createRange();
        rng.selectNodeContents(setCursorTo);
        rng.collapse(false);
        var sel = doc.getSelection();
        sel.removeAllRanges();
        sel.addRange(rng);

      } else {
        goog.dom.selection.setCursorPosition(element, length);
      }
    }

    try {
      Utils.type(respond.session, use, parameters.value.join(''),
          originalDriver.jsTimer, true /*release modifiers*/);
      respond.send();
    } catch (ex) {
      respond.sendError(ex);
    }
  }, 0);
};
WebElement.sendKeysToElement.preconditions =
    [fxdriver.preconditions.visible, fxdriver.preconditions.enabled];


WebElement.clearElement = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());
  bot.setWindow(respond.session.getWindow());
  try {
    bot.action.clear(element);
    respond.send();
  } catch (e) {
    var code = e.code;
    if (code) {
      respond.sendError(new WebDriverError(code, e.message));
    } else {
      throw e;
    }
  }
};
WebElement.clearElement.preconditions =
    [fxdriver.preconditions.visible, fxdriver.preconditions.enabled, fxdriver.preconditions.writable];


WebElement.getElementTagName = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  respond.value = element.tagName.toLowerCase();
  respond.send();
};


WebElement.getElementAttribute = function(respond, parameters) {
  var element = fxdriver.moz.unwrap(
      Utils.getElementAt(parameters.id, respond.session.getDocument()));
  var attributeName = parameters.name;

  respond.value = webdriver.atoms.element.getAttribute(element, attributeName);
  respond.send();
};


WebElement.isElementEnabled = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());
  respond.value = bot.dom.isEnabled(element);
  respond.send();
};


WebElement.submitElement = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  if (element) {
    while (element.parentNode != null && element.tagName.toLowerCase() != 'form') {
      element = element.parentNode;
    }
    if (element.tagName && element.tagName.toLowerCase() == 'form') {
      var current = respond.session.getWindow().location;
      if (Utils.fireHtmlEvent(element, 'submit') &&
          fxdriver.io.isLoadExpected(current, element.action)) {
        new WebLoadingListener(respond.session.getBrowser(), function(timedOut) {
          if (timedOut) {
            respond.sendError(new WebDriverError(bot.ErrorCode.TIMEOUT,
                'Timed out waiting for page load.'));
          } else {
            respond.send();
          }
        }, respond.session.getPageLoadTimeout(), respond.session.getWindow());
        element.submit();
        return;
      } else {
        //Event was blocked, so don't submit
        respond.send();
        return;
      }
    } else {
      throw new WebDriverError(bot.ErrorCode.NO_SUCH_ELEMENT,
          "Element was not in a form so couldn't submit");
    }
  }
  respond.send();
};

WebElement.isElementSelected = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  var selected = false;

  try {
    var option =
        element.QueryInterface(Components.interfaces.nsIDOMHTMLOptionElement);
    selected = option.selected;
  } catch (e) {
  }

  try {
    var inputElement =
        element.QueryInterface(Components.interfaces.nsIDOMHTMLInputElement);
    if (inputElement.type == 'checkbox' || inputElement.type == 'radio') {
      selected = inputElement.checked;
    }
  } catch (e) {
  }

 respond.value = selected;
  respond.send();
};


WebElement.isElementDisplayed = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());
  respond.value = bot.dom.isShown(element);
  respond.send();
};


WebElement.getElementRect = function(respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());
  var win = respond.session.getWindow();
  var rect = Utils.getLocation(element);
  respond.value = {
    x: Math.round(rect.x + win.pageXOffset),
    y: Math.round(rect.y + win.pageYOffset),
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  };
  respond.send();
};


WebElement.getElementValueOfCssProperty = function(respond,
                                                                parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());
  respond.value = bot.dom.getEffectiveStyle(element, parameters.propertyName);
  respond.send();
};


WebElement.getElementLocationOnceScrolledIntoView = function(
    respond, parameters) {
  var element = Utils.getElementAt(parameters.id,
                                   respond.session.getDocument());

  var theDoc = element.ownerDocument;
  Utils.getMainDocumentElement(theDoc).focus();
  var elementLocation = Utils.getLocationOnceScrolledIntoView(
      element, (respond.session.elementScrollBehavior == 0));

  respond.value = {
    x: Math.round(elementLocation.x),
    y: Math.round(elementLocation.y)
  };

  respond.send();
};


