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
}

/**
 * Overwrite the text in the located text element.
 * TODO fail if it can't be typed into.
 */
Selenium.prototype.doType = function(locator, newText) {
    var element = this.page().findElement(locator);
    this.page().replaceText(element, newText);
}

/**
 * Select the option by label from the located select element.
 * TODO fail if it's not a select.
 */
Selenium.prototype.doSelect = function(locator, optionText) {
    var element = this.page().findElement(locator);
    this.page().selectOptionWithLabel(element, optionText);
}

/*
 * Open the browser to a new location.
 */
Selenium.prototype.doOpen = function(newLocation) {
    this.browserbot.openLocation(newLocation);
    return SELENIUM_PROCESS_WAIT;
}

/*
 * Select the named window to be the active window.
 */
Selenium.prototype.doSelectWindow = function(windowName) {
    this.browserbot.selectWindow(windowName);
}

/*
 * Instruct Selenium to click Cancel on the next confirm dialog it encounters
 */
Selenium.prototype.doChooseCancelOnNextConfirmation = function() {
    this.browserbot.cancelNextConfirmation();
}

/*
 *  Asserts that the supplied message was received as an alert
 */
 Selenium.prototype.assertAlert = function(expectedAlert) {
    if ( this.browserbot.hasAlerts()) {
        
        receivedAlert = this.browserbot.getNextAlert();
        if ( receivedAlert != expectedAlert ) {
           fail("The alert was [" + receivedAlert + "]");   
        }
                          
    } else {
        fail("There were no alerts"); 
    }
 } 

  /*
  *  Asserts that the supplied message was received as a confirmation
  */
  Selenium.prototype.assertConfirmation = function(expectedConfirmation) {
     if ( this.browserbot.hasConfirmations()) {
         
         receivedConfirmation = this.browserbot.getNextConfirmation();
         if ( receivedConfirmation != expectedConfirmation ) {
            fail("The confirmation message was [" + receivedConfirmation + "]");   
         }
                           
     } else {
         fail("There were no confirmations"); 
     }
  } 
 
/*
 * Verify the location of the current page.
 */
Selenium.prototype.assertLocation = function(expectedLocation) {
    assertEquals(expectedLocation, this.page().location);
}

/*
 * Verify the title of the current page.
 */
Selenium.prototype.assertTitle = function(expectedTitle) {
    assertEquals(expectedTitle, this.page().title());
}

/*
 * Verify the value of a form element.
 */
Selenium.prototype.assertValue = function(locator, expectedValue) {
    var element = this.page().findElement(locator);
    var actualValue = getInputValue(element);
    assertEquals(expectedValue, actualValue.trim());
}

/*
 * Verifies that the entire text of the page matches the expected content.
 */
Selenium.prototype.assertText = function(locator, expectedContent) {
    var element = this.page().findElement(locator);
    var actualText = getText(element);
    assertEquals(expectedContent, actualText.trim());
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
        error("Invalid target format. Correct format is tableName.rowNum.columnNum");
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
        assertEquals(expectedContent, actualContent.trim());
    }
}

/**
 * Verify the label of the option that is selected.
 */
Selenium.prototype.assertSelected = function(target, expectedLabel) {
    var element = this.page().findElement(target);
    var selectedLabel = element.options[element.selectedIndex].text;
    assertEquals(expectedLabel, selectedLabel);
}

/**
 * Verify the label of all of the options in the drop=down.
 */
Selenium.prototype.assertSelectOptions = function(target, options) {
    // Handle escpaced commas, by substitutine newlines.
    options = options.replace("\\,", "\n");
	var expectedOptions = options.split(",");
	var element = this.page().findElement(target);

    assertEquals("wrong number of options", expectedOptions.length, element.options.length);

    for (var i = 0; i < element.options.length; i++) {
        var option = element.options[i];
        // Put the escaped commas back in.
        var expectedOption = expectedOptions[i].replace("\n", ",");
        assertEquals(expectedOption, option.text);
    }
}

/**
 * Verify the value of an element attribute. The syntax for returning an element attribute
 * is <element-locator>@attribute-name
 */
Selenium.prototype.assertAttribute = function(target, expected) {
    var attributeValue = this.page().findAttribute(target);
    assertEquals(expected, attributeValue);
}

/*
 * Asserts that the specified text is present in the page content.
 */
Selenium.prototype.assertTextPresent = function(expectedText) {
    var allText = this.page().bodyText();

    if(allText == "") {
        error("Page text not found")
    } else if(allText.indexOf(expectedText) == -1) {
        fail("'" + expectedText + "' not found in page text.");
    }
}

/*
 * Asserts that the specified element can be found.
 */
Selenium.prototype.assertElementPresent = function(locator) {
    try {
        this.page().findElement(locator);
    } catch (e) {
        fail("Element " + locator + " not found.");
    }
}

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
    fail("Element " + locator + " found.");
}


 /*
  * Return all buttons on the screen.
  */
Selenium.prototype.getAllButtons = function() {
 		return this.page().getAllButtons();
}

 /*
  * Return all links on the screen.
  */
Selenium.prototype.getAllLinks = function() {
 		return this.page().getAllLinks();
}

 /*
  * Return all fields on the screen.
  */
Selenium.prototype.getAllFields = function() {
 		return this.page().getAllFields();
}