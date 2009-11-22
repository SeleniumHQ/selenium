package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestSelect extends SeleneseTestNgHelper {
	@Test public void testSelect() throws Exception {
		selenium.open("../tests/html/test_select.html");
		assertTrue(selenium.isSomethingSelected("theSelect"));
		assertEquals(selenium.getSelectedLabel("theSelect"), "Second Option");;
		selenium.select("theSelect", "index=4");
		verifyEquals(selenium.getSelectedLabel("theSelect"), "Fifth Option");
		verifyEquals(selenium.getSelectedIndex("theSelect"), "4");;
		verifyEquals(selenium.getSelectedLabel("theSelect"), "Fifth Option");
		verifyEquals(join(selenium.getSelectedLabels("theSelect"), ','), "Fifth Option");
		selenium.select("theSelect", "Third Option");
		verifyEquals(selenium.getSelectedLabel("theSelect"), "Third Option");;
		verifyEquals(selenium.getSelectedLabel("theSelect"), "Third Option");;
		verifyEquals(selenium.getSelectedLabel("theSelect"), "Third Option");
		selenium.select("theSelect", "label=Fourth Option");
		verifyEquals(selenium.getSelectedLabel("theSelect"), "Fourth Option");
		verifyEquals(selenium.getSelectedLabel("theSelect"), "Fourth Option");;
		selenium.select("theSelect", "value=option6");
		verifyEquals(selenium.getSelectedLabel("theSelect"), "Sixth Option");
		verifyEquals(selenium.getSelectedValue("theSelect"), "option6");
		verifyEquals(selenium.getSelectedValue("theSelect"), "option6");;
		selenium.select("theSelect", "value=");
		verifyEquals(selenium.getSelectedLabel("theSelect"), "Empty Value Option");
		selenium.select("theSelect", "id=o4");
		verifyEquals(selenium.getSelectedLabel("theSelect"), "Fourth Option");
		verifyEquals(selenium.getSelectedId("theSelect"), "o4");
		selenium.select("theSelect", "");
		verifyEquals(selenium.getSelectedLabel("theSelect"), "");
		verifyEquals(join(selenium.getSelectedLabels("theSelect"), ','), "");
		try { selenium.select("theSelect", "Not an option"); fail("expected failure"); } catch (Throwable e) {}
		try { selenium.addSelection("theSelect", "Fourth Option"); fail("expected failure"); } catch (Throwable e) {}
		try { selenium.removeSelection("theSelect", "Fourth Option"); fail("expected failure"); } catch (Throwable e) {}
		verifyEquals(join(selenium.getSelectOptions("theSelect"), ','), "First Option,Second Option,Third Option,Fourth Option,Fifth Option,Sixth Option,Empty Value Option,");
	}
}
