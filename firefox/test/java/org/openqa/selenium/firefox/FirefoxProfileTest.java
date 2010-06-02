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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import junit.framework.TestCase;

import org.openqa.selenium.Proxy;
import org.openqa.selenium.internal.FileHandler;

public class FirefoxProfileTest extends TestCase {

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

  public void testShouldConvertItselfIntoAMeaningfulRepresentation() throws IOException {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("i.like.cheese", true);

    String json = profile.toJson();

    assertNotNull(json);

    FirefoxProfile recovered = FirefoxProfile.fromJson(json);

    File prefs = new File(recovered.getProfileDir(), "user.js");
    assertTrue(prefs.exists());
    
    assertTrue(FileHandler.readAsString(prefs).contains("i.like.cheese"));
  }

  private List<String> readGeneratedProperties(FirefoxProfile profile) throws Exception {
    profile.updateUserPrefs();

    File prefs = new File(profile.getProfileDir(), "user.js");
    BufferedReader reader = new BufferedReader(new FileReader(prefs));

    List<String> prefLines = new ArrayList<String>();
    for (String line = reader.readLine(); line != null; line = reader.readLine()) {
      prefLines.add(line);
    }

    return prefLines;
  }
}
