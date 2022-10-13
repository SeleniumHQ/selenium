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

import org.junit.jupiter.api.Test;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class FirefoxProfileIntegrationTest extends JupiterTestBase {

  @Test
  @NoDriverBeforeTest
  public void usesGeneratedProfile() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setStartupUrl(pages.simpleTestPage);
    FirefoxOptions options = new FirefoxOptions();
    options.setProfile(profile);
    FirefoxDriver driver = new FirefoxDriver(options);

    assertThat(driver.getCurrentUrl()).isEqualTo(pages.simpleTestPage);
    driver.quit();
  }

  @Test
  public void usesExistingProfile() throws IOException {
    String existingPath = (String) ((HasCapabilities)driver).getCapabilities().getCapability("moz:profile");
    List<String> existingTimes = Files.readAllLines(Paths.get(existingPath + "/times.json"), StandardCharsets.UTF_8);

    FirefoxProfile profile = new FirefoxProfile(new File(existingPath));
    FirefoxOptions options = new FirefoxOptions();
    options.setProfile(profile);
    FirefoxDriver localDriver = new FirefoxDriver(options);
    String currentPath = (String) ((HasCapabilities)driver).getCapabilities().getCapability("moz:profile");
    List<String> currentTimes = Files.readAllLines(Paths.get(currentPath + "/times.json"), StandardCharsets.UTF_8);

    assertThat(currentTimes).isEqualTo(existingTimes);
    localDriver.quit();
  }
}
