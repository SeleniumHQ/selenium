package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestFramesClick extends SeleneseTestNgHelper {
	@Test public void testFramesClick() throws Exception {
		selenium.open("../tests/html/Frames.html");
		selenium.selectFrame("mainFrame");
		selenium.open("../tests/html/test_click_page1.html");
		//  Click a regular link 
		verifyEquals(selenium.getText("link"), "Click here for next page");
		selenium.click("link");
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getTitle(), "Click Page Target");
		selenium.click("previousPage");
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getTitle(), "Click Page 1");
		//  Click a link with an enclosed image 
		selenium.click("linkWithEnclosedImage");
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getTitle(), "Click Page Target");
		selenium.click("previousPage");
		selenium.waitForPageToLoad("30000");
		//  Click an image enclosed by a link 
		selenium.click("enclosedImage");
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getTitle(), "Click Page Target");
		selenium.click("previousPage");
		selenium.waitForPageToLoad("30000");
		//  Click a link with an href anchor target within this page 
		selenium.click("linkToAnchorOnThisPage");
		verifyEquals(selenium.getTitle(), "Click Page 1");
		//  Click a link where onclick returns false 
		selenium.click("linkWithOnclickReturnsFalse");
		//  Need a pause to give the page a chance to reload (so this test can fail) 
		Thread.sleep(300);
		verifyEquals(selenium.getTitle(), "Click Page 1");
		selenium.setTimeout("5000");
		selenium.open("../tests/html/test_click_page1.html");
		//  TODO Click a link with a target attribute 
	}
}
