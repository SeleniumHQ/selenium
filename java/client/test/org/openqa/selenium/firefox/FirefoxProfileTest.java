/*
Copyright 2007-2009 Selenium committers

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

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.io.Zip;
import org.openqa.selenium.testing.InProject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;

public class FirefoxProfileTest {

  private static final String FIREBUG_PATH = "third_party/firebug/firebug-1.5.0-fx.xpi";

  private FirefoxProfile profile;

  @Before
  public void setUp() throws Exception {
    profile = new FirefoxProfile();
  }

  @Test
  public void shouldQuoteStringsWhenSettingStringProperties() throws Exception {
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

  @Test
  public void shouldSetIntegerPreferences() throws Exception {
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

  @Test
  public void manualProxy() throws Exception {
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

  @Test
  public void proxyAutoconfigUrl() throws Exception {
    profile.setProxyPreferences(
        new Proxy()
            .setProxyAutoconfigUrl("http://foo/bar.pac"));
    List<String> prefLines = readGeneratedProperties(profile);
    String prefs = new ArrayList<String>(prefLines).toString();
    assertThat(prefs, containsString("network.proxy.autoconfig_url\", \"http://foo/bar.pac\""));
    assertThat(prefs, containsString("network.proxy.type\", 2"));
  }

  @Test
  public void proxyAutodetect() throws Exception {
    profile.setProxyPreferences(
        new Proxy()
            .setAutodetect(true));
    List<String> prefLines = readGeneratedProperties(profile);
    String prefs = new ArrayList<String>(prefLines).toString();
    assertThat(prefs, containsString("network.proxy.type\", 4"));
  }

  @Test
  public void shouldSetBooleanPreferences() throws Exception {
    profile.setPreference("cheese", false);

    assertPreferenceValueEquals("cheese", false);
  }

  @Test
  public void shouldInstallExtensionFromZip() throws IOException {
    FirefoxProfile profile = new FirefoxProfile();
    profile.addExtension(InProject.locate(FIREBUG_PATH));
    File profileDir = profile.layoutOnDisk();
    File extensionDir = new File(profileDir, "extensions/firebug@software.joehewitt.com");
    assertTrue(extensionDir.exists());
  }

  @Test
  public void shouldInstallExtensionFromDirectory() throws IOException {
    FirefoxProfile profile = new FirefoxProfile();
    File extension = InProject.locate(FIREBUG_PATH);
    File unzippedExtension = FileHandler.unzip(new FileInputStream(extension));
    profile.addExtension(unzippedExtension);
    File profileDir = profile.layoutOnDisk();
    File extensionDir = new File(profileDir, "extensions/firebug@software.joehewitt.com");
    assertTrue(extensionDir.exists());
  }

  @Test
  public void shouldInstallExtensionUsingClasspath() throws IOException {
    FirefoxProfile profile = new FirefoxProfile();
    profile.addExtension(FirefoxProfileTest.class, "/resource/firebug-1.5.0-fx.xpi");
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

    List<String> prefLines = new ArrayList<String>();
    for (String line = reader.readLine(); line != null; line = reader.readLine()) {
      prefLines.add(line);
    }

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
