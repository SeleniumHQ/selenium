// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium;

import org.openqa.selenium.environment.GlobalTestEnvironment;

public class TextPagesTest extends AbstractDriverTestCase {
  private String textPage;

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    textPage = GlobalTestEnvironment.get().getAppServer().whereIs("plain.txt");
  }

  @Ignore("firefox, ie, safari")
  public void testShouldBeAbleToLoadASimplePageOfText() {
    driver.get(textPage);

    String source = driver.getPageSource();
    assertEquals("Test", source);
  }
}
