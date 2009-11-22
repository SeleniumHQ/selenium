package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestLocators extends SeleneseTestNgHelper {
	@Test public void testLocators() throws Exception {
		selenium.open("../tests/html/test_locators.html");
		//  Id location 
		verifyEquals(selenium.getText("id=id1"), "this is the first element");
		verifyFalse(selenium.isElementPresent("id=name1"));
		verifyFalse(selenium.isElementPresent("id=id4"));
		verifyEquals(selenium.getAttribute("id=id1@class"), "a1");
		//  name location 
		verifyEquals(selenium.getText("name=name1"), "this is the second element");
		verifyFalse(selenium.isElementPresent("name=id1"));
		verifyFalse(selenium.isElementPresent("name=notAName"));
		verifyEquals(selenium.getAttribute("name=name1@class"), "a2");
		//  class location 
		verifyEquals(selenium.getText("class=a3"), "this is the third element");
		//  alt location 
		verifyTrue(selenium.isElementPresent("alt=banner"));
		//  identifier location 
		verifyEquals(selenium.getText("identifier=id1"), "this is the first element");
		verifyFalse(selenium.isElementPresent("identifier=id4"));
		verifyEquals(selenium.getAttribute("identifier=id1@class"), "a1");
		verifyEquals(selenium.getText("identifier=name1"), "this is the second element");
		verifyEquals(selenium.getAttribute("identifier=name1@class"), "a2");
		//  DOM Traversal location 
		verifyEquals(selenium.getText("dom=document.links[1]"), "this is the second element");
		verifyEquals(selenium.getText("dom=function foo() {return document.links[1];}; foo();"), "this is the second element");
		verifyEquals(selenium.getAttribute("dom=document.links[1]@class"), "a2");
		verifyFalse(selenium.isElementPresent("dom=document.links[9]"));
		verifyFalse(selenium.isElementPresent("dom=foo"));
		//  Link location 
		verifyTrue(selenium.isElementPresent("link=this is the second element"));
		assertTrue(selenium.isTextPresent("this is the second element"));
		verifyTrue(selenium.isElementPresent("link=this * second element"));
		verifyTrue(selenium.isElementPresent("link=regexp:this [aeiou]s the second element"));
		verifyEquals(selenium.getAttribute("link=this is the second element@class"), "a2");
		verifyFalse(selenium.isElementPresent("link=this is not an element"));
		//  SEL-484:  IE: Can't select element by ID when there's another earlier element whose "name" matches the ID 
		verifyTrue(selenium.isElementPresent("name=foobar"));
		verifyTrue(selenium.isElementPresent("id=foobar"));
		//  SEL-608: "ID selector does not work when an element on the page has a name parameter equal to id" 
		verifyTrue(selenium.isElementPresent("id=myForm"));
	}
}
