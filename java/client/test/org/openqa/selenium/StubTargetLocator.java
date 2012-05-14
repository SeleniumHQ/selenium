/*
Copyright 2007-2010 Selenium committers

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

/**
 * Stub target locator.
 */
public class StubTargetLocator implements WebDriver.TargetLocator {
  public WebDriver frame(int index) {
    throw new UnsupportedOperationException("frame(int)");
  }

  public WebDriver frame(String nameOrIdOrIndex) {
    throw new UnsupportedOperationException("frame(String)");
  }

  public WebDriver frame(WebElement frameElement) {
    throw new UnsupportedOperationException("frame(WebElement)");
  }

  public WebDriver window(String nameOrHandle) {
    throw new UnsupportedOperationException("window(String)");
  }

  public WebDriver defaultContent() {
    throw new UnsupportedOperationException("defaultContent()");
  }

  public WebElement activeElement() {
    throw new UnsupportedOperationException("activeElement()");
  }

  public Alert alert() {
    throw new UnsupportedOperationException("alert()");
  }
}
