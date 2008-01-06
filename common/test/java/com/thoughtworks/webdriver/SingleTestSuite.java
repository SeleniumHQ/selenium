package com.thoughtworks.webdriver;

import junit.framework.Test;

public class SingleTestSuite {
	private final static String IE = "com.thoughtworks.webdriver.ie.InternetExplorerDriver";
	
	public static Test suite() {
		return new TestSuiteBuilder()
					.addSourceDir("common")
					.addSourceDir("jobbie")
					.usingDriver(IE)
					.keepDriverInstance()
					.onlyRun("TextHandlingTest")
					.method("testShouldRepresentABlockLevelElementAsANewline")
					.create();
	}
}
