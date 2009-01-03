package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestFramesSpecialTargets extends SeleneseTestNgHelper {
	@Test public void testFramesSpecialTargets() throws Exception {
		selenium.openWindow("../tests/html/Frames.html", "SpecialTargets");
		selenium.waitForPopUp("SpecialTargets", "10000");
		selenium.selectWindow("SpecialTargets");
		selenium.selectFrame("bottomFrame");
		selenium.click("changeTop");
		selenium.waitForPageToLoad("30000");
		selenium.click("changeSpan");
		selenium.open("../tests/html/Frames.html");
		selenium.selectFrame("bottomFrame");
		selenium.click("changeParent");
		selenium.waitForPageToLoad("30000");
		selenium.click("changeSpan");
		selenium.open("../tests/html/Frames.html");
		selenium.selectFrame("bottomFrame");
		selenium.click("changeSelf");
		selenium.waitForPageToLoad("30000");
		selenium.click("changeSpan");
		selenium.close();
	}
}
