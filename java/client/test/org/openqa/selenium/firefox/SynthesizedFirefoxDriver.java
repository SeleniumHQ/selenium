/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.
Copyright 2011 Software Freedom Conservancy

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

import static org.junit.Assert.fail;

import org.openqa.selenium.Build;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.testing.InProject;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.File;
import java.io.IOException;

public class SynthesizedFirefoxDriver extends FirefoxDriver {

  private static boolean runBuild = true;

  public SynthesizedFirefoxDriver() {
    super(createTemporaryProfile());
  }

  public SynthesizedFirefoxDriver(FirefoxProfile profile) throws Exception {
    super(copyExtensionTo(profile));
  }

  public SynthesizedFirefoxDriver(Capabilities capabilities) throws Exception {
    super(tweakCapabilities(capabilities));
  }

  private static Capabilities tweakCapabilities(Capabilities caps)
      throws Exception {
    DesiredCapabilities tweaked = new DesiredCapabilities(caps.asMap());
    if (tweaked.getCapability(PROFILE) == null) {
      tweaked.setCapability(PROFILE, createTemporaryProfile());
    } else {
      try {
        FirefoxProfile profile =
            FirefoxProfile.fromJson((String) tweaked.getCapability(PROFILE));
        copyExtensionTo(profile);
        tweaked.setCapability(PROFILE, profile);
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    }
    return tweaked;
  }

  private static FirefoxProfile createTemporaryProfile() {
    try {
      FirefoxProfile profile = new FirefoxProfile();

      if (Boolean.getBoolean("webdriver.debug")) {
        Firebug.addTo(profile);
      }

      return copyExtensionTo(profile);
    } catch (Exception e) {
      e.printStackTrace();
      fail(e.getMessage());
    }
    return null;
  }

  private static FirefoxProfile copyExtensionTo(FirefoxProfile profile)
      throws Exception {
    File topDir = InProject.locate("Rakefile").getParentFile();
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

