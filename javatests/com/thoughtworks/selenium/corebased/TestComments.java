package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.annotations.Test;

public class TestComments extends InternalSelenseTestNgBase {
	@Test(dataProvider = "system-properties") public void testComments() throws Exception {
		selenium.open("../tests/html/test_verifications.html?foo=bar");
		verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_verifications\\.html[\\s\\S]*$"));
		verifyEquals(selenium.getValue("theText"), "the text value");
		verifyEquals(selenium.getValue("theHidden"), "the hidden value");
		verifyEquals(selenium.getText("theSpan"), "this is the span");
	}
}
