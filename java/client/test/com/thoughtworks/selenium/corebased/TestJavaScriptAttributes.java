package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;
import org.junit.Test;

public class TestJavaScriptAttributes extends InternalSelenseTestBase {
	@Test
  public void testJavaScriptAttributes() throws Exception {
		selenium.open("../tests/html/test_javascript_attributes.html");
		selenium.click("//a[@onclick=\"alert('foo')\"]");
		assertEquals(selenium.getAlert(), "foo");
	}
}
