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

import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.openqa.selenium.testing.TestUtilities.catchThrowable;

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
    WebElement element = driver.findElement(By.id("textInputnotenabled"));
    assertEquals(false, element.isEnabled());
    Throwable t = catchThrowable(element::clear);
    assertThat(t, instanceOf(InvalidElementStateException.class));
  }

  @Test
  public void testTextInputShouldNotClearWhenReadOnly() {
    driver.get(pages.readOnlyPage);
    WebElement element = driver.findElement(By.id("readOnlyTextInput"));
    Throwable t = catchThrowable(element::clear);
    assertThat(t, instanceOf(InvalidElementStateException.class));
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
    driver.get(pages.readOnlyPage);
    WebElement element = driver.findElement(By.id("textAreaNotenabled"));
    Throwable t = catchThrowable(element::clear);
    assertThat(t, instanceOf(InvalidElementStateException.class));
  }

  @Test
  public void testTextAreaShouldNotClearWhenReadOnly() {
    driver.get(pages.readOnlyPage);
    WebElement element = driver.findElement(By.id("textAreaReadOnly"));
    Throwable t = catchThrowable(element::clear);
    assertThat(t, instanceOf(InvalidElementStateException.class));
  }

  @Test
  public void testContentEditableAreaShouldClear() {
    driver.get(pages.readOnlyPage);
    WebElement element = driver.findElement(By.id("content-editable"));
    element.clear();
    assertEquals("", element.getText());
  }
}
