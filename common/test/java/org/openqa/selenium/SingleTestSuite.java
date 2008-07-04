package org.openqa.selenium;

import junit.framework.Test;

import java.io.File;

public class SingleTestSuite {

  private final static String FIREFOX = "org.openqa.selenium.firefox.FirefoxDriver";
  private final static String HTML_UNIT = "org.openqa.selenium.htmlunit.HtmlUnitDriver";
  private final static String IE = "org.openqa.selenium.ie.InternetExplorerDriver";
  private final static String REMOTE = "org.openqa.selenium.remote.RemoteWebDriverTestSuite$RemoteWebDriverForTest";
  private final static String SAFARI = "org.openqa.selenium.safari.SafariDriver";

  public static Test suite() throws Exception {
    String driver = REMOTE;

    TestSuiteBuilder builder = new TestSuiteBuilder()
        .addSourceDir("common")
        .addSourceDir("firefox")
        .usingDriver(driver)
        .keepDriverInstance()
        .includeJavascriptTests()
        .onlyRun("ChildrenFindingTest")
//              .method("testShouldBeAbleToFlipToAFrameIdentifiedByItsId")
        ;  // Yeah, this look strange :)

    if (REMOTE.equals(driver)) {
      builder.addSuiteDecorator(
          "org.openqa.selenium.remote.RemoteWebDriverTestSuite$RemoteDriverServerStarter");
    }

    return builder.create();
  }
}
