/*
 * Copyright 2004 ThoughtWorks, Inc.
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

package com.thoughtworks.selenium;

import com.thoughtworks.selenium.launchers.WindowsDefaultBrowserLauncher;
import org.jmock.Mock;
import org.jmock.MockObjectTestCase;

import java.net.InetAddress;

/**
 * @author Paul Hammant
 * @version $Revision$
 */
public class DefaultSeleniumTestCase extends MockObjectTestCase {

    Mock commandProcessor;
    private String machine;

    protected void setUp() throws Exception {
        super.setUp();
        commandProcessor = new Mock(CommandProcessor.class);
        machine = InetAddress.getLocalHost().getHostName();
    }

    public void testOpenWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("open"), eq("123.com"), eq("")).will(returnValue("OK"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.open("123.com");
    }

    public void testOpenFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("open"), eq("123.com"), eq("")).will(returnValue("dfsdfasde"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.open("123.com");
            fail("should have barfed");
        } catch (SeleniumException e) {
            // expected
            assertEquals("dfsdfasde", e.getMessage());
        }
    }

    public void testClickAndWaitWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("clickAndWait"), eq("foobar"), eq("")).will(returnValue("OK"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.clickAndWait("foobar");
    }

    public void testClickAndWaitFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("clickAndWait"), eq("foobar"), eq("")).will(returnValue("dfg sfdg dd"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.clickAndWait("foobar");
        } catch (SeleniumException e) {
            // expected
            assertEquals("dfg sfdg dd", e.getMessage());
        }
    }

    public void testSetTextWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("setText"), eq("whatsit"), eq("something")).will(returnValue("OK"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.setTextField("whatsit", "something");
    }

    public void testSetTextFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("setText"), eq("whatsit"), eq("something")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.setTextField("whatsit", "something");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testVerifyTextWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyText"), eq("whatsit"), eq("something")).will(returnValue("PASSED"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.verifyText("whatsit", "something");
    }

    public void testVerifyTextFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyText"), eq("whatsit"), eq("something")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.verifyText("whatsit", "something");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testVerifyLocationWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyLocation"), eq("whatsit"), eq("")).will(returnValue("PASSED"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.verifyLocation("whatsit");
    }

    public void testVerifyLocationFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyLocation"), eq("whatsit"), eq("")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.verifyLocation("whatsit");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testTestCompleteWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("testComplete"), eq(""), eq("")).will(returnValue(""));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.testComplete();
    }

    public void testChooseCancelOnNextConfirmationWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("chooseCancelOnNextConfirmation"), eq(""), eq("")).will(returnValue("OK"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.chooseCancelOnNextConfirmation();

    }

    public void testChooseCancelOnNextConfirmationFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("chooseCancelOnNextConfirmation"), eq(""), eq("")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.chooseCancelOnNextConfirmation();
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testClickWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("click"), eq("whatsit"), eq("")).will(returnValue("OK"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.click("whatsit");
    }

    public void testClickFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("click"), eq("whatsit"), eq("")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.click("whatsit");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testPauseWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("pause"), eq("100"), eq("")).will(returnValue("OK"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.pause(100);
    }

    public void testPauseFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("pause"), eq("100"), eq("")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.pause(100);
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testSelectAndWaitWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("selectAndWait"), eq("whatsit"), eq("something")).will(returnValue("OK"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.selectAndWait("whatsit", "something");
    }

    public void testSelectAndWaitFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("selectAndWait"), eq("whatsit"), eq("something")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.selectAndWait("whatsit", "something");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testSelectWindowWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("selectWindow"), eq("whatsit"), eq("")).will(returnValue("OK"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.selectWindow("whatsit");
    }

    public void testSelectWindowFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("selectWindow"), eq("whatsit"), eq("")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.selectWindow("whatsit");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testStoreTextWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("storeText"), eq("whatsit"), eq("something")).will(returnValue("OK"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.storeText("whatsit", "something");
    }

    public void testStoreTextFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("storeText"), eq("whatsit"), eq("something")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.storeText("whatsit", "something");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testStoreValueWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("storeValue"), eq("whatsit"), eq("something")).will(returnValue("OK"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.storeValue("whatsit", "something");
    }

    public void testStoreValueFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("storeValue"), eq("whatsit"), eq("something")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.storeValue("whatsit", "something");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testTypeWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("type"), eq("whatsit"), eq("something")).will(returnValue("OK"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.type("whatsit", "something");
    }

    public void testTypeFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("type"), eq("whatsit"), eq("something")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.type("whatsit", "something");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testTypeAndWaitWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("typeAndWait"), eq("whatsit"), eq("something")).will(returnValue("OK"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.typeAndWait("whatsit", "something");
    }

    public void testTypeAndWaitFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("typeAndWait"), eq("whatsit"), eq("something")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.typeAndWait("whatsit", "something");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testVerifyAlertWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyAlert"), eq("whatsit"), eq("")).will(returnValue("PASSED"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.verifyAlert("whatsit");
    }

    public void testVerifyAlertFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyAlert"), eq("whatsit"), eq("")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.verifyAlert("whatsit");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testVerifyAttributeWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyAttribute"), eq("whatsit"), eq("something")).will(returnValue("PASSED"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.verifyAttribute("whatsit", "something");
    }

    public void testVerifyAttributeFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyAttribute"), eq("whatsit"), eq("something")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.verifyAttribute("whatsit", "something");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testVerifyConfirmationWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyConfirmation"), eq("whatsit"), eq("")).will(returnValue("PASSED"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.verifyConfirmation("whatsit");
    }

    public void testVerifyConfirmationFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyConfirmation"), eq("whatsit"), eq("")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.verifyConfirmation("whatsit");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testVerifyElementNotPresentWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyElementNotPresent"), eq("whatsit"), eq("")).will(returnValue("PASSED"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.verifyElementNotPresent("whatsit");
    }

    public void testVerifyElementNotPresentFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyElementNotPresent"), eq("whatsit"), eq("")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.verifyElementNotPresent("whatsit");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testVerifyElementPresentWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyElementPresent"), eq("whatsit"), eq("")).will(returnValue("PASSED"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.verifyElementPresent("whatsit");
    }

    public void testVerifyElementPresentFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyElementPresent"), eq("whatsit"), eq("")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.verifyElementPresent("whatsit");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testVerifySelectOptionsWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifySelectOptions"), eq("whatsit"), eq("foo,bar")).will(returnValue("PASSED"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.verifySelectOptions("whatsit", new String[] {"foo", "bar"});
    }

    public void testVerifySelectOptionsFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifySelectOptions"), eq("whatsit"), eq("foo,bar")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.verifySelectOptions("whatsit", new String[] {"foo", "bar"});
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testVerifySelectedWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifySelected"), eq("whatsit"), eq("something")).will(returnValue("PASSED"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.verifySelected("whatsit", "something");
    }

    public void testVerifySelectedFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifySelected"), eq("whatsit"), eq("something")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.verifySelected("whatsit", "something");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testVerifyTableWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyTable"), eq("whatsit"), eq("something")).will(returnValue("PASSED"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.verifyTable("whatsit", "something");
    }

    public void testVerifyTableFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyTable"), eq("whatsit"), eq("something")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.verifyTable("whatsit", "something");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testVerifyTextPresentWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyTextPresent"), eq("whatsit"), eq("")).will(returnValue("PASSED"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.verifyTextPresent("whatsit");
    }

    public void testVerifyTextPresentFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyTextPresent"), eq("whatsit"), eq("")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.verifyTextPresent("whatsit");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testVerifyTitleWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyTitle"), eq("whatsit"), eq("")).will(returnValue("PASSED"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.verifyTitle("whatsit");
    }

    public void testVerifyTitleFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyTitle"), eq("whatsit"), eq("")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.verifyTitle("whatsit");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

    public void testVerifyValueWorking() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyValue"), eq("whatsit"), eq("something")).will(returnValue("PASSED"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        dftSelenium.verifyValue("whatsit", "something");
    }

    public void testVerifyValueFailing() {
        commandProcessor.expects(once()).method("doCommand").with(eq("verifyValue"), eq("whatsit"), eq("something")).will(returnValue("fgadfgadfgadfg fg"));
        DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
        try {
            dftSelenium.verifyValue("whatsit", "something");
        } catch (SeleniumException e) {
            // expected
            assertEquals("fgadfgadfgadfg fg", e.getMessage());
        }
    }

	public void testGetAllButtonsReturnsArrayOfStrings() {
		commandProcessor.expects(once()).method("doCommand").with(eq("getAllButtons"), eq(""), eq("")).will(returnValue("abutton,bbutton,"));
		DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
		String[] result = dftSelenium.getAllButtons();

		assertEquals(2, result.length);
		assertEquals("abutton", result[0]);
		assertEquals("bbutton", result[1]);
	}

	public void testGetAllButtonsHandlesNoButtons() {
		commandProcessor.expects(once()).method("doCommand").with(eq("getAllButtons"), eq(""), eq("")).will(returnValue(""));
		DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
		String[] result = dftSelenium.getAllButtons();

		assertEquals(0, result.length);
	}

	public void testGetAllFieldsReturnsArrayOfStrings() {
		commandProcessor.expects(once()).method("doCommand").with(eq("getAllFields"), eq(""), eq("")).will(returnValue("afield,bfield,"));
		DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
		String[] result = dftSelenium.getAllFields();

		assertEquals(2, result.length);
		assertEquals("afield", result[0]);
		assertEquals("bfield", result[1]);
	}

	public void testGetAllFieldsHandlesNoFields() {
		commandProcessor.expects(once()).method("doCommand").with(eq("getAllFields"), eq(""), eq("")).will(returnValue(""));
		DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
		String[] result = dftSelenium.getAllFields();

		assertEquals(0, result.length);
	}

	public void testGetAllLinksReturnsArrayOfStrings() {
		commandProcessor.expects(once()).method("doCommand").with(eq("getAllLinks"), eq(""), eq("")).will(returnValue("alink,blink,"));
		DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
		String[] result = dftSelenium.getAllLinks();

		assertEquals(2, result.length);
		assertEquals("alink", result[0]);
		assertEquals("blink", result[1]);
	}

	public void testGetAllLinksHandlesNoLinks() {
		commandProcessor.expects(once()).method("doCommand").with(eq("getAllLinks"), eq(""), eq("")).will(returnValue(""));
		DefaultSelenium dftSelenium = new DefaultSelenium((CommandProcessor) commandProcessor.proxy(), new WindowsDefaultBrowserLauncher());
		String[] result = dftSelenium.getAllLinks();

		assertEquals(0, result.length);
	}
}
