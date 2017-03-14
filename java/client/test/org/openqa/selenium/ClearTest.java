// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;

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

  @Test
  public void testContentEditableAreaShouldClear() {
    driver.get(pages.readOnlyPage);
    WebElement element = driver.findElement(By.id("content-editable"));
    element.clear();
    assertEquals("", element.getText());
  }
}
