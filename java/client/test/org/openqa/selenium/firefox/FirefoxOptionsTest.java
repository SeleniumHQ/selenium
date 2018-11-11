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
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assumptions.assumeThat;
import static org.openqa.selenium.PageLoadStrategy.EAGER;
import static org.openqa.selenium.firefox.FirefoxDriver.BINARY;
import static org.openqa.selenium.firefox.FirefoxDriver.MARIONETTE;
import static org.openqa.selenium.firefox.FirefoxDriver.SystemProperty.BROWSER_BINARY;
import static org.openqa.selenium.firefox.FirefoxDriver.SystemProperty.BROWSER_PROFILE;
import static org.openqa.selenium.firefox.FirefoxDriver.SystemProperty.DRIVER_USE_MARIONETTE;
import static org.openqa.selenium.firefox.FirefoxDriverLogLevel.DEBUG;
import static org.openqa.selenium.firefox.FirefoxDriverLogLevel.ERROR;
import static org.openqa.selenium.firefox.FirefoxDriverLogLevel.WARN;
import static org.openqa.selenium.firefox.FirefoxOptions.FIREFOX_OPTIONS;
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_INSECURE_CERTS;
import static org.openqa.selenium.remote.CapabilityType.PAGE_LOAD_STRATEGY;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.PageLoadStrategy;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.testing.TestUtilities;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.PosixFilePermission;
import java.util.Arrays;
import java.util.Map;

public class FirefoxOptionsTest {

  @Test
  public void canInitFirefoxOptionsWithCapabilities() {
    FirefoxOptions options = new FirefoxOptions(new ImmutableCapabilities(
        MARIONETTE, false,
        PAGE_LOAD_STRATEGY, PageLoadStrategy.EAGER,
        ACCEPT_INSECURE_CERTS, true));

    assertThat(options.isLegacy()).isTrue();
    assertThat(options.getCapability(PAGE_LOAD_STRATEGY)).isEqualTo(EAGER);
    assertThat(options.getCapability(ACCEPT_INSECURE_CERTS)).isEqualTo(true);
  }

  @Test
  public void canInitFirefoxOptionsWithCapabilitiesThatContainFirefoxOptions() {
    FirefoxOptions options = new FirefoxOptions().setLegacy(true).merge(
        new ImmutableCapabilities(PAGE_LOAD_STRATEGY, PageLoadStrategy.EAGER));
    Capabilities caps = new ImmutableCapabilities(FIREFOX_OPTIONS, options);

    FirefoxOptions options2 = new FirefoxOptions(caps);

    assertThat(options2.isLegacy()).isTrue();
    assertThat(options2.getCapability(PAGE_LOAD_STRATEGY)).isEqualTo(EAGER);
  }

  @Test
  public void canInitFirefoxOptionsWithCapabilitiesThatContainFirefoxOptionsAsMap() {
    FirefoxProfile profile = new FirefoxProfile();
    Capabilities caps = new ImmutableCapabilities(
        FIREFOX_OPTIONS, ImmutableMap.of("profile", profile));

    FirefoxOptions options = new FirefoxOptions(caps);

    assertThat(options.getProfile()).isSameAs(profile);
  }

  @Test
  public void binaryPathNeedNotExist() {
    new FirefoxOptions().setBinary("does/not/exist");
  }

  @Test
  public void shouldKeepRelativePathToBinaryAsIs() {
    FirefoxOptions options = new FirefoxOptions().setBinary("some/path");
    assertThat(options.getCapability(BINARY)).isEqualTo("some/path");
  }

  @Test
  public void shouldConvertPathToBinaryToUseForwardSlashes() {
    FirefoxOptions options = new FirefoxOptions().setBinary("some\\path");
    assertThat(options.getCapability(BINARY)).isEqualTo("some/path");
  }

  @Test
  public void shouldKeepWindowsDriveLetterInPathToBinary() {
    FirefoxOptions options = new FirefoxOptions().setBinary("F:\\some\\path");
    assertThat(options.getCapability(BINARY)).isEqualTo("F:/some/path");
  }

  @Test
  public void canUseForwardSlashesInWindowsPaths() {
    FirefoxOptions options = new FirefoxOptions().setBinary("F:\\some\\path");
    assertThat(options.getCapability(BINARY)).isEqualTo("F:/some/path");
  }

  @Test
  public void shouldKeepWindowsNetworkFileSystemRootInPathToBinary() {
    FirefoxOptions options = new FirefoxOptions().setBinary("\\\\server\\share\\some\\path");
    assertThat(options.getCapability(BINARY)).isEqualTo("//server/share/some/path");
  }

  @Test
  public void shouldKeepAFirefoxBinaryAsABinaryIfSetAsOne() throws IOException {
    File fakeExecutable = Files.createTempFile("firefox", ".exe").toFile();
    fakeExecutable.deleteOnExit();
    FirefoxBinary binary = new FirefoxBinary(fakeExecutable);
    FirefoxOptions options = new FirefoxOptions().setBinary(binary);
    assertThat(options.getCapability(BINARY)).isEqualTo(binary);
    assertThat(options.getBinary()).isEqualTo(binary);
  }

  @Test
  public void stringBasedBinaryRemainsAbsoluteIfSetAsAbsolute() {
    Map<String, Object> json = new FirefoxOptions().setBinary("/i/like/cheese").asMap();

    assertThat(((Map<?, ?>) json.get(FIREFOX_OPTIONS)).get("binary")).isEqualTo("/i/like/cheese");
  }

  @Test
  public void pathBasedBinaryRemainsAbsoluteIfSetAsAbsolute() {
    Map<String, Object> json = new FirefoxOptions().setBinary(Paths.get("/i/like/cheese")).asMap();

    assertThat(((Map<?, ?>) json.get(FIREFOX_OPTIONS)).get("binary")).isEqualTo("/i/like/cheese");
  }

  @Test
  public void shouldPickUpBinaryFromSystemPropertyIfSet() throws IOException {
    JreSystemProperty property = new JreSystemProperty(BROWSER_BINARY);

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

      assertThat(firefoxBinary.getPath()).isEqualTo(binary.toString());
    } finally {
      property.reset();
    }
  }

  @Test
  public void shouldPickUpLegacyValueFromSystemProperty() {
    JreSystemProperty property = new JreSystemProperty(DRIVER_USE_MARIONETTE);

    try {
      // No value should default to using Marionette
      property.set(null);
      FirefoxOptions options = new FirefoxOptions();
      assertThat(options.isLegacy()).isFalse();

      property.set("false");
      options = new FirefoxOptions();
      assertThat(options.isLegacy()).isTrue();

      property.set("true");
      options = new FirefoxOptions();
      assertThat(options.isLegacy()).isFalse();
    } finally {
      property.reset();
    }
  }

  @Test
  public void settingMarionetteToFalseAsASystemPropertyDoesNotPrecedence() {
    JreSystemProperty property = new JreSystemProperty(DRIVER_USE_MARIONETTE);

    try {
      Capabilities caps = new ImmutableCapabilities(MARIONETTE, true);

      property.set("false");
      FirefoxOptions options = new FirefoxOptions().merge(caps);
      assertThat(options.isLegacy()).isFalse();
    } finally {
      property.reset();
    }
  }

  @Test
  public void shouldPickUpProfileFromSystemProperty() {
    FirefoxProfile defaultProfile = new ProfilesIni().getProfile("default");
    assumeThat(defaultProfile).isNotNull();

    JreSystemProperty property = new JreSystemProperty(BROWSER_PROFILE);
    try {
      property.set("default");
      FirefoxOptions options = new FirefoxOptions();
      FirefoxProfile profile = options.getProfile();

      assertThat(profile).isNotNull();
    } finally {
      property.reset();
    }
  }

  @Test
  public void shouldThrowAnExceptionIfSystemPropertyProfileDoesNotExist() {
    String unlikelyProfileName = "this-profile-does-not-exist-also-cheese";
    FirefoxProfile foundProfile = new ProfilesIni().getProfile(unlikelyProfileName);
    assumeThat(foundProfile).isNull();

    JreSystemProperty property = new JreSystemProperty(BROWSER_PROFILE);
    try {
      property.set(unlikelyProfileName);
      assertThatExceptionOfType(WebDriverException.class)
          .isThrownBy(FirefoxOptions::new);
    } finally {
      property.reset();
    }
  }

  @Test
  public void callingToStringWhenTheBinaryDoesNotExistShouldNotCauseAnException() {
    FirefoxOptions options =
        new FirefoxOptions().setBinary("there's nothing better in life than cake or peas.");
    options.toString();
    // The binary does not exist on this machine, but could do elsewhere. Be chill.
  }

  @Test
  public void logLevelStringRepresentationIsLowercase() {
    assertThat(DEBUG.toString()).isEqualTo("debug");
  }

  @Test
  public void canBuildLogLevelFromStringRepresentation() {
    assertThat(FirefoxDriverLogLevel.fromString("warn")).isEqualTo(WARN);
    assertThat(FirefoxDriverLogLevel.fromString("ERROR")).isEqualTo(ERROR);
  }

  @Test
  public void canConvertOptionsWithArgsToCapabilitiesAndRestoreBack() {
    FirefoxOptions options = new FirefoxOptions(
        new MutableCapabilities(new FirefoxOptions().addArguments("-a", "-b")));
    Object options2 = options.asMap().get(FirefoxOptions.FIREFOX_OPTIONS);
    assertThat(options2).isNotNull().isInstanceOf(Map.class);
    assertThat(((Map<String, Object>) options2).get("args")).isEqualTo(Arrays.asList("-a", "-b"));
  }

  @Test
  public void canConvertOptionsWithPrefsToCapabilitiesAndRestoreBack() {
    FirefoxOptions options = new FirefoxOptions(
        new MutableCapabilities(new FirefoxOptions()
                                    .addPreference("string.pref", "some value")
                                    .addPreference("int.pref", 42)
                                    .addPreference("boolean.pref", true)));
    Object options2 = options.asMap().get(FirefoxOptions.FIREFOX_OPTIONS);
    assertThat(options2).isNotNull().isInstanceOf(Map.class);
    Object prefs = ((Map<String, Object>) options2).get("prefs");
    assertThat(prefs).isNotNull().isInstanceOf(Map.class);
    assertThat(((Map<String, Object>) prefs).get("string.pref")).isEqualTo("some value");
    assertThat(((Map<String, Object>) prefs).get("int.pref")).isEqualTo(42);
    assertThat(((Map<String, Object>) prefs).get("boolean.pref")).isEqualTo(true);
  }

  @Test
  public void canConvertOptionsWithBinaryToCapabilitiesAndRestoreBack() {
    FirefoxOptions options = new FirefoxOptions(
        new MutableCapabilities(new FirefoxOptions().setBinary(new FirefoxBinary())));
    Object options2 = options.asMap().get(FirefoxOptions.FIREFOX_OPTIONS);
    assertThat(options2).isNotNull().isInstanceOf(Map.class);
    assertThat(((Map<String, Object>) options2).get("binary"))
        .isEqualTo(new FirefoxBinary().getPath().replaceAll("\\\\", "/"));
  }

  @Test
  public void roundTrippingToCapabilitiesAndBackWorks() {
    FirefoxOptions expected = new FirefoxOptions()
        .setLegacy(true)
        .addPreference("cake", "walk");

    // Convert to a Map so we can create a standalone capabilities instance, which we then use to
    // create a new set of options. This is the round trip, ladies and gentlemen.
    FirefoxOptions seen = new FirefoxOptions(new ImmutableCapabilities(expected.asMap()));

    assertThat(seen).isEqualTo(expected);
  }

  private static class JreSystemProperty {

    private final String name;
    private final String originalValue;

    public JreSystemProperty(String name) {
      this.name = Preconditions.checkNotNull(name);
      this.originalValue = System.getProperty(name);
    }

    public String get() {
      return System.getProperty(name);
    }

    public void set(String value) {
      if (value == null) {
        System.clearProperty(name);
      } else {
        System.setProperty(name, value);
      }
    }

    public void reset() {
      set(originalValue);
    }
  }
}
