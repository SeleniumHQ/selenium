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

import static java.nio.file.StandardOpenOption.DELETE_ON_CLOSE;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.junit.Assume.assumeNotNull;
import static org.junit.Assume.assumeThat;
import static org.openqa.selenium.firefox.FirefoxDriver.MARIONETTE;
import static org.openqa.selenium.firefox.FirefoxDriver.SystemProperty.BROWSER_BINARY;
import static org.openqa.selenium.firefox.FirefoxDriver.SystemProperty.BROWSER_PROFILE;
import static org.openqa.selenium.firefox.FirefoxDriver.SystemProperty.DRIVER_USE_MARIONETTE;
import static org.openqa.selenium.firefox.FirefoxOptions.FIREFOX_OPTIONS;
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_INSECURE_CERTS;
import static org.openqa.selenium.remote.CapabilityType.PAGE_LOAD_STRATEGY;

import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.PageLoadStrategy;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.internal.ProfilesIni;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.JreSystemProperty;
import org.openqa.selenium.testing.TestUtilities;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.PosixFilePermission;
import java.util.Map;
import java.util.Optional;

public class FirefoxOptionsTest {

  @Test
  public void canInitFirefoxOptionsWithCapabilities() {
    FirefoxOptions options = new FirefoxOptions(new ImmutableCapabilities(ImmutableMap.of(
        MARIONETTE, false,
        PAGE_LOAD_STRATEGY, PageLoadStrategy.EAGER,
        ACCEPT_INSECURE_CERTS, true)));

    assertTrue(options.isLegacy());
    assertEquals(options.toCapabilities().getCapability(PAGE_LOAD_STRATEGY), PageLoadStrategy.EAGER);
    assertEquals(options.toCapabilities().getCapability(ACCEPT_INSECURE_CERTS), true);
  }

  @Test
  public void canInitFirefoxOptionsWithCapabilitiesThatContainFirefoxOptions() {
    FirefoxOptions options = new FirefoxOptions().setLegacy(true).addCapabilities(
        new ImmutableCapabilities(ImmutableMap.of(PAGE_LOAD_STRATEGY, PageLoadStrategy.EAGER)));
    Capabilities caps = new ImmutableCapabilities(ImmutableMap.of(FIREFOX_OPTIONS, options));

    FirefoxOptions options2 = new FirefoxOptions(caps);

    assertTrue(options2.isLegacy());
    assertEquals(options2.toCapabilities().getCapability(PAGE_LOAD_STRATEGY), PageLoadStrategy.EAGER);
  }

  @Test
  public void canInitFirefoxOptionsWithCapabilitiesThatContainFirefoxOptionsAsMap() {
    FirefoxProfile profile = new FirefoxProfile();
    Capabilities caps = new ImmutableCapabilities(ImmutableMap.of(
        FIREFOX_OPTIONS, ImmutableMap.of("profile", profile)));

    FirefoxOptions options = new FirefoxOptions(caps);

    assertSame(options.getProfile(), profile);
  }

  @Test
  public void binaryPathNeedNotExist() {
    try {
      new FirefoxOptions().setBinary("does/not/exist");
    } catch (Exception e) {
      fail("Did not expect to see any exceptions thrown: " + e);
    }
  }

  @Test
  public void shouldKeepRelativePathToBinaryAsIs() {
    FirefoxOptions options = new FirefoxOptions().setBinary("some/path");
    Capabilities caps = options.addTo(new DesiredCapabilities());

    assertEquals("some/path", caps.getCapability(FirefoxDriver.BINARY));
  }

  @Test
  public void shouldConvertPathToBinaryToUseForwardSlashes() {
    FirefoxOptions options = new FirefoxOptions().setBinary("some\\path");
    Capabilities caps = options.addTo(new DesiredCapabilities());

    assertEquals("some/path", caps.getCapability(FirefoxDriver.BINARY));
  }

  @Test
  public void shouldKeepWindowsDriveLetterInPathToBinary() {
    FirefoxOptions options = new FirefoxOptions().setBinary("F:\\some\\path");
    Capabilities caps = options.addTo(new DesiredCapabilities());

    assertEquals("F:/some/path", caps.getCapability(FirefoxDriver.BINARY));
  }

  @Test
  public void canUseForwardSlashesInWindowsPaths() {
    FirefoxOptions options = new FirefoxOptions().setBinary("F:\\some\\path");
    Capabilities caps = options.addTo(new DesiredCapabilities());

    assertEquals("F:/some/path", caps.getCapability(FirefoxDriver.BINARY));
  }

  @Test
  public void shouldKeepWindowsNetworkFileSystemRootInPathToBinary() {
    FirefoxOptions options = new FirefoxOptions().setBinary("\\\\server\\share\\some\\path");
    Capabilities caps = options.addTo(new DesiredCapabilities());

    assertEquals("//server/share/some/path", caps.getCapability(FirefoxDriver.BINARY));
  }

  @Test
  public void shouldKeepAFirefoxBinaryAsABinaryIfSetAsOne() throws IOException {
    File fakeExecutable = Files.createTempFile("firefox", ".exe").toFile();
    fakeExecutable.deleteOnExit();
    FirefoxBinary binary = new FirefoxBinary(fakeExecutable);
    FirefoxOptions options = new FirefoxOptions().setBinary(binary);

    Capabilities caps = options.addTo(new DesiredCapabilities());

    assertEquals(binary, caps.getCapability(FirefoxDriver.BINARY));
  }

  @Test
  public void stringBasedBinaryRemainsAbsoluteIfSetAsAbsolute() throws IOException {
    Map<String, Object> json = new FirefoxOptions().setBinary("/i/like/cheese").toJson();

    assertEquals("/i/like/cheese", json.get("binary"));
  }

  @Test
  public void pathBasedBinaryRemainsAbsoluteIfSetAsAbsolute() throws IOException {
    Map<String, Object> json = new FirefoxOptions().setBinary(Paths.get("/i/like/cheese")).toJson();

    assertEquals("/i/like/cheese", json.get("binary"));
  }

  @Test
  public void shouldPickUpBinaryFromSystemPropertyIfSet() throws IOException {
    JreSystemProperty property = new JreSystemProperty(BROWSER_BINARY);
    String resetValue = property.get();

    Path binary = Files.createTempFile("firefox", ".exe");
    try (OutputStream ignored = Files.newOutputStream(binary, DELETE_ON_CLOSE)) {
      Files.write(binary, "".getBytes());
      if (! TestUtilities.getEffectivePlatform().is(Platform.WINDOWS)) {
        Files.setPosixFilePermissions(binary, ImmutableSet.of(PosixFilePermission.OWNER_EXECUTE));
      }
      property.set(binary.toString());
      FirefoxOptions options = new FirefoxOptions();

      FirefoxBinary firefoxBinary =
          options.getBinaryOrNull().orElseThrow(() -> new AssertionError("No binary"));

      assertEquals(binary.toString(), firefoxBinary.getPath());
    } finally {
      property.set(resetValue);
    }
  }

  @Test
  public void shouldPickUpLegacyValueFromSystemProperty() throws IOException {
    JreSystemProperty property = new JreSystemProperty(DRIVER_USE_MARIONETTE);
    String resetValue = property.get();

    try {
      // No value should default to using Marionette
      property.set(null);
      FirefoxOptions options = new FirefoxOptions();
      assertFalse(options.isLegacy());

      property.set("false");
      options = new FirefoxOptions();
      assertTrue(options.isLegacy());

      property.set("true");
      options = new FirefoxOptions();
      assertFalse(options.isLegacy());
    } finally {
      property.set(resetValue);
    }
  }

  @Test
  public void settingMarionetteToFalseAsASystemPropertyDoesNotPrecedence() {
    JreSystemProperty property = new JreSystemProperty(DRIVER_USE_MARIONETTE);
    String resetValue = property.get();

    try {
      DesiredCapabilities caps = new DesiredCapabilities();
      caps.setCapability(MARIONETTE, true);

      property.set("false");
      FirefoxOptions options = new FirefoxOptions().addCapabilities(caps);
      assertFalse(options.isLegacy());
    } finally {
      property.set(resetValue);
    }
  }

  @Test
  public void shouldPickUpProfileFromSystemProperty() throws IOException {
    FirefoxProfile defaultProfile = new ProfilesIni().getProfile("default");
    assumeNotNull(defaultProfile);

    JreSystemProperty property = new JreSystemProperty(BROWSER_PROFILE);
    String resetValue = property.get();
    try {
      property.set("default");
      FirefoxOptions options = new FirefoxOptions();
      Optional<FirefoxProfile> profile = options.getProfileOrNull();

      assertTrue(profile.isPresent());
    } finally {
      property.set(resetValue);
    }
  }

  @Test(expected = WebDriverException.class)
  public void shouldThrowAnExceptionIfSystemPropertyProfileDoesNotExist() {
    String unlikelyProfileName = "this-profile-does-not-exist-also-cheese";
    FirefoxProfile foundProfile = new ProfilesIni().getProfile(unlikelyProfileName);
    assumeThat(foundProfile, is(nullValue()));

    JreSystemProperty property = new JreSystemProperty(BROWSER_PROFILE);
    String resetValue = property.get();
    try {
      property.set(unlikelyProfileName);
      new FirefoxOptions();
    } finally {
      property.set(resetValue);
    }
  }

  @Test
  public void callingToStringWhenTheBinaryDoesNotExistShouldNotCauseAnException() {
    FirefoxOptions options =
        new FirefoxOptions().setBinary("there's nothing better in life than cake or peas.");
    try {
      options.toString();
      // The binary does not exist on this machine, but could do elsewhere. Be chill.
    } catch (Exception e) {
      fail(Throwables.getStackTraceAsString(e));
    }
  }

  @Test
  public void logLevelStringRepresentationIsLowercase() {
    assertEquals(FirefoxDriverLogLevel.DEBUG.toString(), "debug");
  }

  @Test
  public void canBuildLogLevelFromStringRepresentation() {
    assertEquals(FirefoxDriverLogLevel.fromString("warn"), FirefoxDriverLogLevel.WARN);
    assertEquals(FirefoxDriverLogLevel.fromString("ERROR"), FirefoxDriverLogLevel.ERROR);
  }

}
