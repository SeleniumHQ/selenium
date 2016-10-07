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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.io.Zip;
import org.openqa.selenium.testing.InProject;
import org.openqa.selenium.testing.drivers.Firebug;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

@RunWith(JUnit4.class)
public class FirefoxProfileTest {
  private static final String FIREBUG_PATH = "third_party/firebug/firebug-1.5.0-fx.xpi";
  private static final String FIREBUG_RESOURCE_PATH =
      "/org/openqa/selenium/testing/drivers/firebug-1.5.0-fx.xpi";

  private FirefoxProfile profile;

  @Before
  public void setUp() throws Exception {
    profile = new FirefoxProfile();
  }

  @Test
  public void shouldQuoteStringsWhenSettingStringProperties() throws Exception {
    profile.setPreference("cheese", "brie");

    assertPreferenceValueEquals("cheese", "\"brie\"");
  }

  @Test
  public void getStringPreferenceShouldReturnUserSuppliedValueWhenSet() throws Exception {
    String key = "cheese";
    String value = "brie";
    profile.setPreference(key, value);

    String defaultValue = "edam";
    assertEquals(value, profile.getStringPreference(key, defaultValue));
  }

  @Test
  public void getStringPreferenceShouldReturnDefaultValueWhenSet() throws Exception {
    String key = "cheese";

    String defaultValue = "brie";
    assertEquals(defaultValue, profile.getStringPreference(key, defaultValue));
  }

  @Test
  public void shouldSetIntegerPreferences() throws Exception {
    profile.setPreference("cheese", 1234);

    assertPreferenceValueEquals("cheese", 1234);
  }

  @Test
  public void getIntegerPreferenceShouldReturnUserSuppliedValueWhenSet() throws Exception {
    String key = "cheese";
    int value = 1234;
    profile.setPreference(key, value);

    int defaultValue = -42;
    assertEquals(1234, profile.getIntegerPreference(key, defaultValue));
  }

  @Test
  public void getIntegerPreferenceShouldReturnDefaultValueWhenSet() throws Exception {
    String key = "cheese";

    int defaultValue = 42;
    assertEquals(defaultValue, profile.getIntegerPreference(key, defaultValue));
  }

  @Test
  public void shouldSetBooleanPreferences() throws Exception {
    profile.setPreference("cheese", false);

    assertPreferenceValueEquals("cheese", false);
  }

  @Test
  public void getBooleanPreferenceShouldReturnUserSuppliedValueWhenSet() throws Exception {
    String key = "cheese";
    boolean value = true;
    profile.setPreference(key, value);

    boolean defaultValue = false;
    assertEquals(value, profile.getBooleanPreference(key, defaultValue));
  }

  @Test
  public void getBooleanPreferenceShouldReturnDefaultValueWhenSet() throws Exception {
    String key = "cheese";

    boolean defaultValue = true;
    assertEquals(defaultValue, profile.getBooleanPreference(key, defaultValue));
  }

  @Test
  public void shouldSetDefaultPreferences() throws Exception {
    assertPreferenceValueEquals("network.http.phishy-userpass-length", 255);
  }

  @Test

  public void shouldNotResetFrozenPreferences() throws Exception {
    try {
      profile.setPreference("network.http.phishy-userpass-length", 1024);
      fail("Should not be able to reset a frozen preference");
    } catch (IllegalArgumentException ex) {
      // expected
    }

    assertPreferenceValueEquals("network.http.phishy-userpass-length", 255);
  }

  @Test
  public void shouldInstallExtensionFromZip() throws IOException {
    FirefoxProfile profile = new FirefoxProfile();
    profile.addExtension(InProject.locate(FIREBUG_PATH).toFile());
    File profileDir = profile.layoutOnDisk();
    File extensionDir = new File(profileDir, "extensions/firebug@software.joehewitt.com");
    assertTrue(extensionDir.exists());
  }

  @Test
  public void shouldInstallExtensionFromDirectory() throws IOException {
    FirefoxProfile profile = new FirefoxProfile();
    File extension = InProject.locate(FIREBUG_PATH).toFile();
    File unzippedExtension = FileHandler.unzip(new FileInputStream(extension));
    profile.addExtension(unzippedExtension);
    File profileDir = profile.layoutOnDisk();
    File extensionDir = new File(profileDir, "extensions/firebug@software.joehewitt.com");
    assertTrue(extensionDir.exists());
  }

  @Test
  public void shouldInstallExtensionUsingClasspath() throws IOException {
    FirefoxProfile profile = new FirefoxProfile();
    profile.addExtension(Firebug.class, FIREBUG_RESOURCE_PATH);
    File profileDir = profile.layoutOnDisk();
    File extensionDir = new File(profileDir, "extensions/firebug@software.joehewitt.com");
    assertTrue(extensionDir.exists());
  }

  @Test
  public void shouldConvertItselfIntoAMeaningfulRepresentation() throws IOException {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("i.like.cheese", true);

    String json = profile.toJson();

    assertNotNull(json);

    File dir = TemporaryFilesystem.getDefaultTmpFS().createTempDir("webdriver", "duplicated");
    new Zip().unzip(json, dir);

    File prefs = new File(dir, "user.js");
    assertTrue(prefs.exists());

    assertTrue(FileHandler.readAsString(prefs).contains("i.like.cheese"));
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
    assertEquals("http://www.example.com", parsedPrefs.getPreference("browser.startup.homepage"));
  }

  @Test
  public void userPrefsArePreservedWhenConvertingToAndFromJson() throws IOException {
    profile.setPreference("browser.startup.homepage", "http://www.example.com");

    String json = profile.toJson();
    FirefoxProfile rebuilt = FirefoxProfile.fromJson(json);
    Preferences parsedPrefs = parseUserPrefs(rebuilt);

    assertEquals("http://www.example.com", parsedPrefs.getPreference("browser.startup.homepage"));
  }

  @Test
  public void backslashedCharsArePreservedWhenConvertingToAndFromJson() throws IOException {
    String dir = "c:\\aaa\\bbb\\ccc\\ddd\\eee\\fff\\ggg\\hhh\\iii\\jjj\\kkk\\lll\\mmm\\nnn\\ooo\\ppp\\qqq\\rrr\\sss\\ttt\\uuu\\vvv\\www\\xxx\\yyy\\zzz";
    profile.setPreference("browser.download.dir", dir);

    String json = profile.toJson();
    FirefoxProfile rebuilt = FirefoxProfile.fromJson(json);
    Preferences parsedPrefs = parseUserPrefs(rebuilt);

    assertEquals(dir, parsedPrefs.getPreference("browser.download.dir"));
  }

  private void assertPreferenceValueEquals(String key, Object value) throws Exception {
    List<String> props = readGeneratedProperties(profile);
    boolean seenKey = false;
    for (String line : props) {
      if (line.contains(key) && line.contains(", " + value + ")")) {
        seenKey = true;
      }
    }

    assertTrue("Did not see value being set correctly", seenKey);
  }

  private Preferences parseUserPrefs(FirefoxProfile profile) throws IOException {
    File directory = profile.layoutOnDisk();
    File userPrefs = new File(directory, "user.js");
    FileReader reader = new FileReader(userPrefs);
    return new Preferences(new StringReader("{\"mutable\": {}, \"frozen\": {}}"), reader);
  }
}
