package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestElementPresent.html.
 */
public class TestElementPresent extends SeleneseTestCase
{
   public void testElementPresent() throws Throwable {
		try {
			

/* TestElementPresent */
			// open|../tests/html/test_element_present.html|
			selenium.open("/selenium-server/tests/html/test_element_present.html");
			assertTrue(selenium.isElementPresent("aLink"));
			// click|removeLinkAfterAWhile|
			selenium.click("removeLinkAfterAWhile");
			boolean sawCondition6 = false;
			for (int second = 0; second < 60; second++) {
				try {
					if ((!selenium.isElementPresent("aLink"))) {
						sawCondition6 = true;
						break;
					}
				}
				catch (Exception ignore) {
				}
				pause(1000);
			}
			assertTrue(sawCondition6);
			
			assertTrue(!selenium.isElementPresent("aLink"));
			// click|addLinkAfterAWhile|
			selenium.click("addLinkAfterAWhile");
			boolean sawCondition9 = false;
			for (int second = 0; second < 60; second++) {
				try {
					if ((selenium.isElementPresent("aLink"))) {
						sawCondition9 = true;
						break;
					}
				}
				catch (Exception ignore) {
				}
				pause(1000);
			}
			assertTrue(sawCondition9);
			
			assertTrue(selenium.isElementPresent("aLink"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
