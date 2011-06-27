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

import junit.framework.Test;
import junit.framework.TestCase;

import java.io.File;
import java.io.IOException;
import org.openqa.selenium.Build;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.internal.InProject;
import org.openqa.selenium.remote.DesiredCapabilities;

import static org.openqa.selenium.Ignore.Driver.FIREFOX;

public class FirefoxDriverTestSuite extends TestCase {
  private static boolean runBuild = true;

  public static Test suite() throws Exception {

//    System.setProperty("webdriver.development", "true");
//  System.setProperty("webdriver.firefox.useExisting", "true");

//    System.setProperty("webdriver.firefox.bin", "/Applications/Firefox3.app/Contents/MacOS/firefox-bin");
//    System.setProperty("webdriver.firefox.bin", "/Applications/Firefox3_6.app/Contents/MacOS/firefox-bin");
//    System.setProperty("webdriver.firefox.bin", "/Applications/Firefox4.app/Contents/MacOS/firefox-bin");
//    System.setProperty("webdriver.firefox.bin", "/Applications/Firefox5.app/Contents/MacOS/firefox-bin");

    return new TestSuiteBuilder()
        .addSourceDir("java/client/test")
        .usingDriver(FirefoxDriver.class)
        .exclude(FIREFOX)
        .keepDriverInstance()
        .includeJavascriptTests()
        .create();
  }

  public static class TestFirefoxDriver extends FirefoxDriver {
    public TestFirefoxDriver() {
      super(createTemporaryProfile());
    }

    public TestFirefoxDriver(FirefoxProfile profile) throws Exception {
      super(copyExtensionTo(profile));
    }

    public TestFirefoxDriver(Capabilities capabilities) throws Exception {
      super(tweakCapabilities(capabilities));
    }

    private static Capabilities tweakCapabilities(Capabilities caps) throws Exception {
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
          File firebug = InProject.locate("third_party/firebug/firebug-1.5.0-fx.xpi");
          profile.addExtension(firebug);
        }

        return copyExtensionTo(profile);
      } catch (Exception e) {
        e.printStackTrace();
        fail(e.getMessage());
      }
      return null;
    }

    private static FirefoxProfile copyExtensionTo(FirefoxProfile profile) throws Exception {
      File topDir = InProject.locate("Rakefile").getParentFile();
      File ext = new File(topDir, "build/javascript/firefox-driver/webdriver.xpi");
      if (!ext.exists() || runBuild) {
        ext.delete();
        new Build().of("//javascript/firefox-driver:webdriver").go();
        runBuild = false;
      }
      profile.addExtension(ext);
      return profile;
    }
  }
}
