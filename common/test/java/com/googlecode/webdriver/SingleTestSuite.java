package com.googlecode.webdriver;

import junit.framework.Test;

public class SingleTestSuite {
    private final static String FIREFOX = "com.googlecode.webdriver.firefox.FirefoxDriver";
    private final static String HTML_UNIT = "com.googlecode.webdriver.htmlunit.HtmlUnitDriver";
    private final static String IE = "com.googlecode.webdriver.ie.InternetExplorerDriver";

	public static Test suite() {
		return new TestSuiteBuilder()
					.addSourceDir("common")
					.usingDriver(FIREFOX)
					.keepDriverInstance()
                    .includeJavascriptTests()
                    .onlyRun("JavascriptEnabledDriverTest")
					.method("testShouldBeAbleToSwitchToFocusedElement")
//                    .leaveRunningAfterTest()
                    .create();
	}
}
