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

import java.util.List;
import org.openqa.selenium.internal.WrapsElement;

/**
 * A WebElement that wraps another WebElement, for purposes of testing that JSON converters
 * serialized wrapped elements correctly.
 */
public class WrappedWebElement implements WebElement, WrapsElement {

  private WebElement wrappedElement;

  public WrappedWebElement(WebElement element) {
    this.wrappedElement = element;
  }

  public WebElement getWrappedElement() {
    return wrappedElement;
  }

  public void click() {
    throw new UnsupportedOperationException();
  }

  public void submit() {
    throw new UnsupportedOperationException();
  }

  public void sendKeys(CharSequence... keysToSend) {
    throw new UnsupportedOperationException();
  }

  public void clear() {
    throw new UnsupportedOperationException();
  }

  public String getTagName() {
    throw new UnsupportedOperationException();
  }

  public String getAttribute(String name) {
    throw new UnsupportedOperationException();
  }

  public boolean isSelected() {
    throw new UnsupportedOperationException();
  }

  public boolean isEnabled() {
    throw new UnsupportedOperationException();
  }

  public String getText() {
    throw new UnsupportedOperationException();
  }

  public List<WebElement> findElements(By by) {
    throw new UnsupportedOperationException();
  }

  public WebElement findElement(By by) {
    throw new UnsupportedOperationException();
  }

  public boolean isDisplayed() {
    throw new UnsupportedOperationException();
  }

  public Point getLocation() {
    throw new UnsupportedOperationException();
  }

  public Dimension getSize() {
    throw new UnsupportedOperationException();
  }

  public Rectangle getRect() {
    throw new UnsupportedOperationException();
  }

  public String getCssValue(String propertyName) {
    throw new UnsupportedOperationException();
  }

  public <X> X getScreenshotAs(OutputType<X> outputType) throws WebDriverException {
    throw new UnsupportedOperationException();
  }
}
