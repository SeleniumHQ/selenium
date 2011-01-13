package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.annotations.Test;

public class TestElementOrder extends InternalSelenseTestNgBase {
	@Test(dataProvider = "system-properties")
  public void testElementOrder() throws Exception {
		selenium.open("../tests/html/test_element_order.html");
		assertTrue(selenium.isOrdered("s1.1", "d1.1"));
		assertFalse(selenium.isOrdered("s1.1", "s1.1"));
		verifyTrue(selenium.isOrdered("s1.1", "d1.1"));
		assertFalse(selenium.isOrdered("d1.1", "s1.1"));
		verifyFalse(selenium.isOrdered("s1.1", "d2"));
	}
}
