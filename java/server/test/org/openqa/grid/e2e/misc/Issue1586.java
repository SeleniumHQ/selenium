/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.grid.e2e.misc;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.net.MalformedURLException;
import java.net.URL;

// see http://code.google.com/p/selenium/issues/detail?id=1586
public class Issue1586 {

  private Hub hub;

  @BeforeClass(alwaysRun = true)
  public void prepare() throws Exception {
    hub = GridTestHelper.getHub();

    // register a webdriver
    SelfRegisteringRemote webdriver =
        GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
    webdriver.addBrowser(DesiredCapabilities.firefox(), 1);
    webdriver.startRemoteServer();
    webdriver.sendRegistrationRequest();

    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
  }

  // extremely slow test, for issue1586. Excluding from regression.
  @Test(enabled=false)
  public void test() throws MalformedURLException {
    DesiredCapabilities ff = DesiredCapabilities.firefox();
    WebDriver driver = null;
    try {
      driver = new RemoteWebDriver(new URL(hub.getUrl() + "/grid/driver"), ff);
      for (int i = 0; i < 20; i++) {
        driver.get("http://code.google.com/p/selenium/");
        WebElement keywordInput = driver.findElement(By.name("q"));
        keywordInput.clear();
        keywordInput.sendKeys("test");
        WebElement submitButton = driver.findElement(By.name("projectsearch"));
        submitButton.click();
        driver.getCurrentUrl(); // fails here
      }
    } finally {
      if (driver != null) {
        driver.quit();
      }
    }
  }

  @AfterClass(alwaysRun = true)
  public void stop() throws Exception {
    hub.stop();
  }
}
