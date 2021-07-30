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

import org.openqa.selenium.interactions.HasInputDevices;
import org.openqa.selenium.interactions.HasTouchScreen;
import org.openqa.selenium.interactions.Keyboard;
import org.openqa.selenium.interactions.Mouse;
import org.openqa.selenium.interactions.TouchScreen;
import org.openqa.selenium.logging.Logs;

import java.util.List;
import java.util.Set;

public class StubDriver implements WebDriver, HasInputDevices, HasTouchScreen, JavascriptExecutor {

  @Override
  public void get(String url) {
    throw new UnsupportedOperationException("get");
  }

  @Override
  public String getCurrentUrl() {
    throw new UnsupportedOperationException("getCurrentUrl");
  }

  @Override
  public String getTitle() {
    throw new UnsupportedOperationException("getTitle");
  }

  @Override
  public List<WebElement> findElements(By by) {
    throw new UnsupportedOperationException("findElements");
  }

  @Override
  public WebElement findElement(By by) {
    throw new UnsupportedOperationException("findElement");
  }

  @Override
  public String getPageSource() {
    throw new UnsupportedOperationException("getPageSource");
  }

  @Override
  public void close() {
    throw new UnsupportedOperationException("close");
  }

  @Override
  public void quit() {
    throw new UnsupportedOperationException("quit");
  }

  @Override
  public Set<String> getWindowHandles() {
    throw new UnsupportedOperationException("getWindowHandles");
  }

  @Override
  public String getWindowHandle() {
    throw new UnsupportedOperationException("getWindowHandle");
  }

  @Override
  public TargetLocator switchTo() {
    throw new UnsupportedOperationException("switchTo");
  }

  @Override
  public Navigation navigate() {
    throw new UnsupportedOperationException("navigate");
  }

  @Override
  public Options manage() {
    throw new UnsupportedOperationException("manage");
  }

  public Logs logs() {
    throw new UnsupportedOperationException("logs");
  }

  // TODO(eran): Why does this not throw an exception like everything else?
  @Override
  public Keyboard getKeyboard() {
    return null;
  }

  @Override
  public Mouse getMouse() {
    return null;
  }

  @Override
  public TouchScreen getTouch() {
    return null;
  }

  @Override
  public Object executeScript(String script, Object... args) {
    throw new UnsupportedOperationException("executeScript");
  }

  @Override
  public Object executeAsyncScript(String script, Object... args) {
    throw new UnsupportedOperationException("executeAsyncScript");
  }
}
