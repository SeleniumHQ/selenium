// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium;

public class TextPagesTest extends AbstractDriverTestCase {
  private String textPage;

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    textPage = baseUrl + "plain.txt";
  }

  @Ignore("firefox, ie, safari")
  public void testShouldBeAbleToLoadASimplePageOfText() {
    driver.get(textPage);

    String source = driver.getPageSource();
    assertEquals("Test", source);
  }
}
