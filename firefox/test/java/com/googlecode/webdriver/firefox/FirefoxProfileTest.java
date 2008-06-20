package com.googlecode.webdriver.firefox;

import junit.framework.TestCase;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;

public class FirefoxProfileTest extends TestCase {
    public void testShouldRetainAdditionalPreferencesWhenCopyingAProfile() throws Exception {
        FirefoxProfile profile = new FirefoxProfile();
        profile.addAdditionalPreference("cheese", "true");

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
