package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestDragAndDrop.html.
 */
public class TestDragAndDrop extends SeleneseTestCase
{
   public void testDragAndDrop() throws Throwable {
		try {
			

/* TestDragDrop */
			// open|../tests/html/slider/example.html|
			selenium.open("/selenium-server/tests/html/slider/example.html");
			// dragdrop|id=slider01|800,0
			selenium.dragdrop("id=slider01", "800,0");
			// assertValue|id=output1|20
			assertEquals("20", selenium.getValue("id=output1"));
			// dragdrop|id=slider01|-800,0
			selenium.dragdrop("id=slider01", "-800,0");
			// assertValue|id=output1|0
			assertEquals("0", selenium.getValue("id=output1"));

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
