package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestEditable extends SeleneseTestNgHelper {
	@Test public void testEditable() throws Exception {
		selenium.open("../tests/html/test_editable.html");
		verifyTrue(selenium.isEditable("normal_text"));
		verifyTrue(selenium.isEditable("normal_select"));
		verifyFalse(selenium.isEditable("disabled_text"));
		verifyFalse(selenium.isEditable("disabled_select"));
		verifyFalse(selenium.isEditable("readonly_text"));
		try { assertFalse(selenium.isEditable("normal_text")); fail("expected failure"); } catch (Throwable e) {}
		try { assertFalse(selenium.isEditable("normal_select")); fail("expected failure"); } catch (Throwable e) {}
		try { assertTrue(selenium.isEditable("disabled_text")); fail("expected failure"); } catch (Throwable e) {}
		try { assertTrue(selenium.isEditable("disabled_select")); fail("expected failure"); } catch (Throwable e) {}
		try { assertTrue(selenium.isEditable("fake_input")); fail("expected failure"); } catch (Throwable e) {}
	}
}
