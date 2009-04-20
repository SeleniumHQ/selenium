package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestClickJavascriptHrefChrome extends SeleneseTestNgHelper {
	@Test public void testClickJavascriptHrefChrome() throws Exception {
		selenium.open("../tests/html/test_click_javascript_chrome_page.html");
		selenium.click("id=a");
		verifyEquals(selenium.getAlert(), "a");
		selenium.click("id=b");
		verifyEquals(selenium.getAlert(), "b");
		selenium.click("id=c");
		verifyEquals(selenium.getAlert(), "c");
		selenium.click("id=d");
		verifyFalse(selenium.isElementPresent("id=d"));
		selenium.click("id=e");
		verifyEquals(selenium.getAlert(), "e");
		verifyFalse(selenium.isElementPresent("id=e"));
		selenium.click("id=f");
		selenium.waitForPopUp("f-window", "10000");
		selenium.selectWindow("name=f-window");
		verifyTrue(selenium.isElementPresent("id=visibleParagraph"));
		selenium.close();
		selenium.selectWindow("");
		selenium.click("id=g");
		verifyEquals(selenium.getAlert(), "g");
		selenium.waitForPopUp("g-window", "10000");
		selenium.selectWindow("name=g-window");
		verifyTrue(selenium.isElementPresent("id=visibleParagraph"));
		selenium.close();
		selenium.selectWindow("");
		selenium.click("id=h");
		selenium.waitForPageToLoad("30000");
		verifyEquals(selenium.getAlert(), "h");
		verifyTrue(selenium.isElementPresent("id=visibleParagraph"));
	}
}
