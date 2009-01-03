package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestFailingVerifications extends SeleneseTestNgHelper {
	@Test public void testFailingVerifications() throws Exception {
		selenium.open("../tests/html/test_verifications.html");
		try { assertTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/not_test_verifications\\.html$")); fail("expected failure"); } catch (Throwable e) {}
		try { assertEquals(selenium.getValue("theText"), "not the text value"); fail("expected failure"); } catch (Throwable e) {}
		try { assertNotEquals("the text value", selenium.getValue("theText")); fail("expected failure"); } catch (Throwable e) {}
		try { assertEquals(selenium.getValue("theHidden"), "not the hidden value"); fail("expected failure"); } catch (Throwable e) {}
		try { assertEquals(selenium.getText("theSpan"), "this is not the span"); fail("expected failure"); } catch (Throwable e) {}
		try { assertTrue(selenium.isTextPresent("this is not the span")); fail("expected failure"); } catch (Throwable e) {}
		try { assertFalse(selenium.isTextPresent("this is the span")); fail("expected failure"); } catch (Throwable e) {}
		try { assertTrue(selenium.isElementPresent("notTheSpan")); fail("expected failure"); } catch (Throwable e) {}
		try { assertFalse(selenium.isElementPresent("theSpan")); fail("expected failure"); } catch (Throwable e) {}
		try { assertEquals(selenium.getTable("theTable.2.0"), "a"); fail("expected failure"); } catch (Throwable e) {}
		try { assertEquals(selenium.getSelectedIndex("theSelect"), "2");; fail("expected failure"); } catch (Throwable e) {}
		try { assertTrue(selenium.getSelectedValue("theSelect").matches("^opt[\\s\\S]*3$"));; fail("expected failure"); } catch (Throwable e) {}
		try { assertEquals(selenium.getSelectedLabel("theSelect"), "third option");; fail("expected failure"); } catch (Throwable e) {}
		try { assertEquals(join(selenium.getSelectOptions("theSelect"), ','), "first\\,option,second option"); fail("expected failure"); } catch (Throwable e) {}
		try { assertEquals(selenium.getAttribute("theText@class"), "bar"); fail("expected failure"); } catch (Throwable e) {}
		try { assertNotEquals("foo", selenium.getAttribute("theText@class")); fail("expected failure"); } catch (Throwable e) {}
	}
}
