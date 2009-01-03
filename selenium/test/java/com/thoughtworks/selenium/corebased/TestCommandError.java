package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.*;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import java.util.regex.Pattern;

public class TestCommandError extends SeleneseTestNgHelper {
	@Test public void testCommandError() throws Exception {
		selenium.open("../tests/html/test_verifications.html");
		try { selenium.click("notALink"); fail("expected failure"); } catch (Throwable e) {}
		try { selenium.select("noSuchSelect", "somelabel"); fail("expected failure"); } catch (Throwable e) {}
		try { selenium.select("theSelect", "label=noSuchLabel"); fail("expected failure"); } catch (Throwable e) {}
		try { selenium.select("theText", "label=noSuchLabel"); fail("expected failure"); } catch (Throwable e) {}
	}
}
