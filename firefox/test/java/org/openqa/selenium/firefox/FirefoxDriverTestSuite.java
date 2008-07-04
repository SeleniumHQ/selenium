package org.openqa.selenium.firefox;

import org.openqa.selenium.TestSuiteBuilder;

import junit.framework.Test;
import junit.framework.TestCase;

public class FirefoxDriverTestSuite extends TestCase {
	public static Test suite() throws Exception {
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
