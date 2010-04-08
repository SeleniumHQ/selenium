/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.By;

import java.util.List;
import java.util.Set;

public class StubDriver implements WebDriver {
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
}
