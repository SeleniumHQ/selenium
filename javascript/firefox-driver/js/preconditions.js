// Copyright 2010 WebDriver committers
// Copyright 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Preconditions that need to be applied before the command
 * executor should execute commands.
 */

goog.provide('webdriver.preconditions');

goog.require('bot.dom');
goog.require('Utils');



/**
 * @param {!Element} element The element to use.
 * @return {boolean} Whether the element is in the HEAD of the document.
 */
webdriver.preconditions.isInHead_ = function(element) {
  while (element) {
    if (element.tagName && element.tagName.toLowerCase() == "head") {
      return true;
    }
    try {
      element = element.parentNode;
    } catch (e) {
      // Fine. the DOM has disappeared from underneath us
      return false;
    }
  }

  return false;
};


/**
 * Guard that checks whether or not the element would be considered visible.
 *
 * @param {!Document} doc The document to locate the element on.
 * @param {!Object} parameters The arguments to use.
 */
webdriver.preconditions.visible = function(doc, parameters) {
  var element = Utils.getElementAt(parameters.id, doc);

  if (webdriver.preconditions.isInHead_(element)) {
    return new WebDriverError(ErrorCode.UNKNOWN_COMMAND,
        'Element is in the document HEAD and so may not be interacted with');
  }
  
  if (!bot.dom.isShown(element, /*ignoreOpacity=*/true)) {
    return new WebDriverError(ErrorCode.ELEMENT_NOT_VISIBLE,
        'Element is not currently visible and so may not be interacted with');
  }
};

/**
 * Guard that checks that the element is enabled.
 *
 * @param {!Document} doc The document to locate the element on.
 * @param {!Object} parameters The arguments to use.
 */
webdriver.preconditions.enabled = function(doc, parameters) {
  var element = Utils.getElementAt(parameters.id, doc);

  if (!!element.disabled) {
    return new WebDriverError(ErrorCode.INVALID_ELEMENT_STATE,
        'Element is disabled and so may not be used for actions');
  }
};


/**
 * Guard to ensure that no modal dialog is open.
 *
 * @param {!Object} driver A WebDriver instance.
 */
webdriver.preconditions.noAlertPresent = function(driver) {
  if (driver.modalOpen) {
    return new WebDriverError(ErrorCode.MODAL_DIALOG_OPENED,
        'A modal dialog, such as an alert, is open.');
  }
};


/**
 * Guard to ensure that a modal dialog is open.
 *
 * @param {!Object} driver A WebDriver instance.
 */
webdriver.preconditions.alertPresent = function(driver) {
  if (!driver.modalOpen) {
    return new WebDriverError(ErrorCode.NO_MODAL_DIALOG_OPEN,
        'A modal dialog, such as an alert, is not open.');
  }
};
