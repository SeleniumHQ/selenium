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

function SeleniumApiTest(name) {
    TestCase.call(this,name);
}

SeleniumApiTest.prototype = new TestCase();
SeleniumApiTest.prototype.setUp = function() {
    this.mockPageBot = this.mockBrowserBot = new Mock();

    this.oldSelenium = selenium;
    selenium = new Selenium(this.mockBrowserBot);
}

SeleniumApiTest.prototype.tearDown = function() {
    selenium = this.oldSelenium;
}


SeleniumApiTest.prototype.verifyMocks = function() {
    this.mockBrowserBot.verify();
    this.mockPageBot.verify();
}

// Tests for Element actions
SeleniumApiTest.prototype.testClickElementWithoutCallback = function() {
    this.mockPageBot.expects("findElement", "id").returns("elementToClick");
    this.mockPageBot.expects("clickElement", "elementToClick");

    selenium.doClick("id");
    this.verifyMocks();
}

SeleniumApiTest.prototype.testType = function() {
    this.mockPageBot.expects("findElement", "id").returns("elementToType");
    this.mockPageBot.expects("replaceText", "elementToType", "new text");

    selenium.doType("id", "new text");
    this.verifyMocks();
}

SeleniumApiTest.prototype.testSelect = function() {
    var mockOptionLocatorFactory = new Mock();
    selenium.optionLocatorFactory = mockOptionLocatorFactory;
    var mockSelect = new Mock();
    // The doSelect() method checks the options property exists as a way
    // of ensuring that the element is a Select element.  Hence the following expectation.
    mockSelect.expectsProperty("options").returns("some options");
    this.mockPageBot.expects("findElement", "id").returns(mockSelect);
    var mockOptionLocator = new Mock();
    mockOptionLocatorFactory.expects("fromLocatorString", "Option One").returns(mockOptionLocator);
    var option = new Object();
    mockOptionLocator.expects("findOption", mockSelect).returns(option);
    this.mockPageBot.expects("selectOption", mockSelect, option);

    selenium.doSelect("id", "Option One");
    mockOptionLocatorFactory.verify();
    mockOptionLocator.verify();
    mockSelect.verify();
    this.verifyMocks();
}

// Browser actions
SeleniumApiTest.prototype.testOpen = function() {
    this.mockBrowserBot.expects("openLocation", "new/location");

    selenium.doOpen("new/location");
    this.verifyMocks();
}

SeleniumApiTest.prototype.testSelectWindow = function() {
    this.mockBrowserBot.expects("selectWindow", "windowName");

    selenium.doSelectWindow("windowName");
    this.verifyMocks();
}

SeleniumApiTest.prototype.testGetLocation = function() {
    var mockWindow = new Object();
    mockWindow.location = new Object();
    mockWindow.location.href = "http://page/path?foo=bar";
    this.mockPageBot.getCurrentWindow = function() {
        return mockWindow;
    }

    this.assertTrue(selenium.getLocation().indexOf("path") > 0);
    this.assertTrue(selenium.getLocation().indexOf("page/path") > 0);
    this.assertTrue(selenium.getLocation().indexOf("http://page/path?foo=bar") > -1);

}

SeleniumApiTest.prototype.testGetTitleReturnsTheTitle = function() {
    this.mockPageBot.expects("getTitle").returns("foo");
    this.assertEquals("foo", selenium.getTitle());
    this.verifyMocks();
}

SeleniumApiTest.prototype.testGetValueOfText = function() {
    var mockTextControl = Object();
    mockTextControl.type = "TEXT";
    mockTextControl.value = "the value";
    this.mockPageBot.expects("findElement", "id").returns(mockTextControl);

    this.assertEquals("the value", selenium.getValue("id"));
    this.verifyMocks();
}

SeleniumApiTest.prototype.testGetValueOfCheckbox = function() {
    var mockControl = Object();
    mockControl.type = "CHECKBOX";
    mockControl.value = "the value";
    mockControl.checked = true;
    this.mockPageBot.expects("findElement", "id").returns(mockControl);

    this.assertEquals("on", selenium.getValue("id"));
    this.verifyMocks();
}

SeleniumApiTest.prototype.testGetText = function() {
    var element = {innerText:"foo"};
    this.mockPageBot.expects("findElement", "id").returns(element);
    this.assertEquals("foo", selenium.getText("id"));
    this.verifyMocks();
}

SeleniumApiTest.prototype.textCell = function(val) {
   var cell = new Object();
   cell.textContent = val;
   return cell;
}

SeleniumApiTest.prototype.testGetTableSuccess = function() {
    this.mockPageBot.expects("findElement", "table").returns(this.getMockTable());
    this.assertEquals("buz", selenium.getTable("table.1.1"));
    this.verifyMocks();
}

SeleniumApiTest.prototype.testGetTableInvalidLocator = function() {
    this.assertCallErrors("VerifyTable should have failed for invalid locator",
                    function() {selenium.getTable("foo");},
                    "Invalid target format. Correct format is tableName.rowNum.columnNum");
    this.verifyMocks();
}

SeleniumApiTest.prototype.testGetTableNoSuchRow = function() {
    var mockTable = this.getMockTable();
    this.mockPageBot.expects("findElement", "table").returns(mockTable);
    this.assertCallFails("VerifyTable should have failed for no such row",
                    function() {selenium.getTable("table.11.0", "bar");},
                    "Cannot access row 11 - table has 2 rows");
    this.verifyMocks();
}

SeleniumApiTest.prototype.testGetTableNoSuchColumn = function() {
    var mockTable = this.getMockTable();
    this.mockPageBot.expects("findElement", "table").returns(mockTable);
    this.assertCallFails("VerifyTable should have failed for no such column",
                    function() {selenium.getTable("table.0.11", "bar");},
                    "Cannot access column 11 - table row has 2 columns");
    this.verifyMocks();
}

SeleniumApiTest.prototype.getMockTable = function() {
    return {
        rows: [
            {cells:[{innerText:"foo"},{innerText:"bar"}]}
            ,{cells:[{innerText:"fuz"},{innerText:"buz"}]}
        ]
    }
}

SeleniumApiTest.prototype.testTextPresent = function() {
    this.mockPageBot.expects("bodyText").returns("this is some foo text");
    this.mockPageBot.expects("bodyText").returns("this is some foo text");
    this.assertTrue(selenium.isTextPresent("foo"));
    this.assertFalse(selenium.isTextPresent("bar"));
    this.verifyMocks();
}

SeleniumApiTest.prototype.testElementPresent = function() {
    this.mockPageBot.expects("findElementOrNull", "id").returns("foo");
    this.assertTrue(selenium.isElementPresent("id"));
    this.verifyMocks();
}

SeleniumApiTest.prototype.testElementNotPresent = function() {
    this.mockPageBot.expects("findElementOrNull", "id").returns(null);
    this.assertFalse(selenium.isElementPresent("id"));
    this.verifyMocks();
}

SeleniumApiTest.prototype.testGetAllButtonsShouldCallPageBot = function() {
    this.mockPageBot.expects("getAllButtons").returns("foo");
    selenium.getAllButtons();
    this.verifyMocks();
}

SeleniumApiTest.prototype.testGetAllFieldsShouldCallPageBot = function() {
    this.mockPageBot.expects("getAllFields").returns("foo");
    selenium.getAllFields();
    this.verifyMocks();
}

SeleniumApiTest.prototype.testGetAllLinksShouldCallPageBot = function() {
    this.mockPageBot.expects("getAllLinks").returns("foo");
    selenium.getAllLinks();
    this.verifyMocks();
}

SeleniumApiTest.prototype.testShouldFailIfTryToGetAlertWhenThereAreNone = function() {
    this.mockBrowserBot.expects("hasAlerts").returns(false);

    this.assertCallFails("getAlert should have failed",
                    function() {selenium.getAlert(); },
                    "There were no alerts");

    this.verifyMocks();
}

SeleniumApiTest.prototype.testGetAlertReturnsNextAlert = function() {
    this.mockBrowserBot.expects("hasAlerts").returns(true);
    this.mockBrowserBot.expects("getNextAlert").returns("The real alert");

    this.assertEquals("The real alert", selenium.getAlert());

    this.verifyMocks();
}

SeleniumApiTest.prototype.testShouldFailIfTryToVerifyConfirmationWhenThereAreNone = function() {
    this.mockBrowserBot.expects("hasConfirmations").returns(false);

    this.assertCallFails("verifyConfirmation should have failed",
                    function() {selenium.getConfirmation();},
                    "There were no confirmations");

    this.verifyMocks();
}

SeleniumApiTest.prototype.testGetConfirmationReturnsNextConfirmation = function() {
      this.mockBrowserBot.expects("hasConfirmations").returns(true);
      this.mockBrowserBot.expects("getNextConfirmation").returns("The real confirmation");

     this.assertEquals("The real confirmation", selenium.getConfirmation());

     this.verifyMocks();
}

SeleniumApiTest.prototype.testShouldTellBroswerBotIfAskedToCancelNextConfirmation = function() {
     this.mockBrowserBot.expects("cancelNextConfirmation", false);
     selenium.doChooseCancelOnNextConfirmation();
     this.verifyMocks();
}

SeleniumApiTest.prototype.testIsSelectedSuccess = function() {
    var mockTextControl = Object();
    mockTextControl.selectedIndex = 1;

    mockTextControl.options = [{text: "option0"},{text: "option1", selected:true},{text: "option2"}];
    this.mockPageBot.expects("findElement", "id=option1").returns(mockTextControl);
    this.assertTrue(selenium.isSomethingSelected("id=option1"));
    this.verifyMocks();

    this.mockPageBot.expects("findElement", "id=option2").returns({});
    try {
        selenium.isSomethingSelected("id=option2");
        this.fail();
    }
    catch (e)
    {
        // pass
    }
    this.verifyMocks();

}

SeleniumApiTest.prototype.testGetSelectOptions = function() {
    var mockTextControl = Object();
    mockTextControl.options = [{text: "option0"},{text: "option1"},{text: "option2"}];
    this.mockPageBot.expects("findElement", "id").returns(mockTextControl);

    this.assertArrayEquals(["option0","option1","option2"], selenium.getSelectOptions("id"));
    this.verifyMocks();
}

SeleniumApiTest.prototype.testGetSelectOptionsWithCommasEscaped = function() {
    var mockTextControl = Object();
    mockTextControl.options = [{text: "option,0"},{text: "option.1"}];
    this.mockPageBot.expects("findElement", "id").returns(mockTextControl);

    this.assertArrayEquals(["option,0","option.1"], selenium.getSelectOptions("id"));
    this.verifyMocks();
}

SeleniumApiTest.prototype.testGetAttributeWithId = function() {
    this.mockPageBot.expects("findAttribute", "id@attribute").returns("foo");

    this.assertEquals("foo", selenium.getAttribute("id@attribute"));
    this.verifyMocks();
}

SeleniumApiTest.prototype.assertCallFails = function(message, theCall, expectedFailureMessage) {
    try {
        theCall();
    } catch (e) {
        if (!e.isAssertionFailedError) {
            throw e;
        }
        if (expectedFailureMessage) {
            this.assertEquals(expectedFailureMessage, e.failureMessage);
        }
        return;
    }
    this.fail(message);
}
SeleniumApiTest.prototype.assertCallErrors = function(message, theCall, expectedFailureMessage) {
    try {
        theCall();
    } catch (e) {
        if (expectedFailureMessage) {
            this.assertEquals(expectedFailureMessage, e.message);
        }
        return;
    }
    this.fail(message);
}

SeleniumApiTest.prototype.testEnsureNoUnhandledPopupsThrowsExceptionIfAlertPresent = function() {

     this.mockBrowserBot.expects("hasAlerts").returns(true);
     this.mockBrowserBot.expects("getNextAlert").returns("The Alert");

     try {
        selenium.ensureNoUnhandledPopups();
        this.fail("exception expected");
     } catch (e) {
        this.assertTrue(e.isSeleniumError);
        this.assertEquals("There was an unexpected Alert! [The Alert]", e.message);
     }

     this.mockBrowserBot.verify();
}

SeleniumApiTest.prototype.testShouldFailActionCommandsIfConfirmPresent = function() {

     this.mockBrowserBot.expects("hasAlerts").returns(false);
     this.mockBrowserBot.expects("hasConfirmations").returns(true);
     this.mockBrowserBot.expects("getNextConfirmation").returns("The Confirmation");

     try {
        selenium.ensureNoUnhandledPopups();
        this.fail("exception expected");
     } catch (e) {
        this.assertTrue(e.isSeleniumError);
        this.assertEquals("There was an unexpected Confirmation! [The Confirmation]", e.message);
     }

     this.mockBrowserBot.verify();
}

SeleniumApiTest.prototype.assertArrayEquals = function(arr1, arr2) {
    this.assertEquals(arr1.length, arr2.length);
    for (var i = 0; i < arr1.length; i++) {
        this.assertEquals(arr1[i], arr2[i]);
    }
}