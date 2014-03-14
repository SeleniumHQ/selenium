/*
Copyright 2014 Software Freedom Conservancy

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

import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;

import org.junit.Test;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

public class ContextSwitchingTest extends JUnit4TestBase {

  @Test(expected = UnsupportedCommandException.class)
  public void testShouldNotBeAbleToSwitchContext() {
    driver.switchTo().context("WEBVIEW");
  }

  @Test(expected = UnsupportedCommandException.class)
  public void testShouldNotBeAbleToGetContextHandle() {
    driver.getContext();
  }

  @Test(expected = UnsupportedCommandException.class)
  public void testShouldNotBeAbleToGetContextHandles() {
    driver.getContextHandles();
  }
}
