package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from C:\Selenium\selenium-rc-trunk\clients\java\target\selenium-server\tests/TestXPathLocators.html.
 */
public class TestXPathLocators extends SeleneseTestCase
{
   public void testXPathLocators() throws Throwable {
		try {
			

/* Test XPath Locators */
			// open|../tests/html/test_locators.html|
			selenium.open("/selenium-server/tests/html/test_locators.html");
			// verifyText|xpath=//a|this is the first element
			verifyEquals("this is the first element", selenium.getText("xpath=//a"));
			// verifyText|xpath=//a[@class='a2']|this is the second element
			verifyEquals("this is the second element", selenium.getText("xpath=//a[@class='a2']"));
			// verifyText|xpath=//*[@class='a2']|this is the second element
			verifyEquals("this is the second element", selenium.getText("xpath=//*[@class='a2']"));
			// verifyText|xpath=//a[2]|this is the second element
			verifyEquals("this is the second element", selenium.getText("xpath=//a[2]"));

			boolean sawThrow8 = false;
			try {
				// originally verifyElementNotPresent|xpath=//a[@href='foo']|
						assertTrue(!selenium.isElementPresent("xpath=//a[@href='foo']"));
			}
			catch (Throwable e) {
				sawThrow8 = true;
			}
			verifyFalse(sawThrow8);
			
			// verifyAttribute|xpath=//a[contains(@href,'#id1')]/@class|a1
			verifyEquals("a1", selenium.getAttribute("xpath=//a[contains(@href,'#id1')]/@class"));

			boolean sawThrow10 = false;
			try {
				// originally verifyElementPresent|xpath=//a[text()="this is the second element"]|
						assertTrue(selenium.isElementPresent("xpath=//a[text()=\"this is the second element\"]"));
			}
			catch (Throwable e) {
				sawThrow10 = true;
			}
			verifyFalse(sawThrow10);
			
			// verifyText|//a|this is the first element
			verifyEquals("this is the first element", selenium.getText("//a"));
			// verifyAttribute|//a[contains(@href,'#id1')]/@class|a1
			verifyEquals("a1", selenium.getAttribute("//a[contains(@href,'#id1')]/@class"));
			verifyEquals("theCellText", selenium.getText("xpath=(//table[@class='stylee'])//th[text()='theHeaderText']/../td"));
				
			// click|//input[@name='name2' and @value='yes']|
			selenium.click("//input[@name='name2' and @value='yes']");

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
