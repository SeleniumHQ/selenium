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
    this.page = function() {return browserbot.getCurrentPage()};

    var self = this;
    this.callOnNextPageLoad = function(callback) {
        if (callback) {
            self.browserbot.callOnNextPageLoad(callback);
        }
    }

    /*
     * Click on the located element, and attach a callback to notify
     * when the page is reloaded.
     */
    this.clickElement = function(locator) {
        var element = self.page().findElement(locator);
        self.page().clickElement(element);
        return true;
    }

    /**
     * Overwrite the text in the located text element.
     * TODO fail if it can't be typed into.
     */
    this.type = function(locator, newText) {
        var element = self.page().findElement(locator);
        self.page().replaceText(element, newText);
        return true;
    }

    /**
     * Select the option by label from the located select element.
     * TODO fail if it's not a select.
     */
    this.select = function(locator, optionText) {
        var element = self.page().findElement(locator);
        self.page().selectOptionWithLabel(element, optionText);
        return true;
    }

    /*
     * Open the browser to a new location.
     */
    this.open = function(newLocation) {
        self.browserbot.openLocation(newLocation);
        return false;
    }

    /*
     * Select the named window to be the active window.
     */
    this.selectWindow = function(windowName) {
        self.browserbot.selectWindow(windowName);
        return true;
    }

    /*
     * Verify the location of the current page.
     */
    this.verifyLocation = function(expectedLocation) {
        assertStringEquals(expectedLocation, self.page().location);
        return true;
    }

    /*
     * Verify the value of a form element.
     */
    this.verifyValue = function(locator, expectedValue) {
        var element = self.page().findElement(locator);
        var actualValue;
        if (element.type.toUpperCase() == 'CHECKBOX' || element.type.toUpperCase() == 'RADIO') {
            actualValue = element.checked ? 'on' : 'off';
        }
        else {
            actualValue = element.value;
        }

        assertStringEquals(expectedValue, actualValue);
        return true;
    }

    /*
     * Verifies that the entire text of the page matches the expected content.
     */
    this.verifyText = function(locator, expectedContent) {
        var element = self.page().findElement(locator);
        var actualText = getText(element);
        assertStringEquals(expectedContent, actualText);
        return true;
    }

    /*
     * Asserts that the text for a single cell within and HTML table matches the expected content.
     * The table locator syntax is table.row.column.
     */
    this.verifyTable = function(tableLocator, expectedContent) {
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

        var table = self.page().findElement(tableName);
        if (row > table.rows.length || col > table.rows[row].cells.length)
            fail("No such row or column in table");
        else {
            actualContent = getText(table.rows[row].cells[col]);
            assertStringEquals(expectedContent, actualContent);
        }
        return true;
    }

    /*
     * Asserts that the specified text is present in the page content.
     */
    this.verifyTextPresent = function(expectedText) {
        var allText = self.page().bodyText();

        if(allText == "") {
            throw new Error("Page text not found")
        } else if(allText.indexOf(expectedText) == -1) {
    // https://issues.wazokazi.com/browse/SEL-28
    // alert(allText)
            fail("'" + expectedText + "' not found in page text.");
        }
        return true;
    }

    /*
     * Asserts that the specified element can be found.
     */
    this.verifyElementPresent = function(locator) {
        self.page().findElement(locator);
        return true;
    }

    /*
     * Asserts that the specified element cannot be found.
     */
    this.verifyElementNotPresent = function(locator) {
        try {
            self.page().findElement(locator);
        }
        catch (e) {
            return true;
        }
        fail("Element " + locator + " found.");
    }
}