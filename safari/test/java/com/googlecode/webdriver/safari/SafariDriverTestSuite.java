package com.googlecode.webdriver.safari;

import com.googlecode.webdriver.TestSuiteBuilder;

import junit.framework.Test;
import junit.framework.TestCase;

public class SafariDriverTestSuite extends TestCase {
	public static Test suite() {
		return new TestSuiteBuilder()
					.addSourceDir("common")
					.addSourceDir("safari")
					.usingDriver(SafariDriver.class)
					.exclude("safari")
					.keepDriverInstance()
					.includeJavascriptTests()
					.create();
	}
}
