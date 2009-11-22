package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestVisibility extends SeleneseTestNgHelper {
	@Test public void testVisibility() throws Exception {
		selenium.open("../tests/html/test_visibility.html");
		verifyTrue(selenium.isVisible("visibleParagraph"));
		verifyFalse(selenium.isVisible("hiddenParagraph"));
		verifyFalse(selenium.isVisible("suppressedParagraph"));
		verifyFalse(selenium.isVisible("classSuppressedParagraph"));
		verifyFalse(selenium.isVisible("jsClassSuppressedParagraph"));
		verifyFalse(selenium.isVisible("hiddenSubElement"));
		verifyTrue(selenium.isVisible("visibleSubElement"));
		verifyFalse(selenium.isVisible("suppressedSubElement"));
		verifyFalse(selenium.isVisible("jsHiddenParagraph"));
		try { assertFalse(selenium.isVisible("visibleParagraph")); fail("expected failure"); } catch (Throwable e) {}
		try { assertTrue(selenium.isVisible("hiddenParagraph")); fail("expected failure"); } catch (Throwable e) {}
		try { assertTrue(selenium.isVisible("suppressedParagraph")); fail("expected failure"); } catch (Throwable e) {}
		try { assertTrue(selenium.isVisible("classSuppressedParagraph")); fail("expected failure"); } catch (Throwable e) {}
		try { assertTrue(selenium.isVisible("jsClassSuppressedParagraph")); fail("expected failure"); } catch (Throwable e) {}
		try { assertTrue(selenium.isVisible("hiddenSubElement")); fail("expected failure"); } catch (Throwable e) {}
		try { assertTrue(selenium.isVisible("suppressedSubElement")); fail("expected failure"); } catch (Throwable e) {}
		try { assertTrue(selenium.isVisible("jsHiddenParagraph")); fail("expected failure"); } catch (Throwable e) {}
		verifyFalse(selenium.isVisible("hiddenInput"));
		try { assertTrue(selenium.isVisible("nonExistentElement")); fail("expected failure"); } catch (Throwable e) {}
	}
}
