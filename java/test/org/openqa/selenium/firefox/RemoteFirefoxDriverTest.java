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

package org.openqa.selenium.firefox;

import org.junit.Test;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.File;
import java.net.MalformedURLException;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

public class RemoteFirefoxDriverTest extends JUnit4TestBase {

  @Test
  @NoDriverAfterTest
  public void shouldAllowRemoteWebDriverBuilderToUseHasExtensions() {
    Path extension = InProject.locate("third_party/firebug/favourite_colour-1.1-an+fx.xpi");
    ((HasExtensions) driver).installExtension(extension);
    ((HasExtensions) driver).uninstallExtension("favourite-colour-examples@mozilla.org");
  }

  @Test
  public void shouldTakeFullPageScreenshot() {
    File tempFile = ((HasFullPageScreenshot) driver).getFullPageScreenshotAs(OutputType.FILE);
    assertThat(tempFile.exists()).isTrue();
    assertThat(tempFile.length()).isGreaterThan(0);
  }

  @Test
  public void shouldAllowRemoteWebDriverBuilderToUseHasContext() throws MalformedURLException {
    FirefoxOptions options = new FirefoxOptions();
    String dir = "foo/bar";
    options.addPreference("browser.download.dir", dir);
    WebDriver driver = new WebDriverBuilder().get(options);

    try {
      ((HasContext) driver).setContext(FirefoxCommandContext.CHROME);
      String result = (String) ((JavascriptExecutor) driver).executeScript("return Services.prefs.getStringPref('browser.download.dir')");
      assertThat(result).isEqualTo(dir);
    } finally {
      driver.quit();
    }
  }

  @Test
  public void shouldSetContext() {
    FirefoxOptions options = new FirefoxOptions();
    String dir = "foo/bar";
    options.addPreference("browser.download.dir", dir);

    WebDriver driver = new WebDriverBuilder().get(options);

    try {
      HasContext context = (HasContext) driver;
      context.setContext(FirefoxCommandContext.CHROME);

      String result = (String) ((JavascriptExecutor) driver)
        .executeScript("return Services.prefs.getStringPref('browser.download.dir')");

      assertThat(result).isEqualTo(dir);
    } finally {
      driver.quit();
    }
  }
}
