package org.openqa.selenium.safari;

import org.openqa.selenium.TestSuiteBuilder;

import junit.framework.Test;
import junit.framework.TestCase;

public class SafariDriverTestSuite extends TestCase {
	public static Test suite() throws Exception {
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
