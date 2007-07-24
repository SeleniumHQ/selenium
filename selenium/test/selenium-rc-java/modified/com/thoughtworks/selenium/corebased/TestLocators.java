package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from /Users/sms/Developer/selenium-rc/clients/java/target/selenium-server/tests/TestLocators.html.
 */
public class TestLocators extends SeleneseTestCase
{
   public void testLocators() throws Throwable {
		try {
			

/* Test Locators */
			// open|../tests/html/test_locators.html|
			selenium.open("/selenium-server/tests/html/test_locators.html");

			/* Id location */
			// verifyText|id=id1|this is the first element
			verifyEquals("this is the first element", selenium.getText("id=id1"));

			boolean sawThrow7 = false;
			try {
				// originally verifyElementNotPresent|id=name1|
						assertTrue(!selenium.isElementPresent("id=name1"));
			}
			catch (Throwable e) {
				sawThrow7 = true;
			}
			verifyFalse(sawThrow7);
			

			boolean sawThrow8 = false;
			try {
				// originally verifyElementNotPresent|id=id4|
						assertTrue(!selenium.isElementPresent("id=id4"));
			}
			catch (Throwable e) {
				sawThrow8 = true;
			}
			verifyFalse(sawThrow8);
			
			// verifyAttribute|id=id1@class|a1
			verifyEquals("a1", selenium.getAttribute("id=id1@class"));

			/* name location */

			// verifyText|name=name1|this is the second element
			verifyEquals("this is the second element", selenium.getText("name=name1"));

			boolean sawThrow13 = false;
			try {
				// originally verifyElementNotPresent|name=id1|
						assertTrue(!selenium.isElementPresent("name=id1"));
			}
			catch (Throwable e) {
				sawThrow13 = true;
			}
			verifyFalse(sawThrow13);
			

			boolean sawThrow14 = false;
			try {
				// originally verifyElementNotPresent|name=notAName|
						assertTrue(!selenium.isElementPresent("name=notAName"));
			}
			catch (Throwable e) {
				sawThrow14 = true;
			}
			verifyFalse(sawThrow14);
			
			// verifyAttribute|name=name1@class|a2
			verifyEquals("a2", selenium.getAttribute("name=name1@class"));

			/* class location */

			// verifyText|class=a3|this is the third element
			verifyEquals("this is the third element", selenium.getText("class=a3"));

			/* alt location */

			boolean sawThrow21 = false;
			try {
				// originally verifyElementPresent|alt=banner|
						assertTrue(selenium.isElementPresent("alt=banner"));
			}
			catch (Throwable e) {
				sawThrow21 = true;
			}
			verifyFalse(sawThrow21);
			

			/* identifier location */
			
			// verifyText|identifier=id1|this is the first element
			verifyEquals("this is the first element", selenium.getText("identifier=id1"));

			boolean sawThrow25 = false;
			try {
				// originally verifyElementNotPresent|identifier=id4|
						assertTrue(!selenium.isElementPresent("identifier=id4"));
			}
			catch (Throwable e) {
				sawThrow25 = true;
			}
			verifyFalse(sawThrow25);
			
			// verifyAttribute|identifier=id1@class|a1
			verifyEquals("a1", selenium.getAttribute("identifier=id1@class"));
			// verifyText|identifier=name1|this is the second element
			verifyEquals("this is the second element", selenium.getText("identifier=name1"));
			// verifyAttribute|identifier=name1@class|a2
			verifyEquals("a2", selenium.getAttribute("identifier=name1@class"));

			/* DOM Traversal location */
			// verifyText|dom=document.links[1]|this is the second element
//			verifyEquals("this is the second element", selenium.getText("dom=document.links[1]"));
			// verifyText|dom=function foo() {return document.links[1];}; foo();|this is the second element
//			verifyEquals("this is the second element", selenium.getText("dom=function foo() {return document.links[1];}; foo();"));
			// verifyAttribute|dom=document.links[1]@class|a2
//			verifyEquals("a2", selenium.getAttribute("dom=document.links[1]@class"));
//
//			boolean sawThrow34 = false;
//			try {
//				// originally verifyElementNotPresent|dom=document.links[9]|
//						assertTrue(!selenium.isElementPresent("dom=document.links[9]"));
//			}
//			catch (Throwable e) {
//				sawThrow34 = true;
//			}
//			verifyFalse(sawThrow34);
			

//			boolean sawThrow35 = false;
//			try {
//				// originally verifyElementNotPresent|dom=foo|
//						assertTrue(!selenium.isElementPresent("dom=foo"));
//			}
//			catch (Throwable e) {
//				sawThrow35 = true;
//			}
//			verifyFalse(sawThrow35);
			

			/* Link location */

			boolean sawThrow38 = false;
			try {
				// originally verifyElementPresent|link=this is the second element|a2
						assertTrue(selenium.isElementPresent("link=this is the second element"));
			}
			catch (Throwable e) {
				sawThrow38 = true;
			}
			verifyFalse(sawThrow38);
			
			assertTrue(selenium.isTextPresent("this is the second element"));

			boolean sawThrow40 = false;
			try {
				// originally verifyElementPresent|link=this * second element|a2
						assertTrue(selenium.isElementPresent("link=this * second element"));
			}
			catch (Throwable e) {
				sawThrow40 = true;
			}
			verifyFalse(sawThrow40);
			

			boolean sawThrow41 = false;
			try {
				// originally verifyElementPresent|link=regexp:this [aeiou]s the second element|a2
						assertTrue(selenium.isElementPresent("link=regexp:this [aeiou]s the second element"));
			}
			catch (Throwable e) {
				sawThrow41 = true;
			}
			verifyFalse(sawThrow41);
			
			// verifyAttribute|link=this is the second element@class|a2
			verifyEquals("a2", selenium.getAttribute("link=this is the second element@class"));

			boolean sawThrow43 = false;
			try {
				// originally verifyElementNotPresent|link=this is not an element|
						assertTrue(!selenium.isElementPresent("link=this is not an element"));
			}
			catch (Throwable e) {
				sawThrow43 = true;
			}
			verifyFalse(sawThrow43);
			

			checkForVerificationErrors();
		}
		finally {
			clearVerificationErrors();
		}
	}
}
