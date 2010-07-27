package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.SeleneseTestNgHelper;
import org.testng.annotations.Test;

public class TestBrowserVersion extends SeleneseTestNgHelper {
	@Test public void testBrowserVersion() throws Exception {
		System.out.println(selenium.getEval("browserVersion.name"));
	}
}
