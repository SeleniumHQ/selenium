package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestMultiSelect extends SeleneseTestNgHelper {
	@Test public void testMultiSelect() throws Exception {
		selenium.open("../tests/html/test_multiselect.html");
		assertEquals(join(selenium.getSelectedLabels("theSelect"), ','), "Second Option");
		selenium.select("theSelect", "index=4");
		verifyEquals(join(selenium.getSelectedLabels("theSelect"), ','), "Fifth Option");
		selenium.addSelection("theSelect", "Third Option");
		selenium.addSelection("theSelect", "value=");
		verifyEquals(join(selenium.getSelectedLabels("theSelect"), ','), "Third Option,Fifth Option,Empty Value Option");
		selenium.removeSelection("theSelect", "id=o7");
		verifyEquals(join(selenium.getSelectedLabels("theSelect"), ','), "Third Option,Fifth Option");
		selenium.removeSelection("theSelect", "label=Fifth Option");
		verifyEquals(selenium.getSelectedLabel("theSelect"), "Third Option");;
		selenium.addSelection("theSelect", "");
		verifyEquals(join(selenium.getSelectedLabels("theSelect"), ','), "Third Option,");
		selenium.removeSelection("theSelect", "");
		selenium.removeSelection("theSelect", "Third Option");
		try { assertEquals(selenium.getSelectedLabel("theSelect"), "");; fail("expected failure"); } catch (Throwable e) {}
		try { assertEquals(join(selenium.getSelectedLabels("theSelect"), ','), ""); fail("expected failure"); } catch (Throwable e) {}
		verifyEquals(selenium.getValue("theSelect"), "");
		verifyFalse(selenium.isSomethingSelected("theSelect"));
		selenium.addSelection("theSelect", "Third Option");
		selenium.addSelection("theSelect", "value=");
		selenium.removeAllSelections("theSelect");
		verifyFalse(selenium.isSomethingSelected("theSelect"));
	}
}
