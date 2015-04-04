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

/**
 * @fileoverview Functions for handling HTML SELECT elements.
 */

goog.provide('core.select');
goog.provide('core.select.option');

goog.require('bot.action');
goog.require('bot.dom');
goog.require('core.Error');
goog.require('core.locators');
goog.require('core.patternMatcher');



/**
 * @typedef {{findOption: function(!Element):!Element,
 *            assertSelected: function(!Element)}}
 */
core.select.option.Locator;


/**
 * Create a locator for finding OPTION elements by the selected index.
 *
 * @param {string} index The index to use to find an OPTION element.
 * @return {core.select.option.Locator} The created option locator;
 */
core.select.option.createIndexLocator_ = function(index) {
  var toUse = Number(index);

  if (isNaN(toUse) || toUse < 0) {
    throw new core.Error("Illegal Index: " + index);
  }

  return {
    findOption: function(element) {
      if (element.options.length <= toUse) {
        throw new core.Error(
            'Index out of range.  Only ' + element.options.length + ' options available');
      }
      return element.options[toUse];
    },

    assertSelected: function(element) {
      if (toUse != element.selectedIndex) {
        throw new core.Error('Selected index (' + element.selectedIndex +
            ') does not match expected index: ' + toUse);
      }
    }
  };
};


/**
 *  OptionLocator for options identified by their labels.
 */
core.select.option.createTextLocator_ = function(text) {
  var matches = core.patternMatcher.against(text);

  return {
    findOption: function(element) {
      for (var i = 0; i < element.options.length; i++) {
        if (matches(element.options[i].text)) {
          return element.options[i];
        }
      }
      throw new core.Error("Option with label '" + text + "' not found");
    },

    assertSelected: function(element) {
      var selectedText = element.options[element.selectedIndex].text;
      if (!matches(selectedText)) {
        throw new core.Error("Expected text (" + text + ") did not match: " + selectedText);
      }
    }
  };
};


/**
 *  OptionLocator for options identified by their values.
 */
core.select.option.createValueLocator_ = function(value) {
  var matcher = core.patternMatcher.against(value);

  return {
    findOption: function(element) {
      for (var i = 0; i < element.options.length; i++) {
        if (matcher(element.options[i].value)) {
          return element.options[i];
        }
      }
      throw new core.Error("Option with value '" + value + "' not found");
    },

    assertSelected: function(element) {
      var selectedValue = element.options[element.selectedIndex].value;
      if (!matcher(selectedValue)) {
        throw new core.Error("Expected value (" + value + ") did not match: " + selectedValue);
      }
    }
  };
};


/**
 *  OptionLocator for options identified by their id.
 */
core.select.option.createIdLocator_ = function(id) {
  var matches = core.patternMatcher.against(id);

  return {
    findOption: function(element) {
      for (var i = 0; i < element.options.length; i++) {
        if (matches(element.options[i].id)) {
          return element.options[i];
        }
      }
      throw new core.Error("Option with id '" + id + "' not found");
    },

    assertSelected: function(element) {
      var selectedId = element.options[element.selectedIndex].id;
      if (!matches(selectedId)) {
        throw new core.Error("Expected id (" + id + ") did not match: " + selectedId);
      }
    }
  };
};


/**
 * Option location strategies.
 *
 * @const
 * @type {Object.<string, function(string) : core.select.option.Locator>}
 */
core.select.option.Locators_ = {
  'id': core.select.option.createIdLocator_,
  'index': core.select.option.createIndexLocator_,
  'label': core.select.option.createTextLocator_,
  'text': core.select.option.createTextLocator_,
  'value': core.select.option.createValueLocator_
};

/**
 * Find the correct option locator from a text locator.
 *
 * @param {string} optionLocator The option locator as text.
 * @return {!core.select.option.Locator} An option locator
 */
core.select.option.getOptionLocator_ = function(optionLocator) {
  var locatorType = 'label';
  var locatorValue = optionLocator;
  // If there is a locator prefix, use the specified strategy
  var result = optionLocator.match(/^([a-zA-Z]+)=(.*)/);
  if (result) {
    locatorType = result[1];
    locatorValue = result[2];
  }

  var locator = core.select.option.Locators_[locatorType];
  if (locator) {
    return locator(locatorValue);
  }
  throw new core.Error("Unknown option locator type: " + locatorType);
};


/**
 * @param {string | !Element} locator Locator for a SELECT element.
 * @return {!Element} The located SELECT element.
 */
core.select.findSelect = function(locator) {
  var element = goog.isString(locator) ? core.locators.findElement(locator) : locator;

  if (goog.isDef(element['options'])) {
    return element;
  }

  throw new core.Error("Specified element is not a Select (has no options)");
};


core.select.option.findOption = function(selectLocator, optionLocator) {
  var select = core.select.findSelect(selectLocator);
  var option = core.select.option.getOptionLocator_(optionLocator);

  return option.findOption(select);
};


core.select.findSelectedOptionProperties_ = function(locator, property) {
  var element = core.select.findSelect(locator);

  var selectedOptions = [];

  for (var i = 0; i < element.options.length; i++) {
    if (element.options[i].selected) {
      var propVal = element.options[i][property];
      selectedOptions.push(propVal);
    }
  }

  if (selectedOptions.length == 0) {
    throw new core.Error("No option selected");
  }

  return selectedOptions;
};


core.select.findSelectedOptionProperty_ = function(locator, property) {
  var selectedOptions = core.select.findSelectedOptionProperties_(locator, property);

  if (selectedOptions.length > 1) {
    throw new core.Error("More than one selected option!");
  }

  return selectedOptions[0];
};


/**
 * @param {string | !Element} locator an identifying for a SELECT element.
 * @return {boolean} Whether an some option has been selected.
 */
core.select.isSomethingSelected = function(locator) {
  var element = core.select.findSelect(locator);

  for (var i = 0; i < element.options.length; i++) {
    if (element.options[i].selected) {
      return true;
    }
  }
  return false;
};


/**
 * @param {string | Element} locator an identifying for a SELECT element.
 * @return {string} The visible text of the selected option.
 */
core.select.getSelectedText = function(locator) {
  // TODO: This doesn't match "bot.dom.getVisibleText"
  return core.select.findSelectedOptionProperty_(locator, "text");
};


core.select.setSelected = function(locator, optionLocator) {
  var select = core.select.findSelect(locator);
  var foo = core.select.option.getOptionLocator_(optionLocator);
  var option = foo.findOption(select);

  if (!bot.dom.isSelected(option)) {
    bot.action.click(option);
  }
};
