package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestXPathLocators.html.
 */
public class TestXPathLocators extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test XPath Locators", "info");
  
/* Test XPath Locators       */
		// open|./tests/html/test_locators.html|
		selenium.open("./tests/html/test_locators.html");

		/* Explicit XPath location */
		// verifyText|xpath=//a|this is the first element
		verifyEquals("this is the first element", selenium.getText("xpath=//a"));
		// verifyText|xpath=//a[@class='a2']|this is the second element
		verifyEquals("this is the second element", selenium.getText("xpath=//a[@class='a2']"));
		// verifyText|xpath=//*[@class='a2']|this is the second element
		verifyEquals("this is the second element", selenium.getText("xpath=//*[@class='a2']"));
		// verifyText|xpath=//a[2]|this is the second element
		verifyEquals("this is the second element", selenium.getText("xpath=//a[2]"));

		boolean sawThrow10 = false;
		try {
			// originally verifyElementNotPresent|xpath=//a[@href='foo']|
		selenium.assertElementNotPresent("xpath=//a[@href='foo']");
		}
		catch (Throwable e) {
			sawThrow10 = true;
		}
		verifyFalse(sawThrow10);
		
		// verifyAttribute|xpath=//a[contains(@href,'#id1')]/@class|a1
		verifyEquals("a1", selenium.getAttribute("xpath=//a[contains(@href,'#id1')]/@class"));

		boolean sawThrow12 = false;
		try {
			// originally verifyElementPresent|xpath=//a[text()="this is the second element"]|
		selenium.assertElementPresent("xpath=//a[text()=\"this is the second element\"]");
		}
		catch (Throwable e) {
			sawThrow12 = true;
		}
		verifyFalse(sawThrow12);
		

		/* Implicit XPath location */
		// verifyText|//a|this is the first element
		verifyEquals("this is the first element", selenium.getText("//a"));
		// verifyAttribute|//a[contains(@href,'#id1')]/@class|a1
		verifyEquals("a1", selenium.getAttribute("//a[contains(@href,'#id1')]/@class"));

		/* Funky XPath */
		// verifyText|xpath=(//table[@class='stylee'])//th[text()='theHeaderText']/../td|theCellText
		verifyEquals("theCellText", selenium.getText("xpath=(//table[@class='stylee'])//th[text()='theHeaderText']/../td"));

		/* XPath with value attribute */
		// click|//input[@name='name2' and @value='yes']|
		selenium.click("//input[@name='name2' and @value='yes']");

		checkForVerificationErrors();
	}
}
