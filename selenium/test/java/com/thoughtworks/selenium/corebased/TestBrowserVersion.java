package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestNgBase;

import org.testng.annotations.Test;

public class TestBrowserVersion extends InternalSelenseTestNgBase {
	@Test(dataProvider = "system-properties") public void testBrowserVersion() throws Exception {
		System.out.println(selenium.getEval("browserVersion.name"));
	}
}
