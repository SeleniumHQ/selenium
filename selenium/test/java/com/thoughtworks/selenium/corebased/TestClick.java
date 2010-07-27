package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.SeleneseTestNgHelper;
import org.testng.annotations.Test;

public class TestClick extends SeleneseTestNgHelper {
	@Test public void testClick() throws Exception {
		selenium.open("../tests/html/test_click_page1.html");
		verifyEquals(selenium.getText("link"), "Click here for next page");
		selenium.click("link");
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getTitle(), "Click Page Target");
		selenium.click("previousPage");
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getTitle(), "Click Page 1");
		selenium.click("linkWithEnclosedImage");
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getTitle(), "Click Page Target");
		selenium.click("previousPage");
		selenium.waitForPageToLoad("30000");
		selenium.click("enclosedImage");
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getTitle(), "Click Page Target");
		selenium.click("previousPage");
		selenium.waitForPageToLoad("30000");
		selenium.click("extraEnclosedImage");
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getTitle(), "Click Page Target");
		selenium.click("previousPage");
		selenium.waitForPageToLoad("30000");
		selenium.click("linkToAnchorOnThisPage");
		verifyEquals(selenium.getTitle(), "Click Page 1");
		try { selenium.waitForPageToLoad("500"); fail("expected failure"); } catch (Throwable e) {}
		selenium.setTimeout("30000");
		selenium.click("linkWithOnclickReturnsFalse");
		Thread.sleep(300);
		verifyEquals(selenium.getTitle(), "Click Page 1");
		selenium.setTimeout("5000");
		selenium.open("../tests/html/test_click_page1.html");
		selenium.doubleClick("doubleClickable");
		assertEquals(selenium.getAlert(), "double clicked!");
	}
}
