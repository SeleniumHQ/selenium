package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.junit.Test;

public class TestHtmlSource extends InternalSelenseTestBase {
	@Test public void testHtmlSource() throws Exception {
		selenium.open("../tests/html/test_html_source.html");
		verifyTrue(selenium.getHtmlSource().matches("^[\\s\\S]*Text is here[\\s\\S]*$"));
		verifyFalse(selenium.getHtmlSource().matches("^[\\s\\S]*can not be found[\\s\\S]*$"));
	}
}
