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

package org.openqa.grid.e2e.misc;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.grid.selenium.GridLauncherV3;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.io.IOUtils;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.FluentWait;

import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.util.concurrent.TimeUnit;

/**
 * Ensure that launching the hub / node in most common ways simulating command line args works
 */
public class GridViaCommandLineTest {

  @Test
  public void testRegisterNodeToHub() throws Exception {
    Integer hubPort = PortProber.findFreePort();
    String[] hubArgs = {"-role", "hub", "-port", hubPort.toString()};
    GridLauncherV3.main(hubArgs);
    UrlChecker urlChecker = new UrlChecker();
    urlChecker.waitUntilAvailable(10, TimeUnit.SECONDS, new URL(String.format("http://localhost:%d/grid/console", hubPort)));


    Integer nodePort = PortProber.findFreePort();

    String[] nodeArgs = {"-role", "node", "-hub", "http://localhost:" + hubPort, "-browser", "browserName=chrome,maxInstances=1", "-port", nodePort.toString()};
    GridLauncherV3.main(nodeArgs);
    urlChecker.waitUntilAvailable(100, TimeUnit.SECONDS, new URL(String.format("http://localhost:%d/wd/hub/status", nodePort)));

    new FluentWait<URL>(new URL(String.format("http://localhost:%d/grid/console", hubPort))).withTimeout(5, TimeUnit.SECONDS).pollingEvery(50, TimeUnit.MILLISECONDS)
      .until((URL u) -> {
        try {
          return IOUtils.readFully(u.openConnection().getInputStream()).contains("chrome");
        } catch (IOException ioe) {
          return false;
        }
      });

    WebDriver driver = new RemoteWebDriver(new URL(String.format("http://localhost:%d/wd/hub", hubPort)),
                                                   DesiredCapabilities.chrome());

    try {
      driver.get(String.format("http://localhost:%d/grid/console", hubPort));
      Assert.assertEquals("Should only have one chrome registered to the hub", 1, driver.findElements(By.cssSelector("img[src$='chrome.png']")).size());
    } finally {
      try {
        driver.quit();
      } catch (Exception e) {}
    }


  }
}
