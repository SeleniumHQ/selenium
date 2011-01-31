package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;

import org.testng.annotations.Test;

public class TestHtmlSource extends InternalSelenseTestNgBase {
	@Test public void testHtmlSource() throws Exception {
		selenium.open("../tests/html/test_html_source.html");
		verifyTrue(selenium.getHtmlSource().matches("^[\\s\\S]*Text is here[\\s\\S]*$"));
		verifyFalse(selenium.getHtmlSource().matches("^[\\s\\S]*can not be found[\\s\\S]*$"));
	}
}
