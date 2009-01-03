package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestDojoDragAndDrop extends SeleneseTestNgHelper {
	@Test public void testDojoDragAndDrop() throws Exception {
		selenium.open("../tests/html/dojo-0.4.0-mini/tests/dnd/test_simple.html");
		selenium.dragAndDropToObject("1_3", "2_1");
		assertTrue(selenium.isTextPresent("either side of me*list 1 item 3"));
	}
}
