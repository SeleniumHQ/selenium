// TODO - use jsUnit here?
function assertStringEquals(expected, actual) {
    if (expected.trim() !== actual.trim()) {
        throw new Error("Expected: '" + expected + "' but was '" + actual + "'");
    }
}

function fail(message) {
    throw new Error(message);
}

SELENIUM_PROCESS_CONTINUE = 0;
SELENIUM_PROCESS_ABORT = 1;
SELENIUM_WAIT_FOR_RELOAD = 2;

function Selenium(browserbot) {
    this.browserbot = browserbot;
    this.page = function() {return browserbot.getCurrentPage()};

    var self = this;
    this.callOnNextPageLoad = function(callback) {
        if (callback) {
            self.browserbot.callOnNextPageLoad(callback);
        }
    }
}

/*
 * Click on the located element, and attach a callback to notify
 * when the page is reloaded.
 */
Selenium.prototype.doClick = function(locator) {
    var element = this.page().findElement(locator);
    this.page().clickElement(element);
    return SELENIUM_PROCESS_CONTINUE;
}

/**
 * Overwrite the text in the located text element.
 * TODO fail if it can't be typed into.
 */
Selenium.prototype.doType = function(locator, newText) {
    var element = this.page().findElement(locator);
    this.page().replaceText(element, newText);
    return SELENIUM_PROCESS_CONTINUE;
}

/**
 * Select the option by label from the located select element.
 * TODO fail if it's not a select.
 */
Selenium.prototype.doSelect = function(locator, optionText) {
    var element = this.page().findElement(locator);
    this.page().selectOptionWithLabel(element, optionText);
    return SELENIUM_PROCESS_CONTINUE;
}

/*
 * Open the browser to a new location.
 */
Selenium.prototype.doOpen = function(newLocation) {
    this.browserbot.openLocation(newLocation);
    return SELENIUM_WAIT_FOR_RELOAD;
}

/*
 * Select the named window to be the active window.
 */
Selenium.prototype.doSelectWindow = function(windowName) {
    this.browserbot.selectWindow(windowName);
    return SELENIUM_PROCESS_CONTINUE;
}

/*
 * Verify the location of the current page.
 */
Selenium.prototype.assertLocation = function(expectedLocation) {
    assertStringEquals(expectedLocation, this.page().location);
    return SELENIUM_PROCESS_CONTINUE;
}

/*
 * Verify the value of a form element.
 */
Selenium.prototype.assertValue = function(locator, expectedValue) {
    var element = this.page().findElement(locator);
    var actualValue;
    if (element.type.toUpperCase() == 'CHECKBOX' || element.type.toUpperCase() == 'RADIO') {
        actualValue = element.checked ? 'on' : 'off';
    }
    else {
        actualValue = element.value;
    }

    assertStringEquals(expectedValue, actualValue);
    return SELENIUM_PROCESS_CONTINUE;
}

/*
 * Verifies that the entire text of the page matches the expected content.
 */
Selenium.prototype.assertText = function(locator, expectedContent) {
    var element = this.page().findElement(locator);
    var actualText = getText(element);
    assertStringEquals(expectedContent, actualText);
    return SELENIUM_PROCESS_CONTINUE;
}

/*
 * Asserts that the text for a single cell within and HTML table matches the expected content.
 * The table locator syntax is table.row.column.
 */
Selenium.prototype.assertTable = function(tableLocator, expectedContent) {
    // This regular expression matches "tableName.row.column"
    // For example, "mytable.3.4"
    pattern = /(.*)\.(\d)+\.(\d+)/

    if(!pattern.test(tableLocator)) {
        throw new Error("Invalid target format. Correct format is tableName.rowNum.columnNum");
    }

    pieces = tableLocator.match(pattern);

    tableName = pieces[1];
    row = pieces[2];
    col = pieces[3];

    var table = this.page().findElement(tableName);
    if (row > table.rows.length || col > table.rows[row].cells.length)
        fail("No such row or column in table");
    else {
        actualContent = getText(table.rows[row].cells[col]);
        assertStringEquals(expectedContent, actualContent);
    }
    return SELENIUM_PROCESS_CONTINUE;
}

/*
 * Asserts that the specified text is present in the page content.
 */
Selenium.prototype.assertTextPresent = function(expectedText) {
    var allText = this.page().bodyText();

    if(allText == "") {
        throw new Error("Page text not found")
    } else if(allText.indexOf(expectedText) == -1) {
// https://issues.wazokazi.com/browse/SEL-28
// alert(allText)
        fail("'" + expectedText + "' not found in page text.");
    }
    return SELENIUM_PROCESS_CONTINUE;
}

/*
 * Asserts that the specified element can be found.
 */
Selenium.prototype.assertElementPresent = function(locator) {
    this.page().findElement(locator);
    return SELENIUM_PROCESS_CONTINUE;
}

/*
 * Asserts that the specified element cannot be found.
 */
Selenium.prototype.assertElementNotPresent = function(locator) {
    try {
        this.page().findElement(locator);
    }
    catch (e) {
        return SELENIUM_PROCESS_CONTINUE;
    }
    fail("Element " + locator + " found.");
}

function CommandFactory() {
    this.actions = {};
    this.asserts = {};

    var self = this;

    this.registerAction = function(name, action) {
        var handler = new CommandHandler("action", true, action);
        this.actions[name] = handler;
    }

    this.registerAssert = function(name, assertion, haltOnFailure) {
        haltOnFailure = (haltOnFailure == undefined) ? false : haltOnFailure;
        var handler = new CommandHandler("assert", haltOnFailure, assertion);
        this.asserts[name] = handler;
    }

    this.getCommandHandler = function(name) {
        return this.actions[name] || this.asserts[name] || null;
    }

    this.registerAll = function(commandObject) {
        this.registerAllActions(commandObject);
        this.registerAllAsserts(commandObject);
    }

    this.registerAllActions = function(commandObject) {
        for (var functionName in commandObject) {
            if (/^do([A-Z].+)$/.exec(functionName) != null) {
                var actionName = RegExp["$1"].toCamelCase();
                var action = commandObject[functionName];
                this.registerAction(actionName, action);
            }
        }
    }

    this.registerAllAsserts = function(commandObject) {
        for (var functionName in commandObject) {
            if (/^assert([A-Z].+)$/.exec(functionName) != null) {
                var assertName = functionName;
                var verifyName = "verify" + RegExp["$1"];
                var assert = commandObject[functionName];
                this.registerAssert(assertName, assert, true);
                this.registerAssert(verifyName, assert, false);
            }
        }
    }
}

function CommandHandler(type, haltOnFailure, executor) {
    this.type = type;
    this.haltOnFailure = haltOnFailure;
    this.executor = executor;
}