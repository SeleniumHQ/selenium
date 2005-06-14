/*
 * Copyright 2004 ThoughtWorks, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

storedVars = new Object();

var nextExecution;
function executeNext() {
    LOG.debug("CODED - LOAD");
    if (nextExecution) {
        nextExecution();
    }
    nextExecution = null;
}

var assert = new Assert();
function Selenium(browserbot) {
    this.browserbot = browserbot;
    this.optionLocatorFactory = new OptionLocatorFactory();
    this.page = function() {
        return browserbot.getCurrentPage();
    };

    var self = this;

    this.callOnNextPageLoad = function(callback) {
        nextExecution = callback;
        self.browserbot.callOnNextPageLoad(executeNext);
    };
}

/*
 * Reset the browserbot when an error occurs..
 */
Selenium.prototype.reset = function() {
    storedVars = new Object();
    this.browserbot.selectWindow("null");
};

/*
 * Click on the located element, and attach a callback to notify
 * when the page is reloaded.
 */
Selenium.prototype.doModalDialogTest = function(returnValue) {
    this.browserbot.doModalDialogTest(returnValue);
};

/*
 * Click on the located element, and attach a callback to notify
 * when the page is reloaded.
 */
Selenium.prototype.doClick = function(locator) {
    var element = this.page().findElement(locator);
    this.page().clickElement(element);
};

/**
 * Overwrite the text in the located text element.
 * TODO fail if it can't be typed into.
 */
Selenium.prototype.doType = function(locator, newText) {
    var element = this.page().findElement(locator);
    this.page().replaceText(element, newText);
};

/**
 * Select the option from the located select element.
 */
Selenium.prototype.doSelect = function(locator, optionLocator) {
    var element = this.page().findElement(locator);
    if (!("options" in element)) {
        throw new Error("Specified element is not a Select (has no options)");
    }
    var locator = this.optionLocatorFactory.fromLocatorString(optionLocator);
    var option = locator.findOption(element);
    this.page().selectOption(element, option);
};

/*
 * Open the browser to a new location.
 */
Selenium.prototype.doOpen = function(newLocation) {
    this.browserbot.openLocation(newLocation);
    return SELENIUM_PROCESS_WAIT;
};

/*
 * Select the named window to be the active window.
 */
Selenium.prototype.doSelectWindow = function(windowName) {
    this.browserbot.selectWindow(windowName);
};

/*
 * Instruct Selenium to click Cancel on the next confirm dialog it encounters
 */
Selenium.prototype.doChooseCancelOnNextConfirmation = function() {
    this.browserbot.cancelNextConfirmation();
};

/*
 * Simulate the browser back button
 */
Selenium.prototype.doGoBack = function() {
    this.page().goBack();
};

/*
 *  Asserts that the supplied message was received as an alert
 */
 Selenium.prototype.assertAlert = function(expectedAlert) {
    if ( this.browserbot.hasAlerts()) {
        
        receivedAlert = this.browserbot.getNextAlert();
        if ( receivedAlert != expectedAlert ) {
           assert.fail("The alert was [" + receivedAlert + "]");
        }
                          
    } else {
        assert.fail("There were no alerts");
    }
 };

  /*
  *  Asserts that the supplied message was received as a confirmation
  */
  Selenium.prototype.assertConfirmation = function(expectedConfirmation) {
     if ( this.browserbot.hasConfirmations()) {
         
         receivedConfirmation = this.browserbot.getNextConfirmation();
         if ( receivedConfirmation != expectedConfirmation ) {
            assert.fail("The confirmation message was [" + receivedConfirmation + "]");
         }
                           
     } else {
         assert.fail("There were no confirmations");
     }
  };
 
/*
 * Verify the location of the current page.
 */
Selenium.prototype.assertAbsoluteLocation = function(expectedLocation) {
    assert.assertMatches(expectedLocation, this.page().location);
};


/*
 * Verify the location of the current page ends with the expected location
 */
Selenium.prototype.assertLocation = function(expectedLocation) {
    var docLocation = this.page().location.toString();
    if (docLocation.length != docLocation.indexOf(expectedLocation) + expectedLocation.length)
    {
        assert.fail("Expected location to end with '" + expectedLocation
             + "' but was '" + docLocation + "'");
    }
};

/*
 * Verify the title of the current page.
 */
Selenium.prototype.assertTitle = function(expectedTitle) {
    assert.assertMatches(expectedTitle, this.page().title());
};

/*
 * Verify the value of a form element.
 */
Selenium.prototype.assertValue = function(locator, expectedValue) {
    var element = this.page().findElement(locator);
    var actualValue = getInputValue(element);
    assert.assertMatches(expectedValue, actualValue.trim());
};

/*
 * Verifies that the text of the located element matches the expected content.
 */
Selenium.prototype.assertText = function(locator, expectedContent) {
    var element = this.page().findElement(locator);
    var actualText = getText(element);
    assert.assertMatches(expectedContent, actualText.trim());
};

/*
 * Asserts that the text for a single cell within and HTML table matches the expected content.
 * The table locator syntax is table.row.column.
 */
Selenium.prototype.assertTable = function(tableLocator, expectedContent) {
    // This regular expression matches "tableName.row.column"
    // For example, "mytable.3.4"
    pattern = /(.*)\.(\d+)\.(\d+)/;

    if(!pattern.test(tableLocator)) {
        assert.fail("Invalid target format. Correct format is tableName.rowNum.columnNum");
    }

    pieces = tableLocator.match(pattern);

    tableName = pieces[1];
    row = pieces[2];
    col = pieces[3];

    var table = this.page().findElement(tableName);
    if (row > table.rows.length) {
        assert.fail("Cannot access row " + row + " - table has " + table.rows.length + " rows");
    }
    else if (col > table.rows[row].cells.length) {
        assert.fail("Cannot access column " + col + " - table row has " + table.rows[row].cells.length + " columns");
    }
    else {
        actualContent = getText(table.rows[row].cells[col]);
        assert.assertMatches(expectedContent, actualContent.trim());
    }
};

/**
 * Verify that the selected option satisfies the option locator.
 */
Selenium.prototype.assertSelected = function(target, optionLocator) {
    var element = this.page().findElement(target);
    var locator = this.optionLocatorFactory.fromLocatorString(optionLocator);
    locator.assertSelected(element);
};

String.prototype.parseCSV = function() {
    var values = this.replace(/\\,/g, "\n").split(",");
    // Restore escaped commas
    for (var i = 0; i < values.length; i++) {
        values[i] = values[i].replace(/\n/g, ",").trim();
    }
    return values;
};

/**
 * Verify the label of all of the options in the drop=down.
 */
Selenium.prototype.assertSelectOptions = function(target, options) {
    var element = this.page().findElement(target);

    var expectedOptionLabels = options.parseCSV();
    assert.equals("Wrong number of options.", expectedOptionLabels.length, element.options.length);

    for (var i = 0; i < element.options.length; i++) {
        assert.assertMatches(expectedOptionLabels[i], element.options[i].text);
    }
};

/**
 * Verify the value of an element attribute. The syntax for returning an element attribute
 * is <element-locator>@attribute-name
 */
Selenium.prototype.assertAttribute = function(target, expected) {
    var attributeValue = this.page().findAttribute(target);
    assert.assertMatches(expected, attributeValue);
};

/*
 * Asserts that the specified text is present in the page content.
 */
Selenium.prototype.assertTextPresent = function(expectedText) {
    var allText = this.page().bodyText();

    if(allText == "") {
        assert.fail("Page text not found");
    } else if(allText.indexOf(expectedText) == -1) {
        assert.fail("'" + expectedText + "' not found in page text.");
    }
};

/*
 * Asserts that the specified text is NOT present in the page content.
 */
Selenium.prototype.assertTextNotPresent = function(unexpectedText) {
    var allText = this.page().bodyText();

    if(allText == "") {
        assert.fail("Page text not found");
    } else if(allText.indexOf(unexpectedText) != -1) {
        assert.fail("'" + unexpectedText + "' was found in page text.");
    }
};

/*
 * Asserts that the specified element can be found.
 */
Selenium.prototype.assertElementPresent = function(locator) {
    try {
        this.page().findElement(locator);
    } catch (e) {
        assert.fail("Element " + locator + " not found.");
    }
};

/*
 * Asserts that the specified element cannot be found.
 */
Selenium.prototype.assertElementNotPresent = function(locator) {
    try {
        this.page().findElement(locator);
    }
    catch (e) {
        return;
    }
    assert.fail("Element " + locator + " found.");
};

/*
 * Asserts that the specified element is visible
 */
Selenium.prototype.assertVisible = function(locator) {
    var element;
    try {
        element = this.page().findElement(locator);
    } catch (e) {
        assert.fail("Element " + locator + " not present.");
    }
    if (! this.isVisible(element)) {
        assert.fail("Element " + locator + " not visible.");
    }
};

/*
 * Asserts that the specified element is visible
 */
Selenium.prototype.assertNotVisible = function(locator) {
    var element;
    try {
        element = this.page().findElement(locator);
    } catch (e) {
        return;
    }
    if (this.isVisible(element)) {
        assert.fail("Element " + locator + " is visible.");
    }
};

Selenium.prototype.isVisible = function(element) {
    var visibility = this.getEffectiveStyleProperty(element, "visibility");
    var isDisplayed = this.isDisplayed(element);
    return (visibility != "hidden" && isDisplayed);
};

Selenium.prototype.getEffectiveStyleProperty = function(element, property) {
    var effectiveStyle = this.getEffectiveStyle(element);
    var propertyValue = effectiveStyle[property];
    if (propertyValue == 'inherit' && element.parentNode.style) {
        return this.getEffectiveStyleProperty(element.parentNode, property);
    }
    return propertyValue;
};

Selenium.prototype.isDisplayed = function(element) {
    var display = this.getEffectiveStyleProperty(element, "display");
    if (display == "none") return false;
    if (element.parentNode.style) {
        return this.isDisplayed(element.parentNode);
    }
    return true;
};

Selenium.prototype.getEffectiveStyle = function(element) {
    if (element.style == undefined) {
        return undefined; // not a styled element
    }
    var window = this.browserbot.getContentWindow();
    if (window.getComputedStyle) { 
        // DOM-Level-2-CSS
        return window.getComputedStyle(element, null);
    }
    if (element.currentStyle) {
        // non-standard IE alternative
        return element.currentStyle;
        // TODO: this won't really work in a general sense, as
        //   currentStyle is not identical to getComputedStyle()
        //   ... but it's good enough for "visibility"
    }
    throw new Error("cannot determine effective stylesheet in this browser");
};

/**
 * Asserts that the specified element accepts user input visible
 */
Selenium.prototype.assertEditable = function(locator) {
    var element = this.page().findElement(locator);
    if (element.value == undefined) {
        assert.fail("Element " + locator + " is not an input.");
    }
    if (element.disabled) {
        assert.fail("Element " + locator + " is disabled.");
    }
};

/**
 * Asserts that the specified element does not accept user input
 */
Selenium.prototype.assertNotEditable = function(locator) {
    var element = this.page().findElement(locator);
    if (element.value == undefined) {
        return; // not an input
    }
    if (element.disabled == false) {
        assert.fail("Element " + locator + " is editable.");
    }
};

 /*
  * Return all buttons on the screen.
  */
Selenium.prototype.getAllButtons = function() {
        return this.page().getAllButtons();
};

 /*
  * Return all links on the screen.
  */
Selenium.prototype.getAllLinks = function() {
        return this.page().getAllLinks();
};

 /*
  * Return all fields on the screen.
  */
Selenium.prototype.getAllFields = function() {
        return this.page().getAllFields();
};

/*
 * Set the context for the current Test
 */
Selenium.prototype.doContext = function(context) {
        return this.page().setContext(context);
};

/*
 * Store the value of a form input in a variable
 */
Selenium.prototype.doStoreValue = function(target, varName) {
    if (!varName) {
        // Backward compatibility mode: read the ENTIRE text of the page
        // and stores it in a variable with the name of the target
        value = this.page().bodyText();
        storedVars[target] = value;
        return;
    }
    var element = this.page().findElement(target);
    storedVars[varName] = getInputValue(element);
};

/*
 * Store the text of an element in a variable
 */
Selenium.prototype.doStoreText = function(target, varName) {
    var element = this.page().findElement(target);
    storedVars[varName] = getText(element);
};

/*
 * Store the result of a literal value
 */
Selenium.prototype.doStore = function(value, varName) {
    storedVars[varName] = value;
};


/*
 * Wait for the target to have the specified value by polling.
 * The polling is done in TestLoop.kickoffNextCommandExecution()
 */
Selenium.prototype.doWaitFor = function (target, value) {
    var e = this.page().findElement(target);
    testLoop.waitForCondition = function () {
        return (e.value == value);
    };
};

/**
 * Evaluate a parameter, performing javascript evaluation and variable substitution.
 * If the string matches the pattern "javascript{ ... }", evaluate the string between the braces.
 */
Selenium.prototype.preprocessParameter = function(value) {
    var match = value.match(/^javascript\{(.+)\}$/);
    if (match && match[1]) {
        return eval(match[1]).toString();
    }
    return this.replaceVariables(value);
};

/*
 * Search through str and replace all variable references ${varName} with their
 * value in storedVars.
 */
Selenium.prototype.replaceVariables = function(str) {
    var stringResult = str;

    // Find all of the matching variable references
    var match = stringResult.match(/\$\{\w+\}/g);
    if (!match) {
        return stringResult;
    }

    // For each match, lookup the variable value, and replace if found
    for (var i = 0; match && i < match.length; i++) {
        var variable = match[i]; // The replacement variable, with ${}
        var name = variable.substring(2, variable.length - 1); // The replacement variable without ${}
        var replacement = storedVars[name];
        if (replacement != undefined) {
            stringResult = stringResult.replace(variable, replacement);
        }
    }
    return stringResult;
};

function Assert() {
    this.patternMatcher = new PatternMatcher();
}

Assert.prototype.equals = function() {
        if (arguments.length == 2)
        {
            var comment = "";
            var expected = arguments[0];
            var actual = arguments[1];
        }
        else {
            var comment = arguments[0] + " ";
            var expected = arguments[1];
            var actual = arguments[2];
        }

        if (expected === actual) {
            return;
        }
        var errorMessage = comment + "Expected '" + expected + "' but was '" + actual + "'";

        throw new AssertionFailedError(errorMessage);
};

Assert.prototype.fail = function(message) {
        throw new AssertionFailedError(message);
};

/*
 * assertMatches(comment?, pattern, actual)
 */
Assert.prototype.assertMatches = function() {
    if (arguments.length == 2)
    {
        var comment = "";
        var pattern = arguments[0];
        var actual = arguments[1];
    }
    else {
        var comment = arguments[0] + "; ";
        var pattern = arguments[1];
        var actual = arguments[2];
    }

    if (this.patternMatcher.matches(pattern, actual)) {
        return;
    }

    var errorMessage = comment + 
        "Actual value '" + actual + "' did not match '" + pattern + "'";
    assert.fail(errorMessage);
};


function AssertionFailedError(message) {
    this.isAssertionFailedError = true;
    this.failureMessage = message;
}

function PatternMatcher() {
    this.matches = function(pattern, actual) {
        var regexp = new RegExp(this.globToRegexp(pattern));
        // Work around Konqueror bug when matching empty strings.
        var testString = '' + actual;
        return regexp.test(testString);
    };
    this.globToRegexp = function(glob) {
        var pattern = glob;
        pattern = pattern.replace(/([.^$+(){}[\]\\|])/g, "\\$1");
        pattern = pattern.replace(/\?/g, ".");
        pattern = pattern.replace(/\*/g, ".*");
        return "^" + pattern + "$";
    };
}

/**
 *  Factory for creating "Option Locators".
 *  An OptionLocator is an object for dealing with Select options (e.g. for
 *  finding a specified option, or asserting that the selected option of 
 *  Select element matches some condition.
 *  The type of locator returned by the factory depends on the locator string:
 *     label=<exp>  (OptionLocatorByLabel)
 *     value=<exp>  (OptionLocatorByValue)
 *     index=<exp>  (OptionLocatorByIndex)
 *     <exp> (default is OptionLocatorByLabel).
 * TODO: This should be modified to allow the easy addition of new locator types
 * without having to modify the fromLocatorString() method.
 */
function OptionLocatorFactory() {
    this.fromLocatorString = function(locatorString) {
        var locatorType = 'label';
        var locatorValue = locatorString;
        // If there is a locator prefix, use the specified strategy
        var result = locatorString.match(/^([a-zA-Z]+)=(.*)/);
        if (result) {
            locatorType = result[1];
            locatorValue = result[2];
        }
        if ('label' == locatorType) {
            return new OptionLocatorByLabel(locatorValue);
        } else if ('index' == locatorType) {
            return new OptionLocatorByIndex(locatorValue);
        } else if ('value' == locatorType) {
            return new OptionLocatorByValue(locatorValue);
        }
        throw new Error("Unkown option locator type: " + locatorType);
    };
}

/**
 *  OptionLocator for options identified by their labels.
 */
function OptionLocatorByLabel(label) {
    this.label = label;
    this.patternMatcher = new PatternMatcher();
    this.findOption = function(element) {
        for (var i = 0; i < element.options.length; i++) {
            if (this.patternMatcher.matches(this.label, element.options[i].text)) {
                return element.options[i];
            }
        }
        throw new Error("Option with label '" + this.label + "' not found");
    };

    this.assertSelected = function(element) {
        var selectedLabel = element.options[element.selectedIndex].text;
        assert.assertMatches(this.label, selectedLabel);
    };
}

/**
 *  OptionLocator for options identified by their values.
 */
function OptionLocatorByValue(value) {
    this.value = value;
    this.patternMatcher = new PatternMatcher();
    this.findOption = function(element) {
        for (var i = 0; i < element.options.length; i++) {
            if (this.patternMatcher.matches(this.value, element.options[i].value)) {
                return element.options[i];
            }
        }
        throw new Error("Option with value '" + this.value + "' not found");
    };

    this.assertSelected = function(element) {
        var selectedValue = element.options[element.selectedIndex].value;
        assert.assertMatches(this.value, selectedValue);
    };
}

/**
 *  OptionLocator for options identified by their index.
 */
function OptionLocatorByIndex(index) {
    this.index = Number(index);
    if (isNaN(this.index) || this.index < 0) {
        throw new Error("Illegal Index: " + index);
    }

    this.findOption = function(element) {
        if (element.options.length <= this.index) {
            throw new Error("Index out of range.  Only " + element.options.length + " options available");
        }
        return element.options[this.index];
    };

    this.assertSelected = function(element) {
        assert.equals(this.index, element.selectedIndex);
    };
}


