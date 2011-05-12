/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.firefox;

import com.google.common.io.Files;
import junit.framework.TestCase;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.hamcrest.Matcher;
import org.hamcrest.Matchers;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.internal.InProject;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.io.Zip;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasEntry;

import com.google.common.collect.ImmutableList;

public class FirefoxProfileTest extends TestCase {

  private static final String FIREBUG_PATH = "third_party/firebug/firebug-1.5.0-fx.xpi";

  private FirefoxProfile profile;
  
  @Override
  protected void setUp() throws Exception {
    super.setUp();

    profile = new FirefoxProfile();
  }

  public void testShouldQuoteStringsWhenSettingStringProperties() throws Exception {
    profile.setPreference("cheese", "brie");

    List<String> props = readGeneratedProperties(profile);
    boolean seenCheese = false;
    for (String line : props) {
      if (line.contains("cheese") && line.contains("\"brie\"")) {
        seenCheese = true;
      }
    }

    assertTrue(seenCheese);
  }

  public void testShouldSetIntegerPreferences() throws Exception {
    profile.setPreference("cheese", 1234);

    List<String> props = readGeneratedProperties(profile);
    boolean seenCheese = false;
    for (String line : props) {
      if (line.contains("cheese") && line.contains(", 1234)")) {
        seenCheese = true;
      }
    }

    assertTrue("Did not see integer value being set correctly", seenCheese);
  }

  public void testManualProxy() throws Exception {
    profile.setProxyPreferences(
        new Proxy()
        .setHttpProxy("foo:123")
        .setFtpProxy("bar:234")
        .setSslProxy("baz:345")
        .setNoProxy("localhost"));
    List<String> prefLines = readGeneratedProperties(profile);
    String prefs = new ArrayList<String>(prefLines).toString();
    assertThat(prefs, containsString("network.proxy.http\", \"foo\""));
    assertThat(prefs, containsString("network.proxy.http_port\", 123"));
    assertThat(prefs, containsString("network.proxy.ftp\", \"bar\""));
    assertThat(prefs, containsString("network.proxy.ftp_port\", 234"));
    assertThat(prefs, containsString("network.proxy.ssl\", \"baz\""));
    assertThat(prefs, containsString("network.proxy.ssl_port\", 345"));
    assertThat(prefs, containsString("network.proxy.no_proxies_on\", \"localhost\""));
    assertThat(prefs, containsString("network.proxy.type\", 1"));
  }
  
  public void testProxyAutoconfigUrl() throws Exception {
    profile.setProxyPreferences(
        new Proxy()
        .setProxyAutoconfigUrl("http://foo/bar.pac"));
    List<String> prefLines = readGeneratedProperties(profile);
    String prefs = new ArrayList<String>(prefLines).toString();
    assertThat(prefs, containsString("network.proxy.autoconfig_url\", \"http://foo/bar.pac\""));
    assertThat(prefs, containsString("network.proxy.type\", 2"));
  }
  
  public void testProxyAutodetect() throws Exception {
    profile.setProxyPreferences(
        new Proxy()
        .setAutodetect(true));
    List<String> prefLines = readGeneratedProperties(profile);
    String prefs = new ArrayList<String>(prefLines).toString();
    assertThat(prefs, containsString("network.proxy.type\", 4"));
  }
  
  public void testShouldSetBooleanPreferences() throws Exception {
    profile.setPreference("cheese", false);

    List<String> props = readGeneratedProperties(profile);
    boolean seenCheese = false;
    for (String line : props) {
      if (line.contains("cheese") && line.contains(", false)")) {
        seenCheese = true;
      }
    }

    assertTrue("Did not see integer value being set correctly", seenCheese);
  }

  public void testShouldInstallExtensionFromZip() throws IOException {
    FirefoxProfile profile = new FirefoxProfile();
    profile.addExtension(InProject.locate(FIREBUG_PATH));
    File profileDir = profile.layoutOnDisk();
    File extensionDir = new File(profileDir, "extensions/firebug@software.joehewitt.com");
    assertTrue(extensionDir.exists());
  }

  public void testShouldInstallExtensionFromDirectory() throws IOException {
    FirefoxProfile profile = new FirefoxProfile();
    File extension = InProject.locate(FIREBUG_PATH);
    File unzippedExtension = FileHandler.unzip(new FileInputStream(extension));
    profile.addExtension(unzippedExtension);
    File profileDir = profile.layoutOnDisk();
    File extensionDir = new File(profileDir, "extensions/firebug@software.joehewitt.com");
    assertTrue(extensionDir.exists());
  }

  public void testShouldInstallExtensionUsingClasspath() throws IOException {
    FirefoxProfile profile = new FirefoxProfile();
    profile.addExtension(FirefoxProfileTest.class, "/resource/firebug-1.5.0-fx.xpi");
    File profileDir = profile.layoutOnDisk();
    File extensionDir = new File(profileDir, "extensions/firebug@software.joehewitt.com");
    assertTrue(extensionDir.exists());
  }

  public void testShouldConvertItselfIntoAMeaningfulRepresentation() throws IOException {
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

  public void testCannotOverrideAFozenPrefence() {
    FirefoxProfile profile = new FirefoxProfile();

    try {
      profile.setPreference("browser.EULA.3.accepted", "foo-bar-baz");
      fail();
    } catch (IllegalArgumentException expected) {
      assertEquals(
          "Preference browser.EULA.3.accepted may not be overridden: frozen value=true, " +
              "requested value=foo-bar-baz",
          expected.getMessage());
    }
  }

  public void testCanOverrideMaxScriptRuntimeIfGreaterThanDefaultValueOrSetToInfinity() {
    FirefoxProfile profile = new FirefoxProfile();

    try {
      profile.setPreference("dom.max_script_run_time", 29);
      fail();
    } catch (IllegalArgumentException expected) {
      assertEquals("dom.max_script_run_time must be == 0 || >= 30", expected.getMessage());
    }

    profile.setPreference("dom.max_script_run_time", 31);
    profile.setPreference("dom.max_script_run_time", 0);
  }

  private List<String> readGeneratedProperties(FirefoxProfile profile) throws Exception {
    File generatedProfile = profile.layoutOnDisk();

    File prefs = new File(generatedProfile, "user.js");
    BufferedReader reader = new BufferedReader(new FileReader(prefs));

    List<String> prefLines = new ArrayList<String>();
    for (String line = reader.readLine(); line != null; line = reader.readLine()) {
      prefLines.add(line);
    }

    return prefLines;
  }

  public void testParsePreferences_boolean() {
    List<String> lines = ImmutableList.of(
        "user_pref(\"extensions.update.notifyUser\", false);");
    Map<String, String> preferenceMap = FirefoxProfile.parsePreferences(lines);
    assertEquals(1, preferenceMap.size());
    assertEquals("false", preferenceMap.get("extensions.update.notifyUser"));
  }

  public void testParsePreferences_integer() {
    List<String> lines = ImmutableList.of(
        "user_pref(\"dom.max_script_run_time\", 30);");
    Map<String, String> preferenceMap = FirefoxProfile.parsePreferences(lines);
    assertEquals(1, preferenceMap.size());
    assertEquals("30", preferenceMap.get("dom.max_script_run_time"));
  }

  public void testParsePreferences_string() {
    String prefWithComma = "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_1 like Mac OS X; en-us) "
        + "AppleWebKit/532.9 (KHTML, like Gecko)";
    String prefWithQuotes = "lpr ${MOZ_PRINTER_NAME:+-P\"$MOZ_PRINTER_NAME\"}";

    List<String> lines = ImmutableList.of(
        "user_pref(\"general.useragent.override\", \"" + prefWithComma + "\");",
        "user_pref(\"print.print_command\", \"" + prefWithQuotes + "\");");
    Map<String, String> preferenceMap = FirefoxProfile.parsePreferences(lines);
    assertEquals(2, preferenceMap.size());
    assertEquals(prefWithComma, preferenceMap.get("general.useragent.override"));
    assertEquals(prefWithQuotes, preferenceMap.get("print.print_command"));
  }

  public void testParsePreferences_multiline() {
    List<String> lines = ImmutableList.of(
        "user_pref(\"extensions.update.notifyUser\", false);",
        "user_pref(\"dom.max_script_run_time\", 30);");
    Map<String, String> preferenceMap = FirefoxProfile.parsePreferences(lines);
    assertEquals(2, preferenceMap.size());
    assertEquals("false", preferenceMap.get("extensions.update.notifyUser"));
    assertEquals("30", preferenceMap.get("dom.max_script_run_time"));
  }

  public void testLayoutOnDiskSetsUserPreferences() throws IOException {
    profile.setPreference("browser.startup.homepage", "http://www.example.com");
    Map<String, String> parsedPrefs = parseUserPrefs(profile);
    assertThat(parsedPrefs, hasEntry("browser.startup.homepage", "http://www.example.com"));
  }

  public void testUserPrefsArePreservedWhenConvertingToAndFromJson() throws IOException {
    profile.setPreference("browser.startup.homepage", "http://www.example.com");

    String json = profile.toJson();
    FirefoxProfile rebuilt = FirefoxProfile.fromJson(json);
    Map<String, String> parsedPrefs = parseUserPrefs(rebuilt);
    assertThat(parsedPrefs, hasEntry("browser.startup.homepage", "http://www.example.com"));
  }

  private static Map<String, String> parseUserPrefs(FirefoxProfile profile) throws IOException {
    File directory = profile.layoutOnDisk();
    File userPrefs = new File(directory, "user.js");
    List<String> lines = Files.readLines(userPrefs, Charset.defaultCharset());
    return FirefoxProfile.parsePreferences(lines);
  }
}
