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

import junit.framework.TestCase;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.List;

public class FirefoxProfileTest extends TestCase {

  private FirefoxProfile profile;

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

  private List<String> readGeneratedProperties(FirefoxProfile profile) throws Exception {
    FirefoxProfile copiedProfile = profile.createCopy(8000);

    File prefs = new File(copiedProfile.getProfileDir(), "user.js");
    BufferedReader reader = new BufferedReader(new FileReader(prefs));

    List<String> prefLines = new ArrayList<String>();
    for (String line = reader.readLine(); line != null; line = reader.readLine()) {
      prefLines.add(line);
    }

    return prefLines;
  }
}
