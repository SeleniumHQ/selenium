package com.googlecode.webdriver;

import junit.framework.Test;

@SuppressWarnings("unused")
public class SingleTestSuite {
    private final static String FIREFOX = "com.googlecode.webdriver.firefox.FirefoxDriver";
	private final static String HTML_UNIT = "com.googlecode.webdriver.htmlunit.HtmlUnitDriver";
    private final static String IE = "com.googlecode.webdriver.ie.InternetExplorerDriver";
    private final static String SAFARI = "com.googlecode.webdriver.safari.SafariDriver";

    public static Test suite() {
        System.setProperty("webdriver.firefox.useExisting", "true");

        return new TestSuiteBuilder()
				    	.addSourceDir("common")
              .addSourceDir("firefox")
              .usingDriver(IE)
              .keepDriverInstance()
              .includeJavascriptTests()
              .onlyRun("RenderedWebElementTest")
//              .method("testShouldReturnTheValueOfTheDisabledAttrbuteEvenIfItIsMissing")
    //                    .leaveRunningAfterTest()
              .create();
	}
}
