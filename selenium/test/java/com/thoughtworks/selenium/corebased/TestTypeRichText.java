package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /private/tmp/selenium-rc/clients/java/target/selenium-server/tests/TestTypeRichText.html.
 */
public class TestTypeRichText extends SeleneseTestCase
{
   public void testTypeRichText() throws Throwable {
		try {
			

/* TestTypeRichText */
			// open|../tests/html/test_rich_text.html|
			selenium.open("/selenium-server/tests/html/test_rich_text.html");
			// selectFrame|richtext|
			selenium.selectFrame("richtext");
			// verifyText|//body|
			verifyEquals("", selenium.getText("//body"));
			// type|//body|hello world
			selenium.type("//body", "hello world");
			// verifyText|//body|hello world
			verifyEquals("hello world", selenium.getText("//body"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
