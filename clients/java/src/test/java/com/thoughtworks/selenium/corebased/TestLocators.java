package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from //socrates/unixhome/nelsons/work/selenium-rc/trunk/javascript-core/src/selenium/tests/TestLocators.html.
 */
public class TestLocators extends SeleneseTestCase
{
   public void test() throws Throwable {
		selenium.setContext("Test Locators", "info");
  
/* Test Locators       */
		// open|./tests/html/test_locators.html|
		selenium.open("./tests/html/test_locators.html");

		/* Id location */
		// verifyText|id=id1|this is the first element
		verifyEquals("this is the first element", selenium.getText("id=id1"));

		boolean sawThrow7 = false;
		try {
			// originally verifyElementNotPresent|id=name1|
		selenium.assertElementNotPresent("id=name1");
		}
		catch (Throwable e) {
			sawThrow7 = true;
		}
		verifyFalse(sawThrow7);
		

		boolean sawThrow8 = false;
		try {
			// originally verifyElementNotPresent|id=id4|
		selenium.assertElementNotPresent("id=id4");
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
		selenium.assertElementNotPresent("name=id1");
		}
		catch (Throwable e) {
			sawThrow13 = true;
		}
		verifyFalse(sawThrow13);
		

		boolean sawThrow14 = false;
		try {
			// originally verifyElementNotPresent|name=notAName|
		selenium.assertElementNotPresent("name=notAName");
		}
		catch (Throwable e) {
			sawThrow14 = true;
		}
		verifyFalse(sawThrow14);
		
		// verifyAttribute|name=name1@class|a2
		verifyEquals("a2", selenium.getAttribute("name=name1@class"));

		/* identifier location */
		// verifyText|identifier=id1|this is the first element
		verifyEquals("this is the first element", selenium.getText("identifier=id1"));

		boolean sawThrow19 = false;
		try {
			// originally verifyElementNotPresent|identifier=id4|
		selenium.assertElementNotPresent("identifier=id4");
		}
		catch (Throwable e) {
			sawThrow19 = true;
		}
		verifyFalse(sawThrow19);
		
		// verifyAttribute|identifier=id1@class|a1
		verifyEquals("a1", selenium.getAttribute("identifier=id1@class"));
		// verifyText|identifier=name1|this is the second element
		verifyEquals("this is the second element", selenium.getText("identifier=name1"));
		// verifyAttribute|identifier=name1@class|a2
		verifyEquals("a2", selenium.getAttribute("identifier=name1@class"));

		/* DOM Traversal location */
		// verifyText|dom=document.links[1]|this is the second element
		verifyEquals("this is the second element", selenium.getText("dom=document.links[1]"));
		// verifyAttribute|dom=document.links[1]@class|a2
		verifyEquals("a2", selenium.getAttribute("dom=document.links[1]@class"));

		boolean sawThrow27 = false;
		try {
			// originally verifyElementNotPresent|dom=document.links[9]|
		selenium.assertElementNotPresent("dom=document.links[9]");
		}
		catch (Throwable e) {
			sawThrow27 = true;
		}
		verifyFalse(sawThrow27);
		

		boolean sawThrow28 = false;
		try {
			// originally verifyElementNotPresent|dom=foo|
		selenium.assertElementNotPresent("dom=foo");
		}
		catch (Throwable e) {
			sawThrow28 = true;
		}
		verifyFalse(sawThrow28);
		

		/* Link location */

		boolean sawThrow31 = false;
		try {
			// originally verifyElementPresent|link=this is the second element|a2
		selenium.assertElementPresent("link=this is the second element");
		}
		catch (Throwable e) {
			sawThrow31 = true;
		}
		verifyFalse(sawThrow31);
		

		boolean sawThrow32 = false;
		try {
			// originally verifyElementPresent|link=this * second element|a2
		selenium.assertElementPresent("link=this * second element");
		}
		catch (Throwable e) {
			sawThrow32 = true;
		}
		verifyFalse(sawThrow32);
		

		boolean sawThrow33 = false;
		try {
			// originally verifyElementPresent|link=regexp:this [aeiou]s the second element|a2
		selenium.assertElementPresent("link=regexp:this [aeiou]s the second element");
		}
		catch (Throwable e) {
			sawThrow33 = true;
		}
		verifyFalse(sawThrow33);
		
		// verifyAttribute|link=this is the second element@class|a2
		verifyEquals("a2", selenium.getAttribute("link=this is the second element@class"));

		boolean sawThrow35 = false;
		try {
			// originally verifyElementNotPresent|link=this is not an element|
		selenium.assertElementNotPresent("link=this is not an element");
		}
		catch (Throwable e) {
			sawThrow35 = true;
		}
		verifyFalse(sawThrow35);
		

		checkForVerificationErrors();
	}
}
