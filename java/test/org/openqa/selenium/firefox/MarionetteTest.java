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

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.PageLoadStrategy;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;

import java.nio.file.Path;

import static java.util.Optional.ofNullable;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_INSECURE_CERTS;
import static org.openqa.selenium.remote.CapabilityType.PAGE_LOAD_STRATEGY;

public class MarionetteTest extends JupiterTestBase {

  private static final String EXT_PATH = "common/extensions/webextensions-selenium-example.xpi";

  @Test
  @NoDriverBeforeTest
  public void canStartDriverWithEmptyOptions() {
    localDriver = new FirefoxDriver(new FirefoxOptions());
    verifyItIsMarionette(localDriver);
  }

  @Test
  @NoDriverBeforeTest
  public void canStartDriverWithNoParameters() {
    localDriver = new FirefoxDriver();
    verifyItIsMarionette(localDriver);
  }

  @Test
  @NoDriverBeforeTest
  public void canStartDriverWithSpecifiedBinary() {
    FirefoxBinary binary = spy(new FirefoxBinary());

    localDriver = new FirefoxDriver(new FirefoxOptions().setBinary(binary));

    verifyItIsMarionette(localDriver);
    verify(binary, atLeastOnce()).getPath();
  }

  @Test
  @NoDriverBeforeTest
  public void canStartDriverWithSpecifiedProfile() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", 1);
    profile.setPreference("browser.startup.homepage", pages.xhtmlTestPage);

    localDriver = new FirefoxDriver(new FirefoxOptions().setProfile(profile));
    wait(localDriver).until($ -> "XHTML Test Page".equals(localDriver.getTitle()));

    verifyItIsMarionette(localDriver);
  }

  @Test
  @NoDriverBeforeTest
  public void canStartDriverWithSpecifiedBinaryAndProfile() {
    FirefoxBinary binary = spy(new FirefoxBinary());

    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", 1);
    profile.setPreference("browser.startup.homepage", pages.xhtmlTestPage);

    localDriver = new FirefoxDriver(new FirefoxOptions().setBinary(binary).setProfile(profile));
    wait(localDriver).until($ -> "XHTML Test Page".equals(localDriver.getTitle()));

    verifyItIsMarionette(localDriver);
    verify(binary, atLeastOnce()).getPath();
  }

  @Test
  @NoDriverBeforeTest
  public void canPassCapabilities() {
    Capabilities caps = new ImmutableCapabilities(CapabilityType.PAGE_LOAD_STRATEGY, "none");

    localDriver = new FirefoxDriver(new FirefoxOptions().merge(caps));

    verifyItIsMarionette(localDriver);
    assertThat(((FirefoxDriver) localDriver).getCapabilities().getCapability(PAGE_LOAD_STRATEGY)).isEqualTo("none");
  }

  @Test
  @NoDriverBeforeTest
  public void canSetPreferencesInFirefoxOptions() {
    FirefoxOptions options = new FirefoxOptions()
      .addPreference("browser.startup.page", 1)
      .addPreference("browser.startup.homepage", pages.xhtmlTestPage);

    localDriver = new FirefoxDriver(options);
    wait(localDriver).until($ -> "XHTML Test Page".equals(localDriver.getTitle()));

    verifyItIsMarionette(localDriver);
  }

  @Test
  @NoDriverBeforeTest
  public void canSetProfileInFirefoxOptions() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", 1);
    profile.setPreference("browser.startup.homepage", pages.xhtmlTestPage);

    FirefoxOptions options = new FirefoxOptions().setProfile(profile);

    localDriver = new FirefoxDriver(options);
    wait(localDriver).until($ -> "XHTML Test Page".equals(localDriver.getTitle()));

    verifyItIsMarionette(localDriver);
  }

  @Test
  @NoDriverBeforeTest
  public void canSetProfileInCapabilities() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", 1);
    profile.setPreference("browser.startup.homepage", pages.xhtmlTestPage);

    Capabilities caps = new ImmutableCapabilities(FirefoxDriver.Capability.PROFILE, profile);

    localDriver = new FirefoxDriver(new FirefoxOptions().merge(caps));
    wait(localDriver).until($ -> "XHTML Test Page".equals(localDriver.getTitle()));

    verifyItIsMarionette(localDriver);
  }

  @Test
  @NoDriverBeforeTest
  public void canUseSameProfileInCapabilitiesAndDirectly() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", 1);
    profile.setPreference("browser.startup.homepage", pages.xhtmlTestPage);

    Capabilities caps = new ImmutableCapabilities(FirefoxDriver.Capability.PROFILE, profile);

    localDriver = new FirefoxDriver(
      new FirefoxOptions()
        .setProfile(profile)
        .merge(caps));
    wait(localDriver).until($ -> "XHTML Test Page".equals(localDriver.getTitle()));

    verifyItIsMarionette(localDriver);
  }

  @Test
  @NoDriverBeforeTest
  public void canPassCapabilitiesBinaryAndProfileSeparately() {
    FirefoxBinary binary = spy(new FirefoxBinary());

    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", 1);
    profile.setPreference("browser.startup.homepage", pages.xhtmlTestPage);

    Capabilities caps = new ImmutableCapabilities(CapabilityType.PAGE_LOAD_STRATEGY, "none");

    localDriver = new FirefoxDriver(
      new FirefoxOptions()
        .setBinary(binary)
        .setProfile(profile)
        .merge(caps));
    wait(localDriver).until($ -> "XHTML Test Page".equals(localDriver.getTitle()));

    verifyItIsMarionette(localDriver);
    verify(binary, atLeastOnce()).getPath();
    assertThat(((FirefoxDriver) localDriver).getCapabilities().getCapability(PAGE_LOAD_STRATEGY)).isEqualTo("none");
  }

  @Test
  @NoDriverBeforeTest
  public void canSetPreferencesAndProfileInFirefoxOptions() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", 1);
    profile.setPreference("browser.startup.homepage", pages.xhtmlTestPage);

    FirefoxOptions options = new FirefoxOptions()
      .setProfile(profile)
      .addPreference("browser.startup.homepage", pages.javascriptPage);

    localDriver = new FirefoxDriver(options);
    wait(localDriver).until($ -> "Testing Javascript".equals(localDriver.getTitle()));

    verifyItIsMarionette(localDriver);
  }

  @Test
  @NoDriverBeforeTest
  public void canSetPageLoadStrategyViaOptions() {
    localDriver = new FirefoxDriver(
      new FirefoxOptions().setPageLoadStrategy(PageLoadStrategy.NONE));

    verifyItIsMarionette(localDriver);
    assertThat(((FirefoxDriver) localDriver).getCapabilities().getCapability(PAGE_LOAD_STRATEGY)).isEqualTo("none");
  }

  @Test
  @NoDriverBeforeTest
  public void canSetInsecureCertSupportViaOptions() {
    localDriver = new FirefoxDriver(new FirefoxOptions().setAcceptInsecureCerts(true));

    verifyItIsMarionette(localDriver);
    assertThat(((FirefoxDriver) localDriver).getCapabilities().getCapability(ACCEPT_INSECURE_CERTS)).isEqualTo(true);
  }

  @Test
  @NoDriverBeforeTest
  public void canStartHeadless() {
    localDriver = new FirefoxDriver(new FirefoxOptions().setHeadless(true));

    verifyItIsMarionette(localDriver);
    assertThat(((FirefoxDriver) localDriver).getCapabilities().getCapability("moz:headless")).isEqualTo(true);
  }

  @Test
  @NoDriverBeforeTest
  public void canInstallAndUninstallExtensionsOnTheFly() {
    assumeTrue(driver instanceof FirefoxDriver);
    FirefoxDriver localDriver = (FirefoxDriver) driver;
    Path extension = InProject.locate(EXT_PATH);
    String extId = localDriver.installExtension(extension);
    assertThat(extId).isEqualTo("webextensions-selenium-example@example.com");
    localDriver.uninstallExtension(extId);
  }

  private void verifyItIsMarionette(WebDriver driver) {
    FirefoxDriver firefoxDriver = (FirefoxDriver) driver;
    assertThat(ofNullable(firefoxDriver.getCapabilities().getCapability("moz:processID"))
      .orElse(firefoxDriver.getCapabilities().getCapability("processId"))).isNotNull();
  }
}
