package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestDragAndDrop extends SeleneseTestNgHelper {
	@Test public void testDragAndDrop() throws Exception {
		selenium.open("../tests/html/slider/example.html");
		selenium.dragdrop("id=slider01", "800,0");
		assertEquals(selenium.getValue("id=output1"), "20");
		selenium.dragdrop("id=slider01", "-800,0");
		assertEquals(selenium.getValue("id=output1"), "0");
	}
}
