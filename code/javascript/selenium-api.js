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
 * Select the option by label from the located select element.
 * TODO fail if it's not a select.
 */
Selenium.prototype.doSelect = function(locator, optionText) {
    var element = this.page().findElement(locator);
    this.page().selectOptionWithLabel(element, optionText);
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
    this.assertMatches(expectedLocation, this.page().location);
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
    this.assertMatches(expectedTitle, this.page().title());
};

/*
 * Verify the value of a form element.
 */
Selenium.prototype.assertValue = function(locator, expectedValue) {
    var element = this.page().findElement(locator);
    var actualValue = getInputValue(element);
    this.assertMatches(expectedValue, actualValue.trim());
};

/*
 * Verifies that the text of the located element matches the expected content.
 */
Selenium.prototype.assertText = function(locator, expectedContent) {
    var element = this.page().findElement(locator);
    var actualText = getText(element);
    this.assertMatches(expectedContent, actualText.trim());
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
        this.assertMatches(expectedContent, actualContent.trim());
    }
};

/**
 * Verify the label of the option that is selected.
 */
Selenium.prototype.assertSelected = function(target, expectedLabel) {
    var element = this.page().findElement(target);
    var selectedLabel = element.options[element.selectedIndex].text;
    this.assertMatches(expectedLabel, selectedLabel);
};

/**
 * Verify the label of all of the options in the drop=down.
 */
Selenium.prototype.assertSelectOptions = function(target, options) {
    // Handle escpaced commas, by substitutine newlines.
    options = options.replace("\\,", "\n");
    var expectedOptions = options.split(",");
    var element = this.page().findElement(target);

    assert.equals("Wrong number of options.", expectedOptions.length, element.options.length);

    for (var i = 0; i < element.options.length; i++) {
        var option = element.options[i];
        // Put the escaped commas back in.
        var expectedOption = expectedOptions[i].replace("\n", ",");
        this.assertMatches(expectedOption, option.text);
    }
};

/**
 * Verify the value of an element attribute. The syntax for returning an element attribute
 * is <element-locator>@attribute-name
 */
Selenium.prototype.assertAttribute = function(target, expected) {
    var attributeValue = this.page().findAttribute(target);
    this.assertMatches(expected, attributeValue);
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

function Assert() {
    this.equals = function()
    {
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

    this.fail = function(message)
    {
        throw new AssertionFailedError(message);
    };
}

function AssertionFailedError(message) {
    this.isAssertionFailedError = true;
    this.failureMessage = message;
}

/*
 * assertMatches(comment?, pattern, actual)
 */
Selenium.prototype.assertMatches = function() {
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

    if (this.matches(pattern, actual)) {
        return;
    }

    var errorMessage = comment + 
        "Actual value '" + actual + "' did not match '" + pattern + "'";
    assert.fail(errorMessage);
};

Selenium.prototype.globToRegexp = function(glob) {
    var pattern = glob;
    pattern = pattern.replace(/([.^$+(){}[\]\\|])/g, "\\$1");
    pattern = pattern.replace(/\?/g, ".");
    pattern = pattern.replace(/\*/g, ".*");
    return "^" + pattern + "$";
};

Selenium.prototype.matches = function(pattern, actual) {
    var regexp = new RegExp(this.globToRegexp(pattern));
    // Work around Konqueror bug when matching empty strings.
    var testString = '' + actual;
    return regexp.test(testString);
};
