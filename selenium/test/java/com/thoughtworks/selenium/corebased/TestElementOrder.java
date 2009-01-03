package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestElementOrder extends SeleneseTestNgHelper {
	@Test public void testElementOrder() throws Exception {
		selenium.open("../tests/html/test_element_order.html");
		assertTrue(selenium.isOrdered("s1.1", "d1.1"));
		assertFalse(selenium.isOrdered("s1.1", "s1.1"));
		verifyTrue(selenium.isOrdered("s1.1", "d1.1"));
		assertFalse(selenium.isOrdered("d1.1", "s1.1"));
		verifyFalse(selenium.isOrdered("s1.1", "d2"));
	}
}
