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

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

import java.io.File;
import java.io.IOException;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

class FirefoxDriverPreferenceTest extends JupiterTestBase {

  private FirefoxOptions getDefaultOptions() {
    return (FirefoxOptions) FIREFOX.getCapabilities();
  }

  @Test
  @NoDriverBeforeTest
  public void canStartDriverWithSpecifiedProfile() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", 1);
    profile.setPreference("browser.startup.homepage", pages.xhtmlTestPage);

    localDriver = new WebDriverBuilder().get(getDefaultOptions().setProfile(profile));

    wait(localDriver).until($ -> "XHTML Test Page".equals(localDriver.getTitle()));
  }

  @Test
  @NoDriverBeforeTest
  public void canSetPreferencesInFirefoxOptions() {
    FirefoxOptions options =
        getDefaultOptions()
            .addPreference("browser.startup.page", 1)
            .addPreference("browser.startup.homepage", pages.xhtmlTestPage);

    localDriver = new WebDriverBuilder().get(options);

    wait(localDriver).until($ -> "XHTML Test Page".equals(localDriver.getTitle()));
  }

  @Test
  @NoDriverBeforeTest
  public void canSetProfileInFirefoxOptions() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", 1);
    profile.setPreference("browser.startup.homepage", pages.xhtmlTestPage);

    FirefoxOptions options = getDefaultOptions().setProfile(profile);

    localDriver = new WebDriverBuilder().get(options);
    wait(localDriver).until($ -> "XHTML Test Page".equals(localDriver.getTitle()));
  }

  @Test
  @NoDriverBeforeTest
  public void canSetPreferencesAndProfileInFirefoxOptions() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", 1);
    profile.setPreference("browser.startup.homepage", pages.xhtmlTestPage);

    FirefoxOptions options =
        getDefaultOptions()
            .setProfile(profile)
            .addPreference("browser.startup.homepage", pages.javascriptPage);

    localDriver = new WebDriverBuilder().get(options);
    wait(localDriver).until($ -> "Testing Javascript".equals(localDriver.getTitle()));
  }

  @Test
  @NoDriverBeforeTest
  public void aNewProfileShouldAllowSettingAdditionalParameters() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.homepage", pages.formPage);

    FirefoxOptions options = (FirefoxOptions) FIREFOX.getCapabilities();
    localDriver = new WebDriverBuilder().get(options.setProfile(profile));
    new WebDriverWait(localDriver, Duration.ofSeconds(30)).until(titleIs("We Leave From Here"));
    String title = localDriver.getTitle();

    assertThat(title).isEqualTo("We Leave From Here");
  }

  @Test
  @NoDriverBeforeTest
  public void shouldBeAbleToStartFromProfileWithLogFileSet() throws IOException {
    FirefoxProfile profile = new FirefoxProfile();
    File logFile = File.createTempFile("test", "firefox.log");
    logFile.deleteOnExit();

    profile.setPreference("webdriver.log.file", logFile.getAbsolutePath());

    localDriver = new WebDriverBuilder().get(new FirefoxOptions().setProfile(profile));
    assertThat(logFile).exists();
  }

  @Test
  @NoDriverBeforeTest
  public void shouldBeAbleToStartFromProfileWithLogFileSetToStdout() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("webdriver.log.file", "/dev/stdout");

    localDriver = new WebDriverBuilder().get(new FirefoxOptions().setProfile(profile));
  }
}
