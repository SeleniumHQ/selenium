/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

package org.openqa.selenium.testing.drivers;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import static org.openqa.selenium.testing.DevMode.isInDevMode;
import static org.openqa.selenium.testing.InProject.locate;

import com.google.common.base.Throwables;
import com.google.common.io.Files;

import org.openqa.selenium.Build;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.File;
import java.io.IOException;

public class SynthesizedFirefoxDriver extends FirefoxDriver {

  private static boolean runBuild = true;

  public SynthesizedFirefoxDriver() {
    super(createTemporaryProfile());
  }

  public SynthesizedFirefoxDriver(FirefoxProfile profile) throws IOException {
    super(copyExtensionTo(profile));
  }

  public SynthesizedFirefoxDriver(Capabilities desiredCapabilities) {
    this(desiredCapabilities, null);
  }
  
  public SynthesizedFirefoxDriver(Capabilities desiredCapabilities, 
      Capabilities requiredCapabilities) {
    super(tweakCapabilities(desiredCapabilities), requiredCapabilities);
  }

  private static Capabilities tweakCapabilities(Capabilities desiredCaps) {
    if (desiredCaps == null) {
      return null;
    }
    DesiredCapabilities tweaked = new DesiredCapabilities(desiredCaps);
    if (tweaked.getCapability(PROFILE) == null) {
      tweaked.setCapability(PROFILE, createTemporaryProfile());
    } else {
      try {
        FirefoxProfile profile;
        if (tweaked.getCapability(PROFILE) instanceof FirefoxProfile) {
          profile = (FirefoxProfile) tweaked.getCapability(PROFILE);
        } else {
          profile = FirefoxProfile.fromJson((String) tweaked.getCapability(PROFILE));
        }
        copyExtensionTo(profile);

        tweaked.setCapability(PROFILE, profile);
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    }
    return tweaked;
  }

  private static FirefoxProfile createTemporaryProfile() {
    if (!isInDevMode()) {
      FirefoxProfile profile = new FirefoxProfile();

      if (Boolean.getBoolean("webdriver.debug")) {
        try {
          Firebug.addTo(profile);
        } catch (IOException e) {
          throw Throwables.propagate(e);
        }
      }

      profile.setEnableNativeEvents(Boolean.getBoolean("selenium.browser.native_events"));

      return profile;
    }

    try {
      File prefs = locate("build/javascript/firefox-driver/webdriver_prefs.json");
      File noFocus = locate("build/cpp/i386/libnoblur.so");
      File ime = locate("build/cpp/i386/libimehandler.so");
      File noFocus64 = locate("build/cpp/amd64/libnoblur64.so");
      File ime64 = locate("build/cpp/amd64/libimehandler64.so");
      File dest = locate("java/client/build/production/org/openqa/selenium/firefox");
      Files.copy(prefs, new File(dest, "webdriver_prefs.json"));

      File libDir = new File(dest, "x86");
      if (!libDir.exists()) {
        assertTrue("Cannot create x86 library directory", libDir.mkdir());
      }
      Files.copy(noFocus, new File(libDir, "x_ignore_nofocus.so"));
      Files.copy(ime, new File(libDir, "libibushandler.so"));

      libDir = new File(dest, "amd64");
      if (!libDir.exists()) {
        assertTrue("Cannot create x86 library directory", libDir.mkdir());
      }
      Files.copy(noFocus64, new File(libDir, "x_ignore_nofocus.so"));
      Files.copy(ime64, new File(libDir, "libibushandler.so"));

      FirefoxProfile profile = new FirefoxProfile();

      if (Boolean.getBoolean("webdriver.debug")) {
        Firebug.addTo(profile);
      }

      profile.setEnableNativeEvents(Boolean.getBoolean("selenium.browser.native_events"));
      profile.setPreference("webdriver.log.file", "/dev/stdout");

      return copyExtensionTo(profile);
    } catch (Exception e) {
      e.printStackTrace();
      fail(e.getMessage());
    }
    return null;
  }

  private static FirefoxProfile copyExtensionTo(FirefoxProfile profile) throws IOException {
    File topDir = locate("Rakefile").getParentFile();
    File ext = new File(topDir,
        "build/javascript/firefox-driver/webdriver.xpi");
    if (!ext.exists() || runBuild) {
      ext.delete();
      new Build().of("//javascript/firefox-driver:webdriver").go();
      runBuild = false;
    }
    profile.addExtension(ext);
    return profile;
  }
}

