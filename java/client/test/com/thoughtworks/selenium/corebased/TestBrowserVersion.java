package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.junit.Test;

public class TestBrowserVersion extends InternalSelenseTestBase {
	@Test public void testBrowserVersion() throws Exception {
		System.out.println(selenium.getEval("browserVersion.name"));
	}
}
