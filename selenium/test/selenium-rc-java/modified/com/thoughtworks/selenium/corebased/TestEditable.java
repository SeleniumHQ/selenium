package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestEditable.html.
 */
public class TestEditable extends SeleneseTestCase
{
   public void testEditable() throws Throwable {
		try {
			

/* Test verifyEditable */
			// open|../tests/html/test_editable.html|
			selenium.open("/selenium-server/tests/html/test_editable.html");

			boolean sawThrow4 = false;
			try {
				// originally verifyEditable|normal_text|
						assertTrue(selenium.isEditable("normal_text"));
			}
			catch (Throwable e) {
				sawThrow4 = true;
			}
			verifyFalse(sawThrow4);

			boolean sawThrow5 = false;
			try {
				// originally verifyEditable|normal_select|
						assertTrue(selenium.isEditable("normal_select"));
			}
			catch (Throwable e) {
				sawThrow5 = true;
			}
			verifyFalse(sawThrow5);
			
			boolean sawThrow6 = false;
			try {
				// originally verifyNotEditable|disabled_text|
						assertTrue(!selenium.isEditable("disabled_text"));
			}
			catch (Throwable e) {
				sawThrow6 = true;
			}
			verifyFalse(sawThrow6);
			
			boolean sawThrow7 = false;
			try {
				// originally verifyNotEditable|disabled_select|
						assertTrue(!selenium.isEditable("disabled_select"));
			}
			catch (Throwable e) {
				sawThrow7 = true;
			}
			verifyFalse(sawThrow7);
			
			boolean sawThrow8 = false;
			try {
							assertTrue(!selenium.isEditable("normal_text"));
			}
			catch (Throwable e) {
				sawThrow8 = true;
			}
			verifyTrue(sawThrow8);
			
			boolean sawThrow10 = false;
			try {
							assertTrue(!selenium.isEditable("normal_select"));
			}
			catch (Throwable e) {
				sawThrow10 = true;
			}
			verifyTrue(sawThrow10);
			
			boolean sawThrow12 = false;
			try {
							assertTrue(selenium.isEditable("disabled_text"));
			}
			catch (Throwable e) {
				sawThrow12 = true;
			}
			verifyTrue(sawThrow12);
			
			boolean sawThrow14 = false;
			try {
							assertTrue(selenium.isEditable("disabled_select"));
			}
			catch (Throwable e) {
				sawThrow14 = true;
			}
			verifyTrue(sawThrow14);
			
			boolean sawThrow16 = false;
			try {
							assertTrue(selenium.isEditable("fake_input"));
			}
			catch (Throwable e) {
				sawThrow16 = true;
			}
			verifyTrue(sawThrow16);

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
