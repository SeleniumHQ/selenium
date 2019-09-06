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

package org.openqa.selenium.chrome;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_INSECURE_CERTS;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.testing.drivers.TestChromeDriver;

import java.io.IOException;
import java.nio.file.Files;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;

public class ChromeDriverFunctionalTest extends JUnit4TestBase {

  private final String CLIPBOARD_READ = "clipboard-read";
  private final String CLIPBOARD_WRITE = "clipboard-write";

  private ChromeDriver driver = null;

  @After
  public void tearDown() {
    if (driver != null) {
      //driver.quit();
    }
  }

  @Test
  public void canSetPermission() throws IOException, InterruptedException{
    //Cast provided driver to enable ChromeSpecific calls
    driver = (ChromeDriver) super.driver;

    driver.get(pages.clicksPage);
    assertThat(checkPermission(driver, CLIPBOARD_READ)).isEqualTo("prompt");
    assertThat(checkPermission(driver, CLIPBOARD_WRITE)).isEqualTo("granted");
        
    driver.setPermission(CLIPBOARD_READ, "denied");
    driver.setPermission(CLIPBOARD_WRITE, "prompt");
        
    assertThat(checkPermission(driver, CLIPBOARD_READ)).isEqualTo("denied");
    assertThat(checkPermission(driver, CLIPBOARD_WRITE)).isEqualTo("prompt");
    Thread.sleep(1000);
  }
  
  @Test
  public void canSetPermissionHeadless() throws IOException, InterruptedException{
    ChromeOptions options = new ChromeOptions();
    options.setHeadless(true);
    //TestChromeDriver is not honoring headless request; using ChromeDriver instead
    super.driver = new ChromeDriver(options);
    driver = (ChromeDriver) super.driver;
      
    driver.get(pages.clicksPage);
    assertThat(checkPermission(driver, CLIPBOARD_READ)).isEqualTo("prompt");
    assertThat(checkPermission(driver, CLIPBOARD_WRITE)).isEqualTo("prompt");
        
    driver.setPermission(CLIPBOARD_READ, "granted");
    driver.setPermission(CLIPBOARD_WRITE, "granted");
        
    assertThat(checkPermission(driver, CLIPBOARD_READ)).isEqualTo("granted");
    assertThat(checkPermission(driver, CLIPBOARD_WRITE)).isEqualTo("granted");
    Thread.sleep(1000);
  }  
  
  public String checkPermission(ChromeDriver driver, String permission){
    @SuppressWarnings("unchecked")
    Map<String, Object> result = (Map<String, Object>) driver.executeAsyncScript(
      "callback = arguments[arguments.length - 1];"
      + "callback(navigator.permissions.query({"
      + "name: arguments[0]"
      + "}));", permission);
    return result.get("state").toString();
  }
 

}
