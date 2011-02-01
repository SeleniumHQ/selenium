package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.annotations.Test;

public class TestGettingValueOfCheckbox extends InternalSelenseTestNgBase {
	@Test public void testGettingValueOfCheckbox() throws Exception {
    selenium.open("../tests/html/test_submit.html");

    String elementLocator = "name=okayToSubmit";
    assertEquals("off", selenium.getValue(elementLocator));

    selenium.click(elementLocator);
    assertEquals("on", selenium.getValue(elementLocator));

    selenium.click(elementLocator);
    assertEquals("off", selenium.getValue(elementLocator));

	}
}
