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

function Selenium(browserbot) {
    this.browserbot = browserbot;
    this.optionLocatorFactory = new OptionLocatorFactory();
    this.page = function() {
        return browserbot.getCurrentPage();
    };
}

Selenium.createForFrame = function(frame) {
    return new Selenium(BrowserBot.createForFrame(frame));
};

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
Selenium.prototype.doClick = function(locator) {
    var element = this.page().findElement(locator);
    this.page().clickElement(element);
};

/*
 * FJH Key, Mouse event on the located element
 */
Selenium.prototype.doKeyPress = function(locator, keycode) {
    var element = this.page().findElement(locator);
    this.page().keypressElement(element, keycode);
};
Selenium.prototype.doKeyDown = function(locator, keycode) {
    var element = this.page().findElement(locator);
    this.page().keydownElement(element, keycode);
};
Selenium.prototype.doMouseOver = function(locator) {
    var element = this.page().findElement(locator);
    this.page().mouseoverElement(element);
};
Selenium.prototype.doMouseDown = function(locator) {
    var element = this.page().findElement(locator);
    this.page().mousedownElement(element);
};
/* END FJH */

/**
 * Overwrite the text in the located text element.
 * TODO fail if it can't be typed into.
 */
Selenium.prototype.doType = function(locator, newText) {
    var element = this.page().findElement(locator);
    this.page().replaceText(element, newText);
};

Selenium.prototype.findToggleButton = function(locator) {
    var element = this.page().findElement(locator);
    if (element.checked == null) {
        Assert.fail("Element " + locator + " is not a toggle-button.");
    }
    return element;
}

/**
 * Check a toggle-button.
 */
Selenium.prototype.doCheck = function(locator) {
    this.findToggleButton(locator).checked = true;
};

/**
 * Uncheck a toggle-button.
 */
Selenium.prototype.doUncheck = function(locator) {
    this.findToggleButton(locator).checked = false;
};

/**
 * Select the option from the located select element.
 */
Selenium.prototype.doSelect = function(locator, optionLocator) {
    var element = this.page().findElement(locator);
    if (!("options" in element)) {
        throw new SeleniumError("Specified element is not a Select (has no options)");
    }
    var locator = this.optionLocatorFactory.fromLocatorString(optionLocator);
    var option = locator.findOption(element);
    this.page().selectOption(element, option);
};

/**
 * Submit a form, without clicking a submit button.
 */
Selenium.prototype.doSubmit = function(formLocator) {
    var form = this.page().findElement(formLocator);
    if (!form.onsubmit || form.onsubmit()) {
        form.submit();
    }
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
 * Instruct Selenium what to answear on the next prompt dialog it encounters
 */
Selenium.prototype.doAnswerOnNextPrompt = function(answer) {
    this.browserbot.setNextPromptResult(answer);
};

/*
 * Simulate the browser back button
 */
Selenium.prototype.doGoBack = function() {
    this.page().goBack();
};

/*
 * Close the browser window or tab
 */
Selenium.prototype.doClose = function() {
    this.page().close();
};

/*
 * Explicitly fire an event
 */
Selenium.prototype.doFireEvent = function(locator, event) {
    var element = this.page().findElement(locator);
    triggerEvent(element, event, false);
};

/*
 * Get an alert message, or fail if there were no alerts.
 */
Selenium.prototype.getAlert = function() {
    if (!this.browserbot.hasAlerts()) {
        Assert.fail("There were no alerts");
    }
    return this.browserbot.getNextAlert();
};
Selenium.prototype.getAlert.dontCheckAlertsAndConfirms = true;

/*
 * Get a confirmation message, or fail if there were no confirmations.
 */
Selenium.prototype.getConfirmation = function() {
    if (!this.browserbot.hasConfirmations()) {
        Assert.fail("There were no confirmations");
    }
    return this.browserbot.getNextConfirmation();
};
Selenium.prototype.getConfirmation.dontCheckAlertsAndConfirms = true;
 
/*
 * Get a prompt message, or fail if there were no prompts.
 */
Selenium.prototype.getPrompt = function() {
    if (! this.browserbot.hasPrompts()) {
        Assert.fail("There were no prompts");
    }
    return this.browserbot.getNextPrompt();
};

/*
 * Get the location of the current page.
 */
Selenium.prototype.getAbsoluteLocation = function() {
    return this.page().location;
};

/*
 * Verify the location of the current page ends with the expected location.
 * If a querystring is provided, this is checked as well.
 */
Selenium.prototype.assertLocation = function(expectedLocation) {
    var docLocation = this.page().location;
    var searchPos = expectedLocation.lastIndexOf('?');

    if (searchPos == -1) {
        Assert.matches('*' + expectedLocation, docLocation.pathname);
    }
    else {
        var expectedPath = expectedLocation.substring(0, searchPos);
        Assert.matches('*' + expectedPath, docLocation.pathname);

        var expectedQueryString = expectedLocation.substring(searchPos);
        Assert.equals(expectedQueryString, docLocation.search);
    }
};

/*
 * Get the title of the current page.
 */
Selenium.prototype.getTitle = function() {
    return this.page().title();
};

/*
 * Get the entire text of the page.
 * Note that various commands are generated from this, including
 * assertBodyText, verifyBodyText, storeBodyText...
 */
Selenium.prototype.getBodyText = function() {
    return this.page().bodyText();
};


/*
 * Get the (trimmed) value of a form element.
 * This is used to generate assertValue, verifyValue, ...
 */
Selenium.prototype.getValue = function(locator) {
    var element = this.page().findElement(locator)
    return getInputValue(element).trim();
}

/**
 * Get the (trimmed) text of a form element.
 * This is used to generate assertText, verifyText, ...
 */
Selenium.prototype.getText = function(locator) {
    var element = this.page().findElement(locator);
    return getText(element).trim();
};

/**
 * Add an eval verb to extend Selenium on-the-fly.
 * Add a getter so verifyEval and assertEval can be autogenerated,
 * and so drivers can extract information from the browser
 */
Selenium.prototype.getEval = function(script) {
    try {
    	return eval(script);
    } catch (e) {
    	throw new SeleniumError("Threw an exception: " + e.message);
    }
};

/**
 * Get whether a toggle-button is checked.  (used to generate verify/assertChecked)
 */
Selenium.prototype.getChecked = function(locator) {
    var element = this.page().findElement(locator);
    if (element.checked == null) {
        throw new SeleniumError("Element " + locator + " is not a toggle-button.");
    }
    return element.checked;
};

/*
 * Return the text for a single cell within an HTML table.
 * The table locator syntax is table.row.column.
 */
Selenium.prototype.getTable = function(tableLocator) {
    // This regular expression matches "tableName.row.column"
    // For example, "mytable.3.4"
    pattern = /(.*)\.(\d+)\.(\d+)/;

    if(!pattern.test(tableLocator)) {
        throw new SeleniumError("Invalid target format. Correct format is tableName.rowNum.columnNum");
    }

    pieces = tableLocator.match(pattern);

    tableName = pieces[1];
    row = pieces[2];
    col = pieces[3];

    var table = this.page().findElement(tableName);
    if (row > table.rows.length) {
        Assert.fail("Cannot access row " + row + " - table has " + table.rows.length + " rows");
    }
    else if (col > table.rows[row].cells.length) {
        Assert.fail("Cannot access column " + col + " - table row has " + table.rows[row].cells.length + " columns");
    }
    else {
        actualContent = getText(table.rows[row].cells[col]);
        return actualContent.trim();
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


/**
 * Get the labels of all of the options in the drop-down (generates assert/verifySelectOptions)
 */
Selenium.prototype.getSelectOptions = function(target) {
    var element = this.page().findElement(target);

	var selectOptions = "";

    for (var i = 0; i < element.options.length; i++) {
    	var option = element.options[i].text.replace(/,/g, "\\,");
    	selectOptions += option;
    	if (i != element.options.length-1) selectOptions += ",";
    }
    return selectOptions;
};


/**
 * Get the value of an element attribute. The syntax for returning an element attribute
 * is <element-locator>@attribute-name.  Used to generate assert, verify, assertNot...
 */
Selenium.prototype.getAttribute = function(target) {
    return this.page().findAttribute(target);
};

/*
 * Asserts that the specified text is present in the page content.
 */
Selenium.prototype.assertTextPresent = function(expectedText) {
    var allText = this.page().bodyText();

    if(allText == "") {
        Assert.fail("Page text not found");
    } else if(allText.indexOf(expectedText) == -1) {
        Assert.fail("'" + expectedText + "' not found in page text.");
    }
};

/*
 * Asserts that the specified text is NOT present in the page content.
 */
Selenium.prototype.assertTextNotPresent = function(unexpectedText) {
    var allText = this.page().bodyText();

    if(allText == "") {
        Assert.fail("Page text not found");
    } else if(allText.indexOf(unexpectedText) != -1) {
        Assert.fail("'" + unexpectedText + "' was found in page text.");
    }
};

/*
 * Asserts that the specified element can be found.
 */
Selenium.prototype.assertElementPresent = function(locator) {
    try {
        this.page().findElement(locator);
    } catch (e) {
        Assert.fail("Element " + locator + " not found.");
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
    Assert.fail("Element " + locator + " found.");
};

/*
 * Asserts that the specified element is visible
 */
Selenium.prototype.assertVisible = function(locator) {
    var element;
    try {
        element = this.page().findElement(locator);
    } catch (e) {
        Assert.fail("Element " + locator + " not present.");
    }
    if (! this.isVisible(element)) {
        Assert.fail("Element " + locator + " not visible.");
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
        Assert.fail("Element " + locator + " is visible.");
    }
};

Selenium.prototype.isVisible = function(element) {
    var visibility = this.findEffectiveStyleProperty(element, "visibility");
    var isDisplayed = this.isDisplayed(element);
    return (visibility != "hidden" && isDisplayed);
};

Selenium.prototype.findEffectiveStyleProperty = function(element, property) {
    var effectiveStyle = this.findEffectiveStyle(element);
    var propertyValue = effectiveStyle[property];
    if (propertyValue == 'inherit' && element.parentNode.style) {
        return this.findEffectiveStyleProperty(element.parentNode, property);
    }
    return propertyValue;
};

Selenium.prototype.isDisplayed = function(element) {
    var display = this.findEffectiveStyleProperty(element, "display");
    if (display == "none") return false;
    if (element.parentNode.style) {
        return this.isDisplayed(element.parentNode);
    }
    return true;
};

Selenium.prototype.findEffectiveStyle = function(element) {
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
    throw new SeleniumError("cannot determine effective stylesheet in this browser");
};

/**
 * Asserts that the specified element accepts user input visible
 */
Selenium.prototype.assertEditable = function(locator) {
    var element = this.page().findElement(locator);
    if (element.value == undefined) {
        Assert.fail("Element " + locator + " is not an input.");
    }
    if (element.disabled) {
        Assert.fail("Element " + locator + " is disabled.");
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
        Assert.fail("Element " + locator + " is editable.");
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

Selenium.prototype.getAllActions = function() {
	var actionList = "";
	for (var action in testLoop.commandFactory.actions) {
		actionList += action + ",";
	}
	return actionList;
}

Selenium.prototype.getAllAccessors = function() {
	var actionList = "";
	for (var action in testLoop.commandFactory.accessors) {
		actionList += action + ",";
	}
	return actionList;
}

Selenium.prototype.getAllAsserts = function() {
	var actionList = "";
	for (var action in testLoop.commandFactory.asserts) {
		actionList += action + ",";
	}
	return actionList;
}

 /*
  * Return all fields on the screen.
  */
Selenium.prototype.getAllFields = function() {
        return this.page().getAllFields();
};

/*
 * Set the context for the current Test
 */
Selenium.prototype.doSetContext = function(context, logLevelThreshold) {
    if  (logLevelThreshold==null || logLevelThreshold=="") {
    	return this.page().setContext(context);
    }
    return this.page().setContext(context, logLevelThreshold);
};

/*
 * Return the specified expression.  Is useful because of preprocessing.
 * Used to generate commands like assertExpression and storeExpression.
 * e.g. assertExpression | ${xyz} | foo
 */
Selenium.prototype.getExpression = function(expression) {
	return expression;
}

/*
 * Wait for the specified script to evaluate to true.
 */
Selenium.prototype.doWaitForCondition = function(script, timeout) {
    if (isNaN(timeout)) {
    	throw new SeleniumError("Timeout is not a number: " + timeout);
    }
    
    testLoop.waitForCondition = function () {
        return eval(script);
    };
    
    testLoop.waitForConditionStart = new Date().getTime();
    testLoop.waitForConditionTimeout = timeout;
};

/*
 * Wait for a new page to load.
 */
Selenium.prototype.doWaitForPageToLoad = function(timeout) {
    this.doWaitForCondition("selenium.browserbot.isNewPageLoaded()", timeout);
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


/**
 *  Factory for creating "Option Locators".
 *  An OptionLocator is an object for dealing with Select options (e.g. for
 *  finding a specified option, or asserting that the selected option of 
 *  Select element matches some condition.
 *  The type of locator returned by the factory depends on the locator string:
 *     label=<exp>  (OptionLocatorByLabel)
 *     value=<exp>  (OptionLocatorByValue)
 *     index=<exp>  (OptionLocatorByIndex)
 *     id=<exp>     (OptionLocatorById)
 *     <exp> (default is OptionLocatorByLabel).
 */
function OptionLocatorFactory() {
}

OptionLocatorFactory.prototype.fromLocatorString = function(locatorString) {
    var locatorType = 'label';
    var locatorValue = locatorString;
    // If there is a locator prefix, use the specified strategy
    var result = locatorString.match(/^([a-zA-Z]+)=(.*)/);
    if (result) {
        locatorType = result[1];
        locatorValue = result[2];
    }
    if (this.optionLocators == undefined) {
        this.registerOptionLocators();
    }
    if (this.optionLocators[locatorType]) {
        return new this.optionLocators[locatorType](locatorValue);
    }
    throw new SeleniumError("Unkown option locator type: " + locatorType);
};

/**
 * To allow for easy extension, all of the option locators are found by
 * searching for all methods of OptionLocatorFactory.prototype that start
 * with "OptionLocatorBy".
 * TODO: Consider using the term "Option Specifier" instead of "Option Locator".
 */
OptionLocatorFactory.prototype.registerOptionLocators = function() {
    this.optionLocators={};
    for (var functionName in this) {
      var result = /OptionLocatorBy([A-Z].+)$/.exec(functionName);
      if (result != null) {
          var locatorName = result[1].lcfirst();
          this.optionLocators[locatorName] = this[functionName];
      }
    }
};

/**
 *  OptionLocator for options identified by their labels.
 */
OptionLocatorFactory.prototype.OptionLocatorByLabel = function(label) {
    this.label = label;
    this.labelMatcher = new PatternMatcher(this.label);
    this.findOption = function(element) {
        for (var i = 0; i < element.options.length; i++) {
            if (this.labelMatcher.matches(element.options[i].text)) {
                return element.options[i];
            }
        }
        throw new SeleniumError("Option with label '" + this.label + "' not found");
    };

    this.assertSelected = function(element) {
        var selectedLabel = element.options[element.selectedIndex].text;
        Assert.matches(this.label, selectedLabel);
    };
};

/**
 *  OptionLocator for options identified by their values.
 */
OptionLocatorFactory.prototype.OptionLocatorByValue = function(value) {
    this.value = value;
    this.valueMatcher = new PatternMatcher(this.value);
    this.findOption = function(element) {
        for (var i = 0; i < element.options.length; i++) {
            if (this.valueMatcher.matches(element.options[i].value)) {
                return element.options[i];
            }
        }
        throw new SeleniumError("Option with value '" + this.value + "' not found");
    };

    this.assertSelected = function(element) {
        var selectedValue = element.options[element.selectedIndex].value;
        Assert.matches(this.value, selectedValue);
    };
};

/**
 *  OptionLocator for options identified by their index.
 */
OptionLocatorFactory.prototype.OptionLocatorByIndex = function(index) {
    this.index = Number(index);
    if (isNaN(this.index) || this.index < 0) {
        throw new SeleniumError("Illegal Index: " + index);
    }

    this.findOption = function(element) {
        if (element.options.length <= this.index) {
            throw new SeleniumError("Index out of range.  Only " + element.options.length + " options available");
        }
        return element.options[this.index];
    };

    this.assertSelected = function(element) {
        Assert.equals(this.index, element.selectedIndex);
    };
};

/**
 *  OptionLocator for options identified by their id.
 */
OptionLocatorFactory.prototype.OptionLocatorById = function(id) {
    this.id = id;
    this.idMatcher = new PatternMatcher(this.id);
    this.findOption = function(element) {
        for (var i = 0; i < element.options.length; i++) {
            if (this.idMatcher.matches(element.options[i].id)) {
                return element.options[i];
            }
        }
        throw new SeleniumError("Option with id '" + this.id + "' not found");
    };

    this.assertSelected = function(element) {
        var selectedId = element.options[element.selectedIndex].id;
        Assert.matches(this.id, selectedId);
    };
};


