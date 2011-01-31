package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;

import org.testng.annotations.Test;

public class TestUseXpathLibrary extends InternalSelenseTestNgBase {
	@Test public void testUseXpathLibrary() throws Exception {
		selenium.useXpathLibrary("ajaxslt");
		assertEquals(selenium.getEval("this.browserbot.xpathEvaluator.getCurrentEngine()"), "ajaxslt");
		assertEquals(selenium.getXpathCount("//"), "1");
		selenium.useXpathLibrary("javascript-xpath");
		assertEquals(selenium.getEval("this.browserbot.xpathEvaluator.getCurrentEngine()"), "javascript-xpath");
		assertEquals(selenium.getXpathCount("//"), "1");
		selenium.useXpathLibrary("");
		assertEquals(selenium.getEval("this.browserbot.xpathEvaluator.getCurrentEngine()"), "javascript-xpath");
		selenium.useXpathLibrary("nonExisting-xpath-library");
		assertEquals(selenium.getEval("this.browserbot.xpathEvaluator.getCurrentEngine()"), "javascript-xpath");
		selenium.useXpathLibrary("default");
		assertEquals(selenium.getEval("this.browserbot.xpathEvaluator.getCurrentEngine()"), "ajaxslt");
	}
}
