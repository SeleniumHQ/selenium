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
import static java.util.Collections.emptyMap;
import static java.util.Collections.singleton;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assumptions.assumeThat;
import static org.assertj.core.api.InstanceOfAssertFactories.LIST;
import static org.assertj.core.api.InstanceOfAssertFactories.MAP;
import static org.assertj.core.api.InstanceOfAssertFactories.STRING;
import static org.openqa.selenium.PageLoadStrategy.EAGER;
import static org.openqa.selenium.firefox.FirefoxDriver.SystemProperty.BROWSER_BINARY;
import static org.openqa.selenium.firefox.FirefoxDriver.SystemProperty.BROWSER_PROFILE;
import static org.openqa.selenium.firefox.FirefoxDriverLogLevel.DEBUG;
import static org.openqa.selenium.firefox.FirefoxDriverLogLevel.ERROR;
import static org.openqa.selenium.firefox.FirefoxDriverLogLevel.WARN;
import static org.openqa.selenium.firefox.FirefoxOptions.FIREFOX_OPTIONS;
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_INSECURE_CERTS;
import static org.openqa.selenium.remote.CapabilityType.PAGE_LOAD_STRATEGY;

import com.google.common.collect.ImmutableMap;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.PosixFilePermission;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.assertj.core.api.InstanceOfAssertFactories;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.PageLoadStrategy;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.testing.TestUtilities;

@Tag("UnitTests")
class FirefoxOptionsTest {

  @Test
  void canInitFirefoxOptionsWithCapabilities() {
    FirefoxOptions options =
        new FirefoxOptions(
            new ImmutableCapabilities(
                PAGE_LOAD_STRATEGY, PageLoadStrategy.EAGER, ACCEPT_INSECURE_CERTS, true));

    assertThat(options.getCapability(PAGE_LOAD_STRATEGY)).isEqualTo(EAGER);
    assertThat(options.getCapability(ACCEPT_INSECURE_CERTS)).isEqualTo(true);
  }

  @Test
  void canInitFirefoxOptionsWithCapabilitiesThatContainFirefoxOptionsAsMap() {
    FirefoxProfile profile = new FirefoxProfile();
    Capabilities caps =
        new ImmutableCapabilities(FIREFOX_OPTIONS, ImmutableMap.of("profile", profile));

    FirefoxOptions options = new FirefoxOptions(caps);

    assertThat(options.getProfile()).isEqualTo(profile);
  }

  @Test
  void binaryPathNeedNotExist() {
    new FirefoxOptions().setBinary("does/not/exist");
  }

  @Test
  void shouldKeepRelativePathToBinaryAsIs() {
    String path = String.join(File.separator, "some", "path");
    FirefoxOptions options = new FirefoxOptions().setBinary(path);
    assertThat(options.getBinary())
        .extracting(FirefoxBinary::getFile)
        .extracting(String::valueOf)
        .isEqualTo(path);
  }

  @Test
  void shouldKeepWindowsDriveLetterInPathToBinary() {
    FirefoxOptions options = new FirefoxOptions().setBinary("F:\\some\\path");
    assertThat(options.getBinary())
        .extracting(FirefoxBinary::getFile)
        .extracting(String::valueOf)
        .isEqualTo("F:\\some\\path");
  }

  @Test
  void shouldKeepWindowsNetworkFileSystemRootInPathToBinary() {
    FirefoxOptions options = new FirefoxOptions().setBinary("\\\\server\\share\\some\\path");
    assertThat(options.getBinary())
        .extracting(FirefoxBinary::getFile)
        .extracting(String::valueOf)
        .isEqualTo("\\\\server\\share\\some\\path");
  }

  @Test
  void shouldKeepAFirefoxBinaryAsABinaryIfSetAsOne() throws IOException {
    File fakeExecutable = Files.createTempFile("firefox", ".exe").toFile();
    fakeExecutable.deleteOnExit();
    FirefoxBinary binary = new FirefoxBinary(fakeExecutable);
    FirefoxOptions options = new FirefoxOptions().setBinary(binary);
    assertThat(options.getBinary().getFile()).isEqualTo(binary.getFile());
  }

  @Test
  void stringBasedBinaryRemainsAbsoluteIfSetAsAbsolute() {
    Map<String, Object> json = new FirefoxOptions().setBinary("/i/like/cheese").asMap();

    assertThat(json.get(FIREFOX_OPTIONS))
        .asInstanceOf(InstanceOfAssertFactories.MAP)
        .containsEntry("binary", "/i/like/cheese");
  }

  @Test
  void pathBasedBinaryRemainsAbsoluteIfSetAsAbsolute() {
    String path = String.join(File.separator, "", "i", "like", "cheese");
    Map<String, Object> json = new FirefoxOptions().setBinary(Paths.get("/i/like/cheese")).asMap();

    assertThat(json.get(FIREFOX_OPTIONS))
        .asInstanceOf(InstanceOfAssertFactories.MAP)
        .containsEntry("binary", path);
  }

  @Test
  void shouldPickUpBinaryFromSystemPropertyIfSet() throws IOException {
    JreSystemProperty property = new JreSystemProperty(BROWSER_BINARY);

    Path binary = Files.createTempFile("firefox", ".exe");
    try (OutputStream ignored = Files.newOutputStream(binary, DELETE_ON_CLOSE)) {
      Files.write(binary, "".getBytes());
      if (!TestUtilities.getEffectivePlatform().is(Platform.WINDOWS)) {
        Files.setPosixFilePermissions(binary, singleton(PosixFilePermission.OWNER_EXECUTE));
      }
      property.set(binary.toString());
      FirefoxOptions options = new FirefoxOptions().configureFromEnv();

      FirefoxBinary firefoxBinary =
          options.getBinaryOrNull().orElseThrow(() -> new AssertionError("No binary"));

      assertThat(firefoxBinary.getPath()).isEqualTo(binary.toString());
    } finally {
      property.reset();
    }
  }

  @Test
  void shouldPickUpProfileFromSystemProperty() {
    FirefoxProfile defaultProfile = new ProfilesIni().getProfile("default");
    assumeThat(defaultProfile).isNotNull();

    JreSystemProperty property = new JreSystemProperty(BROWSER_PROFILE);
    try {
      property.set("default");
      FirefoxOptions options = new FirefoxOptions().configureFromEnv();
      FirefoxProfile profile = options.getProfile();

      assertThat(profile).isNotNull();
    } finally {
      property.reset();
    }
  }

  @Test
  void shouldThrowAnExceptionIfSystemPropertyProfileDoesNotExist() {
    String unlikelyProfileName = "this-profile-does-not-exist-also-cheese";
    FirefoxProfile foundProfile = new ProfilesIni().getProfile(unlikelyProfileName);
    assumeThat(foundProfile).isNull();

    JreSystemProperty property = new JreSystemProperty(BROWSER_PROFILE);
    try {
      FirefoxOptions options = new FirefoxOptions();
      property.set(unlikelyProfileName);
      assertThatExceptionOfType(WebDriverException.class).isThrownBy(options::configureFromEnv);
    } finally {
      property.reset();
    }
  }

  @Test
  void shouldGetStringPreferencesFromGetProfile() {
    String key = "browser.startup.homepage";
    String value = "about:robots";

    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference(key, value);

    FirefoxOptions options = new FirefoxOptions();
    options.setProfile(profile);

    assertThat(profile.getStringPreference(key, "-")).isEqualTo(value);

    FirefoxProfile extractedProfile = options.getProfile();
    assertThat(extractedProfile.getStringPreference(key, "-")).isEqualTo(value);
  }

  @Test
  void shouldGetIntegerPreferencesFromGetProfile() {
    String key = "key";
    int value = 5;

    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference(key, value);

    FirefoxOptions options = new FirefoxOptions();
    options.setProfile(profile);

    assertThat(profile.getIntegerPreference(key, 0)).isEqualTo(value);

    FirefoxProfile extractedProfile = options.getProfile();
    assertThat(extractedProfile.getIntegerPreference(key, 0)).isEqualTo(value);
  }

  @Test
  void shouldGetBooleanPreferencesFromGetProfile() {
    String key = "key";
    boolean value = true;

    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference(key, value);

    FirefoxOptions options = new FirefoxOptions();
    options.setProfile(profile);

    assertThat(profile.getBooleanPreference(key, false)).isEqualTo(value);

    FirefoxProfile extractedProfile = options.getProfile();
    assertThat(extractedProfile.getBooleanPreference(key, false)).isEqualTo(value);
  }

  @Test
  void callingToStringWhenTheBinaryDoesNotExistShouldNotCauseAnException() {
    FirefoxOptions options =
        new FirefoxOptions().setBinary("there's nothing better in life than cake or peas.");
    assertThatNoException().isThrownBy(options::toString);
    // The binary does not exist on this machine, but could do elsewhere. Be chill.
  }

  @Test
  void logLevelStringRepresentationIsLowercase() {
    assertThat(DEBUG.toString()).isEqualTo("debug");
  }

  @Test
  void canBuildLogLevelFromStringRepresentation() {
    assertThat(FirefoxDriverLogLevel.fromString("warn")).isEqualTo(WARN);
    assertThat(FirefoxDriverLogLevel.fromString("ERROR")).isEqualTo(ERROR);
  }

  @Test
  void canConvertOptionsWithArgsToCapabilitiesAndRestoreBack() {
    FirefoxOptions options =
        new FirefoxOptions(new MutableCapabilities(new FirefoxOptions().addArguments("-a", "-b")));
    Object options2 = options.asMap().get(FirefoxOptions.FIREFOX_OPTIONS);
    assertThat(options2)
        .asInstanceOf(InstanceOfAssertFactories.MAP)
        .containsEntry("args", Arrays.asList("-a", "-b"));
  }

  @Test
  void canConvertOptionsWithPrefsToCapabilitiesAndRestoreBack() {
    FirefoxOptions options =
        new FirefoxOptions(
            new MutableCapabilities(
                new FirefoxOptions()
                    .addPreference("string.pref", "some value")
                    .addPreference("int.pref", 42)
                    .addPreference("boolean.pref", true)));
    Object options2 = options.asMap().get(FirefoxOptions.FIREFOX_OPTIONS);
    assertThat(options2)
        .asInstanceOf(InstanceOfAssertFactories.MAP)
        .extractingByKey("prefs")
        .asInstanceOf(InstanceOfAssertFactories.MAP)
        .containsEntry("string.pref", "some value")
        .containsEntry("int.pref", 42)
        .containsEntry("boolean.pref", true);
  }

  @Test
  void canConvertOptionsWithBinaryToCapabilitiesAndRestoreBack() throws IOException {
    // Don't assume Firefox is actually installed and available
    Path tempFile = Files.createTempFile("firefoxoptions", "test");

    FirefoxOptions options =
        new FirefoxOptions(
            new MutableCapabilities(
                new FirefoxOptions().setBinary(new FirefoxBinary(tempFile.toFile()))));
    Object options2 = options.asMap().get(FirefoxOptions.FIREFOX_OPTIONS);
    assertThat(options2)
        .asInstanceOf(InstanceOfAssertFactories.MAP)
        .containsEntry("binary", tempFile.toFile().getPath());
  }

  @Test
  void roundTrippingToCapabilitiesAndBackWorks() {
    FirefoxOptions expected = new FirefoxOptions().addPreference("cake", "walk");

    // Convert to a Map so we can create a standalone capabilities instance, which we then use to
    // create a new set of options. This is the round trip, ladies and gentlemen.
    FirefoxOptions seen = new FirefoxOptions(new ImmutableCapabilities(expected.asMap()));

    assertThat(seen).isEqualTo(expected);
  }

  @Test
  void optionsAsMapShouldBeImmutable() {
    Map<String, Object> options =
        new FirefoxOptions().addPreference("alpha", "beta").addArguments("--cheese").asMap();
    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> options.put("browserName", "chrome"));

    Map<String, Object> mozOptions = (Map<String, Object>) options.get(FIREFOX_OPTIONS);
    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> mozOptions.put("prefs", emptyMap()));

    Map<String, Object> prefs = (Map<String, Object>) mozOptions.get("prefs");
    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> prefs.put("x", true));

    List<String> args = (List<String>) mozOptions.get("args");
    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> args.add("-help"));
  }

  @Test
  void mergingOptionsMergesArguments() {
    FirefoxOptions one = new FirefoxOptions().addArguments("verbose");
    FirefoxOptions two = new FirefoxOptions().addArguments("silent");
    FirefoxOptions merged = one.merge(two);

    assertThat(merged.asMap())
        .asInstanceOf(MAP)
        .extractingByKey(FirefoxOptions.FIREFOX_OPTIONS)
        .asInstanceOf(MAP)
        .extractingByKey("args")
        .asInstanceOf(LIST)
        .containsExactly("verbose", "silent");
  }

  @Test
  void mergingOptionsMergesPreferences() {
    FirefoxOptions one =
        new FirefoxOptions().addPreference("opt1", "val1").addPreference("opt2", "val2");
    FirefoxOptions two =
        new FirefoxOptions().addPreference("opt2", "val4").addPreference("opt3", "val3");
    FirefoxOptions merged = one.merge(two);

    assertThat(merged.asMap())
        .asInstanceOf(MAP)
        .extractingByKey(FirefoxOptions.FIREFOX_OPTIONS)
        .asInstanceOf(MAP)
        .extractingByKey("prefs")
        .asInstanceOf(MAP)
        .containsEntry("opt1", "val1")
        .containsEntry("opt2", "val4")
        .containsEntry("opt3", "val3");
  }

  @Test
  void mergingOptionsWithMutableCapabilities() {
    MutableCapabilities one = new MutableCapabilities();

    FirefoxOptions options = new FirefoxOptions();
    options.addArguments("verbose");
    options.addArguments("silent");
    options.addPreference("opt1", "val1");
    options.addPreference("opt2", "val4");
    options.setAcceptInsecureCerts(true);

    String key = "browser.startup.homepage";
    String value = "about:robots";

    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference(key, value);

    options.setProfile(profile);

    options.setLogLevel(DEBUG);

    File binary = TestUtilities.createTmpFile("binary");
    options.setBinary(binary.toPath());

    one.setCapability(FIREFOX_OPTIONS, options);

    FirefoxOptions two = new FirefoxOptions();
    two.addArguments("verbose");
    two.addPreference("opt2", "val2");
    two.addPreference("opt3", "val3");
    two = two.merge(one);

    Map<String, Object> map = two.asMap();

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(FIREFOX_OPTIONS)
        .asInstanceOf(MAP)
        .extractingByKey("args")
        .asInstanceOf(LIST)
        .containsExactly("verbose", "silent");

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(FIREFOX_OPTIONS)
        .asInstanceOf(MAP)
        .extractingByKey("prefs")
        .asInstanceOf(MAP)
        .containsEntry("opt1", "val1")
        .containsEntry("opt2", "val4")
        .containsEntry("opt3", "val3");

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(ACCEPT_INSECURE_CERTS)
        .isExactlyInstanceOf(Boolean.class);

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(FIREFOX_OPTIONS)
        .asInstanceOf(MAP)
        .extractingByKey("binary")
        .asInstanceOf(STRING)
        .isEqualTo(binary.getPath());

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(FIREFOX_OPTIONS)
        .asInstanceOf(MAP)
        .extractingByKey("log")
        .asInstanceOf(MAP)
        .containsEntry("level", "debug");

    FirefoxProfile extractedProfile = two.getProfile();
    assertThat(extractedProfile.getStringPreference(key, "-")).isEqualTo(value);
  }

  @Test
  void mergingOptionsWithOptionsAsMutableCapabilities() throws IOException {
    Map<String, String> prefs = new HashMap<>();
    prefs.put("opt1", "val1");
    prefs.put("opt2", "val4");

    String key = "browser.startup.homepage";
    String value = "about:robots";

    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference(key, value);

    File binary = TestUtilities.createTmpFile("binary");

    MutableCapabilities browserCaps = new MutableCapabilities();

    browserCaps.setCapability("args", Arrays.asList("verbose", "silent"));
    browserCaps.setCapability("prefs", prefs);
    browserCaps.setCapability("profile", profile.toJson());
    browserCaps.setCapability("binary", binary.getPath());
    browserCaps.setCapability("log", DEBUG.toJson());

    MutableCapabilities one = new MutableCapabilities();
    one.setCapability(FIREFOX_OPTIONS, browserCaps);

    FirefoxOptions two = new FirefoxOptions();
    two.addArguments("verbose");
    two.addPreference("opt2", "val2");
    two.addPreference("opt3", "val3");
    two = two.merge(one);

    Map<String, Object> map = two.asMap();

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(FIREFOX_OPTIONS)
        .asInstanceOf(MAP)
        .extractingByKey("args")
        .asInstanceOf(LIST)
        .containsExactly("verbose", "silent");

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(FIREFOX_OPTIONS)
        .asInstanceOf(MAP)
        .extractingByKey("prefs")
        .asInstanceOf(MAP)
        .containsEntry("opt1", "val1")
        .containsEntry("opt2", "val4")
        .containsEntry("opt3", "val3");

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(ACCEPT_INSECURE_CERTS)
        .isExactlyInstanceOf(Boolean.class);

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(FIREFOX_OPTIONS)
        .asInstanceOf(MAP)
        .extractingByKey("binary")
        .asInstanceOf(STRING)
        .isEqualTo(binary.getPath());

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(FIREFOX_OPTIONS)
        .asInstanceOf(MAP)
        .extractingByKey("log")
        .asInstanceOf(MAP)
        .containsEntry("level", "debug");

    FirefoxProfile extractedProfile = two.getProfile();
    assertThat(extractedProfile.getStringPreference(key, "-")).isEqualTo(value);
  }

  @Test
  void firefoxOptionsShouldEqualEquivalentImmutableCapabilities() {
    FirefoxOptions options =
        new FirefoxOptions().addArguments("hello", "-headless").setPageLoadStrategy(EAGER);
    Capabilities caps = new ImmutableCapabilities(options);

    assertThat(caps).isEqualTo(options);
    assertThat(caps.getCapabilityNames()).contains(FIREFOX_OPTIONS);
  }

  private static class JreSystemProperty {

    private final String name;
    private final String originalValue;

    public JreSystemProperty(String name) {
      this.name = Require.nonNull("Name", name);
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
