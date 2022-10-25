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

/**
 * A WebElement that wraps another WebElement, for purposes of testing that JSON converters
 * serialized wrapped elements correctly.
 */
public class WrappedWebElement implements WebElement, WrapsElement {

  private final WebElement wrappedElement;

  public WrappedWebElement(WebElement element) {
    this.wrappedElement = element;
  }

  @Override
  public WebElement getWrappedElement() {
    return wrappedElement;
  }

  @Override
  public void click() {
    throw new UnsupportedOperationException();
  }

  @Override
  public void submit() {
    throw new UnsupportedOperationException();
  }

  @Override
  public void sendKeys(CharSequence... keysToSend) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getTagName() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getAttribute(String name) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean isSelected() {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean isEnabled() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getText() {
    throw new UnsupportedOperationException();
  }

  @Override
  public List<WebElement> findElements(By by) {
    throw new UnsupportedOperationException();
  }

  @Override
  public WebElement findElement(By by) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean isDisplayed() {
    throw new UnsupportedOperationException();
  }

  @Override
  public Point getLocation() {
    throw new UnsupportedOperationException();
  }

  @Override
  public Dimension getSize() {
    throw new UnsupportedOperationException();
  }

  @Override
  public Rectangle getRect() {
    throw new UnsupportedOperationException();
  }

  @Override
  public String getCssValue(String propertyName) {
    throw new UnsupportedOperationException();
  }

  @Override
  public <X> X getScreenshotAs(OutputType<X> outputType) throws WebDriverException {
    throw new UnsupportedOperationException();
  }
}
