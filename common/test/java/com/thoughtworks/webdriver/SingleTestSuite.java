package com.thoughtworks.webdriver;

import junit.framework.Test;

public class SingleTestSuite {
    private final static String FIREFOX = "com.thoughtworks.webdriver.firefox.FirefoxDriver";
    private final static String HTML_UNIT = "com.thoughtworks.webdriver.htmlunit.HtmlUnitDriver";
    private final static String IE = "com.thoughtworks.webdriver.ie.InternetExplorerDriver";
	
	public static Test suite() {
		return new TestSuiteBuilder()
					.addSourceDir("common")
					.usingDriver(FIREFOX)
					.keepDriverInstance()
					.onlyRun("FrameAndWindowSwitchingTest")
					.method("testShouldBeAbleToFlipToAFrameIdentifiedByItsId")
					.create();
	}
}
