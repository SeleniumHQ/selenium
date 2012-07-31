/*
Copyright 2012 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium;

import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

@Ignore({CHROME, SELENESE, ANDROID})
public class ClearTest extends JUnit4TestBase {

  @Test
  public void testWritableTextInputShouldClear() {
    driver.get(pages.readOnlyPage);
    WebElement element = driver.findElement(By.id("writableTextInput"));
    element.clear();
    assertEquals("", element.getAttribute("value"));
  }

  @Test
  public void testTextInputShouldNotClearWhenDisabled() {
    driver.get(pages.readOnlyPage);
    try {
      WebElement element = driver.findElement(By.id("textInputnotenabled"));
      assertEquals(false, element.isEnabled());
      element.clear();
      fail("Should not have succeeded");
    } catch (InvalidElementStateException e) {
      // This is expected
    }
  }

  @Test
  @Ignore({OPERA, OPERA_MOBILE})
  public void testTextInputShouldNotClearWhenReadOnly() {
    try {
      driver.get(pages.readOnlyPage);
      WebElement element = driver.findElement(By.id("readOnlyTextInput"));
      element.clear();
      fail("Should not have succeeded");
    } catch (InvalidElementStateException e) {
      // This is expected
    }
  }

  @Test
  public void testWritableTextAreaShouldClear() {
    driver.get(pages.readOnlyPage);
    WebElement element = driver.findElement(By.id("writableTextArea"));
    element.clear();
    assertEquals("", element.getAttribute("value"));
  }

  @Test
  public void testTextAreaShouldNotClearWhenDisabled() {
    try {
      driver.get(pages.readOnlyPage);
      WebElement element = driver.findElement(By.id("textAreaNotenabled"));
      element.clear();
      fail("Should not have succeeded");
    } catch (InvalidElementStateException e) {
      // This is expected
    }
  }

  @Test
  @Ignore({OPERA, OPERA_MOBILE})
  public void testTextAreaShouldNotClearWhenReadOnly() {
    try {
      driver.get(pages.readOnlyPage);
      WebElement element = driver.findElement(By.id("textAreaReadOnly"));
      element.clear();
      fail("Should not have succeeded");
    } catch (InvalidElementStateException e) {
      // This is expected
    }
  }

  @Ignore({HTMLUNIT, IPHONE, OPERA_MOBILE})
  @Test
  public void testContentEditableAreaShouldClear() {
    driver.get(pages.readOnlyPage);
    WebElement element = driver.findElement(By.id("content-editable"));
    element.clear();
    assertEquals("", element.getText());
  }

}
