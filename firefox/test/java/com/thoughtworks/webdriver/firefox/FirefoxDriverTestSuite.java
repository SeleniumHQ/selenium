package com.thoughtworks.webdriver.firefox;

import junit.framework.Test;

import com.thoughtworks.webdriver.TestSuiteBuilder;

public class FirefoxDriverTestSuite {
	public static Test suite() {
		return new TestSuiteBuilder()
					.addSourceDir("firefox")
					.addSourceDir("common")
					.usingDriver(FirefoxDriver.class)
					.exclude("firefox")
					.keepDriverInstance()
					.includeJavascriptTests()
					.create();
	}
}
