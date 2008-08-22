package org.openqa.selenium.ie;

import org.openqa.selenium.TestSuiteBuilder;

import junit.framework.Test;
import junit.framework.TestCase;

public class InternetExplorerDriverTestSuite extends TestCase {
	public static Test suite() throws Exception {
		return new TestSuiteBuilder()
					.addSourceDir("common")
					.addSourceDir("jobbie")
					.usingDriver(InternetExplorerDriver.class)
					.exclude("ie")
					.includeJavascriptTests()
					.keepDriverInstance()
					.create();
	}
}
