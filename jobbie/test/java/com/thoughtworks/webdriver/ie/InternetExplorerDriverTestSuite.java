package com.thoughtworks.webdriver.ie;

import junit.framework.Test;

import com.thoughtworks.webdriver.TestSuiteBuilder;

public class InternetExplorerDriverTestSuite {
	public static Test suite() {
		return new TestSuiteBuilder()
					.addSourceDir("common")
					.addSourceDir("jobbie")
					.usingDriver(InternetExplorerDriver.class)
					.exclude("ie")
					.keepDriverInstance()
					.create();
	}
}
