package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestClickBlankTarget.html.
 */
public class TestClickBlankTarget extends SeleneseTestCase
{
   public void testClickBlankTarget() throws Throwable {
		try {
			

/* TestClickBlankTarget */
			// open|../tests/html/Frames.html|
			selenium.open("/selenium-server/tests/html/Frames.html");
			// selectFrame|bottomFrame|
			selenium.selectFrame("bottomFrame");
			// click|changeBlank|
			selenium.click("changeBlank");
			// waitForPopUp|_blank|10000
			selenium.waitForPopUp("_blank", "10000");
			// selectWindow|_blank|
			selenium.selectWindow("_blank");
			// click|changeSpan|
			selenium.click("changeSpan");
			// close||
			selenium.close();
			// selectWindow|null|
			selenium.selectWindow("null");
			// click|changeBlank|
			selenium.click("changeBlank");
			// waitForPopUp|_blank|10000
			selenium.waitForPopUp("_blank", "10000");
			// selectWindow|_blank|
			selenium.selectWindow("_blank");
			// click|changeSpan|
			selenium.click("changeSpan");
			// close||
			selenium.close();
			// selectWindow|null|
			selenium.selectWindow("null");
			// selectFrame|bottomFrame|
			selenium.selectFrame("bottomFrame");
			// submit|formBlank|
			selenium.submit("formBlank");
			// waitForPopUp|_blank|10000
			selenium.waitForPopUp("_blank", "10000");
			// selectWindow|_blank|
			selenium.selectWindow("_blank");
			// click|changeSpan|
			selenium.click("changeSpan");
			// close||
			selenium.close();
			// selectWindow|null|
			selenium.selectWindow("null");
			// open|../tests/html/test_select_window.html|
			selenium.open("/selenium-server/tests/html/test_select_window.html");
			// click|popupBlank|
			selenium.click("popupBlank");
			// waitForPopUp|_blank|10000
			selenium.waitForPopUp("_blank", "10000");
			// selectWindow|_blank|
			selenium.selectWindow("_blank");
			// verifyTitle|Select Window Popup|
			verifyEquals("*Select Window Popup", selenium.getTitle());
			// close||
			selenium.close();

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
