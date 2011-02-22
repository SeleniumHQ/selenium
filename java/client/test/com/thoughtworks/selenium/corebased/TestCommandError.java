package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;
import org.junit.Test;

public class TestCommandError extends InternalSelenseTestBase {
	@Test
  public void testCommandError() throws Exception {
		selenium.open("../tests/html/test_verifications.html");
		try { selenium.click("notALink"); fail("expected failure"); } catch (Throwable e) {}
		try { selenium.select("noSuchSelect", "somelabel"); fail("expected failure"); } catch (Throwable e) {}
		try { selenium.select("theSelect", "label=noSuchLabel"); fail("expected failure"); } catch (Throwable e) {}
		try { selenium.select("theText", "label=noSuchLabel"); fail("expected failure"); } catch (Throwable e) {}
	}
}
