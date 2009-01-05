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

public class FirefoxProfileTest extends TestCase {
    public void testShouldRetainAdditionalPreferencesWhenCopyingAProfile() throws Exception {
        FirefoxProfile profile = new FirefoxProfile();
        profile.setPreference("cheese", true);

        FirefoxProfile copiedProfile = profile.createCopy(8000);


        File prefs = new File(copiedProfile.getProfileDir(), "user.js");
        BufferedReader reader = new BufferedReader(new FileReader(prefs));

        boolean seenCheese = false;
        for (String line = reader.readLine(); line != null && !seenCheese; line = reader.readLine()) {
            if (line.contains("cheese"))
                seenCheese = true;
        }

        assertTrue(seenCheese);
    }
}
