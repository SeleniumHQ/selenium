/*
Copyright 2007-2011 Selenium committers

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

import org.openqa.selenium.logging.Logs;

import java.util.List;
import java.util.Set;

public class StubDriver implements WebDriver, HasInputDevices, HasTouchScreen {

  public void get(String url) {
    throw new UnsupportedOperationException("get");
  }

  public String getCurrentUrl() {
    throw new UnsupportedOperationException("getCurrentUrl");
  }

  public String getTitle() {
    throw new UnsupportedOperationException("getTitle");
  }

  public List<WebElement> findElements(By by) {
    throw new UnsupportedOperationException("findElements");
  }

  public WebElement findElement(By by) {
    throw new UnsupportedOperationException("findElement");
  }

  public String getPageSource() {
    throw new UnsupportedOperationException("getPageSource");
  }

  public void close() {
    throw new UnsupportedOperationException("close");
  }

  public void quit() {
    throw new UnsupportedOperationException("quit");
  }

  public Set<String> getWindowHandles() {
    throw new UnsupportedOperationException("getWindowHandles");
  }

  public String getWindowHandle() {
    throw new UnsupportedOperationException("getWindowHandle");
  }

  public TargetLocator switchTo() {
    throw new UnsupportedOperationException("switchTo");
  }

  public Navigation navigate() {
    throw new UnsupportedOperationException("navigate");
  }

  public Options manage() {
    throw new UnsupportedOperationException("manage");
  }

  public Logs logs() {
    throw new UnsupportedOperationException("logs");
  }

  // TODO(eran): Why does this not throw an exception like everything else?
  public Keyboard getKeyboard() {
    return null;
  }

  public Mouse getMouse() {
    return null;
  }

  public TouchScreen getTouch() {
    return null;
  }

}
