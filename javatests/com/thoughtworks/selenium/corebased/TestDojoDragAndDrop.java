package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.annotations.Test;

public class TestDojoDragAndDrop extends InternalSelenseTestNgBase {
	@Test
  public void testDojoDragAndDrop() throws Exception {
		selenium.open("../tests/html/dojo-0.4.0-mini/tests/dnd/test_simple.html");
		selenium.dragAndDropToObject("1_3", "2_1");
		assertTrue(selenium.isTextPresent("either side of me*list 1 item 3"));
	}
}
