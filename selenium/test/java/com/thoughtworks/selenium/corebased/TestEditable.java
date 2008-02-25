package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestEditable.html.
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
				// originally verifyNotEditable|readonly_text|
						assertTrue(!selenium.isEditable("readonly_text"));
			}
			catch (Throwable e) {
				sawThrow8 = true;
			}
			verifyFalse(sawThrow8);
			

			boolean sawThrow9 = false;
			try {
							assertTrue(!selenium.isEditable("normal_text"));
			}
			catch (Throwable e) {
				sawThrow9 = true;
			}
			verifyTrue(sawThrow9);
			

			boolean sawThrow11 = false;
			try {
							assertTrue(!selenium.isEditable("normal_select"));
			}
			catch (Throwable e) {
				sawThrow11 = true;
			}
			verifyTrue(sawThrow11);
			

			boolean sawThrow13 = false;
			try {
							assertTrue(selenium.isEditable("disabled_text"));
			}
			catch (Throwable e) {
				sawThrow13 = true;
			}
			verifyTrue(sawThrow13);
			

			boolean sawThrow15 = false;
			try {
							assertTrue(selenium.isEditable("disabled_select"));
			}
			catch (Throwable e) {
				sawThrow15 = true;
			}
			verifyTrue(sawThrow15);
			

			boolean sawThrow17 = false;
			try {
							assertTrue(selenium.isEditable("fake_input"));
			}
			catch (Throwable e) {
				sawThrow17 = true;
			}
			verifyTrue(sawThrow17);
			

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
