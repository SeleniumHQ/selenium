// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.htmlunit;

import junit.framework.Test;

import org.openqa.selenium.TestSuiteBuilder;

public class JavascriptEnabledHtmlUnitDriverTestSuite {

  public static Test suite() throws Exception {
    return new TestSuiteBuilder()
        .addSourceDir("common")
        .addSourceDir("htmlunit")
        .usingDriver(HtmlUnitDriverForTest.class)
        .exclude("htmlunit")
        .includeJavascriptTests()
        .create();
  }

  public static class HtmlUnitDriverForTest extends HtmlUnitDriver {
    public HtmlUnitDriverForTest() {
      super(true);
    }
  }
}
