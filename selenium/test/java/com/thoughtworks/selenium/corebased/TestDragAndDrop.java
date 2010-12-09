package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;
import org.testng.annotations.Test;

public class TestDragAndDrop extends InternalSelenseTestNgBase {
	@Test public void testDragAndDrop() throws Exception {
		selenium.open("../tests/html/slider/example.html");
		selenium.dragdrop("id=slider01", "800,0");
		assertEquals(selenium.getValue("id=output1"), "20");
		selenium.dragdrop("id=slider01", "-800,0");
		assertEquals(selenium.getValue("id=output1"), "0");
	}
}
