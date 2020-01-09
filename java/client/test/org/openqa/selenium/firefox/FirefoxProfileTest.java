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
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.io.Zip;
import org.openqa.selenium.build.InProject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.StringReader;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class FirefoxProfileTest {
  private static final String FIREBUG_PATH = "third_party/firebug/firebug-1.5.0-fx.xpi";
  private static final String FIREBUG_RESOURCE_PATH =
      "/org/openqa/selenium/firefox/firebug-1.5.0-fx.xpi";
  private static final String MOOLTIPASS_PATH = "third_party/firebug/mooltipass-1.1.87.xpi";

  private FirefoxProfile profile;

  @Before
  public void setUp() {
    profile = new FirefoxProfile();
  }

  @Test
  public void shouldQuoteStringsWhenSettingStringProperties() throws Exception {
    profile.setPreference("cheese", "brie");

    assertPreferenceValueEquals("cheese", "\"brie\"");
  }

  @Test
  public void getStringPreferenceShouldReturnUserSuppliedValueWhenSet() {
    String key = "cheese";
    String value = "brie";
    profile.setPreference(key, value);

    String defaultValue = "edam";
    assertThat(profile.getStringPreference(key, defaultValue)).isEqualTo(value);
  }

  @Test
  public void getStringPreferenceShouldReturnDefaultValueWhenSet() {
    String key = "cheese";

    String defaultValue = "brie";
    assertThat(profile.getStringPreference(key, defaultValue)).isEqualTo(defaultValue);
  }

  @Test
  public void shouldSetIntegerPreferences() throws Exception {
    profile.setPreference("cheese", 1234);

    assertPreferenceValueEquals("cheese", 1234);
  }

  @Test
  public void getIntegerPreferenceShouldReturnUserSuppliedValueWhenSet() {
    String key = "cheese";
    int value = 1234;
    profile.setPreference(key, value);

    int defaultValue = -42;
    assertThat(profile.getIntegerPreference(key, defaultValue)).isEqualTo(1234);
  }

  @Test
  public void getIntegerPreferenceShouldReturnDefaultValueWhenSet() {
    String key = "cheese";

    int defaultValue = 42;
    assertThat(profile.getIntegerPreference(key, defaultValue)).isEqualTo(defaultValue);
  }

  @Test
  public void shouldSetBooleanPreferences() throws Exception {
    profile.setPreference("cheese", false);

    assertPreferenceValueEquals("cheese", false);
  }

  @Test
  public void getBooleanPreferenceShouldReturnUserSuppliedValueWhenSet() {
    String key = "cheese";
    boolean value = true;
    profile.setPreference(key, value);

    boolean defaultValue = false;
    assertThat(profile.getBooleanPreference(key, defaultValue)).isEqualTo(value);
  }

  @Test
  public void getBooleanPreferenceShouldReturnDefaultValueWhenSet() {
    String key = "cheese";

    boolean defaultValue = true;
    assertThat(profile.getBooleanPreference(key, defaultValue)).isEqualTo(defaultValue);
  }

  @Test
  public void shouldSetDefaultPreferences() throws Exception {
    assertPreferenceValueEquals("network.http.phishy-userpass-length", 255);
  }

  @Test
  public void shouldAllowSettingFrozenPreferences() throws Exception {
    profile.setPreference("network.http.phishy-userpass-length", 1024);
    assertPreferenceValueEquals("network.http.phishy-userpass-length", 1024);
  }

  @Test
  public void shouldAllowCheckingForChangesInFrozenPreferences() {
    profile.setPreference("network.http.phishy-userpass-length", 1024);
    assertThatExceptionOfType(IllegalStateException.class).isThrownBy(
        () -> profile.checkForChangesInFrozenPreferences()
    ).withMessageContaining("network.http.phishy-userpass-length");
  }

  @Test
  public void shouldInstallExtensionFromZip() {
    profile.addExtension(InProject.locate(FIREBUG_PATH).toFile());
    File profileDir = profile.layoutOnDisk();
    File extensionFile = new File(profileDir, "extensions/firebug@software.joehewitt.com.xpi");
    assertThat(extensionFile).exists().isFile();
  }

  @Test
  public void shouldInstallWebExtensionFromZip() {
    profile.addExtension(InProject.locate(MOOLTIPASS_PATH).toFile());
    File profileDir = profile.layoutOnDisk();
    File extensionFile = new File(profileDir, "extensions/MooltipassExtension@1.1.87.xpi");
    assertThat(extensionFile).exists().isFile();
  }

  @Test
  public void shouldInstallExtensionFromDirectory() throws IOException {
    File extension = InProject.locate(FIREBUG_PATH).toFile();
    File unzippedExtension = Zip.unzipToTempDir(new FileInputStream(extension), "unzip", "stream");
    profile.addExtension(unzippedExtension);
    File profileDir = profile.layoutOnDisk();
    File extensionDir = new File(profileDir, "extensions/firebug@software.joehewitt.com");
    assertThat(extensionDir).exists().isDirectory();
  }

  @Test
  public void shouldInstallWebExtensionFromDirectory() throws IOException {
    File extension = InProject.locate(MOOLTIPASS_PATH).toFile();
    File unzippedExtension = Zip.unzipToTempDir(new FileInputStream(extension), "unzip", "stream");
    profile.addExtension(unzippedExtension);
    File profileDir = profile.layoutOnDisk();
    File extensionDir = new File(profileDir, "extensions/MooltipassExtension@1.1.87");
    assertThat(extensionDir).exists();
  }

  @Test
  public void shouldInstallExtensionUsingClasspath() {
    profile.addExtension(FirefoxProfileTest.class, FIREBUG_RESOURCE_PATH);
    File profileDir = profile.layoutOnDisk();
    File extensionDir = new File(profileDir, "extensions/firebug@software.joehewitt.com.xpi");
    assertThat(extensionDir).exists();
  }

  @Test
  public void convertingToJsonShouldNotPolluteTempDir() throws IOException {
    File sysTemp = new File(System.getProperty("java.io.tmpdir"));
    Set<String> before = Arrays.stream(sysTemp.list())
        .filter(f -> f.endsWith("webdriver-profile")).collect(Collectors.toSet());
    assertThat(profile.toJson()).isNotNull();
    Set<String> after = Arrays.stream(sysTemp.list())
        .filter(f -> f.endsWith("webdriver-profile")).collect(Collectors.toSet());
    assertThat(after).isEqualTo(before);
  }

  @Test
  public void shouldConvertItselfIntoAMeaningfulRepresentation() throws IOException {
    profile.setPreference("i.like.cheese", true);

    String json = profile.toJson();

    assertThat(json).isNotNull();

    File dir = Zip.unzipToTempDir(json, "webdriver", "duplicated");

    File prefs = new File(dir, "user.js");
    assertThat(prefs.exists()).isTrue();

    try (Stream<String> lines = Files.lines(prefs.toPath())) {
      assertThat(lines.anyMatch(s -> s.contains("i.like.cheese"))).isTrue();
    }

    FileHandler.delete(dir);
  }

  private List<String> readGeneratedProperties(FirefoxProfile profile) throws Exception {
    File generatedProfile = profile.layoutOnDisk();

    File prefs = new File(generatedProfile, "user.js");
    BufferedReader reader = new BufferedReader(new FileReader(prefs));

    List<String> prefLines = new ArrayList<>();
    for (String line = reader.readLine(); line != null; line = reader.readLine()) {
      prefLines.add(line);
    }

    reader.close();

    return prefLines;
  }

  @Test
  public void layoutOnDiskSetsUserPreferences() throws IOException {
    profile.setPreference("browser.startup.homepage", "http://www.example.com");
    Preferences parsedPrefs = parseUserPrefs(profile);
    assertThat(parsedPrefs.getPreference("browser.startup.homepage"))
        .isEqualTo("http://www.example.com");
  }

  @Test
  public void userPrefsArePreservedWhenConvertingToAndFromJson() throws IOException {
    profile.setPreference("browser.startup.homepage", "http://www.example.com");

    String json = profile.toJson();
    FirefoxProfile rebuilt = FirefoxProfile.fromJson(json);
    Preferences parsedPrefs = parseUserPrefs(rebuilt);

    assertThat(parsedPrefs.getPreference("browser.startup.homepage"))
        .isEqualTo("http://www.example.com");
  }

  @Test
  public void backslashedCharsArePreservedWhenConvertingToAndFromJson() throws IOException {
    String dir = "c:\\aaa\\bbb\\ccc\\ddd\\eee\\fff\\ggg\\hhh\\iii\\jjj\\kkk\\lll\\mmm\\nnn\\ooo\\ppp\\qqq\\rrr\\sss\\ttt\\uuu\\vvv\\www\\xxx\\yyy\\zzz";
    profile.setPreference("browser.download.dir", dir);

    String json = profile.toJson();
    FirefoxProfile rebuilt = FirefoxProfile.fromJson(json);
    Preferences parsedPrefs = parseUserPrefs(rebuilt);

    assertThat(parsedPrefs.getPreference("browser.download.dir")).isEqualTo(dir);
  }

  private void assertPreferenceValueEquals(String key, Object value) throws Exception {
    List<String> props = readGeneratedProperties(profile);
    assertThat(props.stream().anyMatch(line -> line.contains(key) && line.contains(", " + value + ")"))).isTrue();
  }

  private Preferences parseUserPrefs(FirefoxProfile profile) throws IOException {
    File directory = profile.layoutOnDisk();
    File userPrefs = new File(directory, "user.js");
    FileReader reader = new FileReader(userPrefs);
    return new Preferences(new StringReader("{\"mutable\": {}, \"frozen\": {}}"), reader);
  }
}
