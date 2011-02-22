package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;
import org.junit.Test;

public class TestGettingValueOfCheckbox extends InternalSelenseTestBase {
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
