package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.annotations.Test;

public class TestJavaScriptAttributes extends InternalSelenseTestNgBase {
	@Test
  public void testJavaScriptAttributes() throws Exception {
		selenium.open("../tests/html/test_javascript_attributes.html");
		selenium.click("//a[@onclick=\"alert('foo')\"]");
		assertEquals(selenium.getAlert(), "foo");
	}
}
