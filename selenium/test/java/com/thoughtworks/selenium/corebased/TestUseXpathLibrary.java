package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.SeleneseTestNgHelper;
import org.testng.annotations.Test;

public class TestUseXpathLibrary extends SeleneseTestNgHelper {
	@Test public void testUseXpathLibrary() throws Exception {
		selenium.useXpathLibrary("ajaxslt");
		assertEquals(selenium.getEval("this.browserbot.xpathLibrary"), "ajaxslt");
		assertEquals(selenium.getXpathCount("//"), "1");
		selenium.useXpathLibrary("javascript-xpath");
		assertEquals(selenium.getEval("this.browserbot.xpathLibrary"), "javascript-xpath");
		assertEquals(selenium.getXpathCount("//"), "1");
		selenium.useXpathLibrary("");
		assertEquals(selenium.getEval("this.browserbot.xpathLibrary"), "javascript-xpath");
		selenium.useXpathLibrary("nonExisting-xpath-library");
		assertEquals(selenium.getEval("this.browserbot.xpathLibrary"), "javascript-xpath");
		selenium.useXpathLibrary("default");
		assertEquals(selenium.getEval("this.browserbot.xpathLibrary"), "ajaxslt");
	}
}
