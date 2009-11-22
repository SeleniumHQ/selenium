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

package org.openqa.selenium.remote.server;

import junit.framework.TestCase;

import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.Jetty6AppServer;
import org.openqa.selenium.remote.server.DriverServlet;
import org.openqa.selenium.remote.ScreenshotException;
import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.JavascriptEnabled;
import org.openqa.selenium.JavascriptExecutor;

import java.io.File;

public class RemoteWebDriverTest extends AbstractDriverTestCase {
  public void testShouldBeAbleToGrabASnapshotOnException() {
    driver.get(simpleTestPage);

    try {
      driver.findElement(By.id("doesnayexist"));
      fail();
    } catch (NoSuchElementException e) {
      assertTrue(e.getCause() instanceof ScreenshotException);
      assertTrue(((ScreenshotException) e.getCause()).getBase64EncodedScreenshot().length() > 0);
    }
  }

  /**
   * Issue 248
   * @see <a href="http://code.google.com/p/webdriver/issues/detail?id=248">Issue 248</a>
   */
  @JavascriptEnabled
  public void testShouldBeAbleToCallIsJavascriptEnabled() {
    assertTrue(((JavascriptExecutor) driver).isJavascriptEnabled());
  }
}
