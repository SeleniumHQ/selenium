// TODO - use jsUnit here?
function assertStringEquals(expected, actual) {
    if (expected.trim() !== actual.trim()) {
        throw new Error("Expected: '" + expected + "' but was '" + actual + "'");
    }
}

function fail(message) {
    throw new Error(message);
}

function Selenium(browserbot) {
    this.browserbot = browserbot;
    this.page = function() {return browserbot.currentPage};
}

/*
 * Click on the located element, and attach a callback to notify
 * when the page is reloaded.
 */
Selenium.prototype.clickElement = function(locator, callback) {
    var element = this.page().findElement(locator);
    this.page().clickElement(element, callback);
}

/*
 * Trigger the onclick event on the located element,
 * and attach a callback to notify when the page is reloaded.
 */
Selenium.prototype.onclickElement = function(locator, callback) {
    var element = this.page().findElement(locator);
    this.page().onclickElement(element, callback);
}

/**
 * Overwrite the text in the located text element.
 * TODO fail if it can't be typed into.
 */
Selenium.prototype.type = function(locator, newText) {
    var element = this.page().findElement(locator);
    this.page().replaceText(element, newText);
}

/**
 * Select the option by label from the located select element.
 * TODO fail if it's not a select.
 */
Selenium.prototype.select = function(locator, optionText) {
    var element = this.page().findElement(locator);
    this.page().selectOptionWithLabel(element, optionText);
}

/*
 * Open the browser to a new location.
 */
Selenium.prototype.open = function(newLocation, callback) {
    this.browserbot.openLocation(newLocation, callback);
}

/*
 * Select the named window to be the active window.
 */
Selenium.prototype.selectWindow = function(windowName) {
    this.browserbot.selectWindow(windowName);
}

/*
 * Verify the location of the current page.
 */
Selenium.prototype.verifyLocation = function(expectedLocation) {
    assertStringEquals(expectedLocation, this.page().location);
}

/*
 * Verify the value of a form element.
 */
Selenium.prototype.verifyValue = function(locator, expectedValue) {
    var element = this.page().findElement(locator);
    var actualValue;
    if (element.type.toUpperCase() == 'CHECKBOX' || element.type.toUpperCase() == 'RADIO') {
        actualValue = element.checked ? 'on' : 'off';
    }
    else {
        actualValue = element.value;
    }

    assertStringEquals(expectedValue, actualValue);
}

/*
 * Verifies that the entire text of the page matches the expected content.
 */
Selenium.prototype.verifyText = function(locator, expectedContent) {
    var element = this.page().findElement(locator);
    var actualText = getText(element);
    assertStringEquals(expectedContent, actualText);
}

/*
 * Asserts that the text for a single cell within and HTML table matches the expected content.
 * The table locator syntax is table.row.column.
 */
Selenium.prototype.verifyTable = function(tableLocator, expectedContent) {
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

    var table = this.page().findIdentifiedElement(tableName);
    if (row > table.rows.length || col > table.rows[row].cells.length)
        fail("No such row or column in table");
    else {
        actualContent = getText(table.rows[row].cells[col]);
        assertStringEquals(expectedContent, actualContent);
    }
}

/*
 * Asserts that the specified text is present in the page content.
 */
Selenium.prototype.verifyTextPresent = function(expectedText) {
    var allText = this.page().bodyText();

    if(allText == "") {
        throw new Error("Page text not found")
    } else if(allText.indexOf(expectedText) == -1) {
// https://issues.wazokazi.com/browse/SEL-28
// alert(allText)
        fail("'" + expectedText + "' not found in page text.");
    }
}

/*
 * Asserts that the specified element can be found.
 */
Selenium.prototype.verifyElementPresent = function(locator) {
    this.page().findElement(locator);
}

/*
 * Asserts that the specified element cannot be found.
 */
Selenium.prototype.verifyElementNotPresent = function(locator) {
    try {
        this.page().findElement(locator);
        fail("Element " + locator + " found.");
    }
    catch (e) {
        // Expected
    }
}