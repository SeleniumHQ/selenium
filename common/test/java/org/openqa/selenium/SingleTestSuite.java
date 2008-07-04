package org.openqa.selenium;

import junit.framework.Test;

@SuppressWarnings("unused")
public class SingleTestSuite {
    private final static String FIREFOX = "org.openqa.selenium.firefox.FirefoxDriver";
	private final static String HTML_UNIT = "org.openqa.selenium.htmlunit.HtmlUnitDriver";
    private final static String IE = "org.openqa.selenium.ie.InternetExplorerDriver";
    private final static String SAFARI = "org.openqa.selenium.safari.SafariDriver";

    public static Test suite() {
        System.setProperty("webdriver.firefox.useExisting", "true");

        return new TestSuiteBuilder()
              .addSourceDir("common")
              .addSourceDir("firefox")
              .addSourceDir("jobbie")
              .usingDriver(FIREFOX)
              .keepDriverInstance()
              .includeJavascriptTests()
              .onlyRun("CorrectEventFiringTest")
//              .method("testShouldThrowAnExceptionWhenTheJavascriptIsBad")
//                        .leaveRunningAfterTest()
              .create();
	}
}
