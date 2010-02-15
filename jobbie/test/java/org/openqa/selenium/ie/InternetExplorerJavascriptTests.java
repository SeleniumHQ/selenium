// Copyright 2010 Google Inc. All Rights Reserved.

package org.openqa.selenium.ie;

import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.JavascriptEnabled;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriverException;

import java.util.ArrayList;
import java.util.List;

/**
 * @author eran.mes@gmail.com (Eran Mes)
 *
 */
public class InternetExplorerJavascriptTests extends AbstractDriverTestCase {
  @SuppressWarnings("unchecked")
  @JavascriptEnabled
  public void testShouldBeAbleToExecuteSimpleJavascriptAndAStringsArray() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(javascriptPage);
    List<Object> expectedResult = new ArrayList<Object>();
    expectedResult.add("zero");
    expectedResult.add("one");
    expectedResult.add("two");
    try {
      Object result = ((JavascriptExecutor) driver).executeScript(
        "return ['zero', 'one', 'two'];");
      fail("Was supposed to get an exception - no such type yet.");
    } catch (WebDriverException e) {
      assertTrue(e.getMessage().contains("Cannot determine result type"));
    }
  }
}
