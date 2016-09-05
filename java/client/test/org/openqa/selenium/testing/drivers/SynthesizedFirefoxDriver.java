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

package org.openqa.selenium.testing.drivers;

import static org.junit.Assert.fail;
import static org.openqa.selenium.testing.DevMode.isInDevMode;

import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.BuckBuild;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.DevMode;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;

public class SynthesizedFirefoxDriver extends FirefoxDriver {

  private static boolean runBuild = true;
  private static File cachedExt = null;

  public SynthesizedFirefoxDriver() {
    this(new DesiredCapabilities(), new DesiredCapabilities());
  }

  public SynthesizedFirefoxDriver(FirefoxProfile profile) throws IOException {
    this(new DesiredCapabilities(ImmutableMap.of(PROFILE, profile)), new DesiredCapabilities());
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
      FirefoxProfile profile = new CustomProfile();

      if (Boolean.getBoolean("webdriver.debug")) {
        try {
          Firebug.addTo(profile);
        } catch (IOException e) {
          throw new RuntimeException(e);
        }
      }

      profile.setEnableNativeEvents(Boolean.getBoolean("selenium.browser.native_events"));

      return profile;
    }

    try {
      FirefoxProfile profile = new CustomProfile();
      if (Boolean.getBoolean("webdriver.debug")) {

        Firebug.addTo(profile);
      }

      profile.setEnableNativeEvents(Boolean.getBoolean("selenium.browser.native_events"));
      profile.setPreference("webdriver.log.file", "/dev/stdout");

      return copyExtensionTo(profile);
    } catch (IOException e) {
      e.printStackTrace();
      throw new RuntimeException(e);
    }
  }

  private static FirefoxProfile copyExtensionTo(FirefoxProfile profile) throws IOException {
    // Look for the xpi as a resource first.
    URL resource = FirefoxDriver.class.getResource("/org/openqa/selenium/firefox/webdriver.xpi");
    File ext;
    if (resource != null || !DevMode.isInDevMode()) {
      Path path = Files.createTempFile("syn-firefox", ".xpi");
      ext = path.toFile();
      ext.deleteOnExit();
      try (InputStream is = resource.openStream()) {
        Files.copy(is, path);
      }
    } else if (runBuild) {
      Path output = new BuckBuild().of("//javascript/firefox-driver:webdriver").go();
      ext = output.toFile();
      cachedExt = ext;
      runBuild = false;
    } else {
      ext = cachedExt;
    }

    if (ext == null) {
      throw new RuntimeException("Cannot compile firefox extension");
    }

    profile.addExtension(ext);
    return profile;
  }

  private static class CustomProfile extends FirefoxProfile {

    private static Path prefs;

    @Override
    protected Reader onlyOverrideThisIfYouKnowWhatYouAreDoing() {
      try {
        return super.onlyOverrideThisIfYouKnowWhatYouAreDoing();
      } catch (RuntimeException e) {
        if (!DevMode.isInDevMode()) {
          throw e;
        }
      }

      prefs = actuallyGetPrefsPath();

      try {
        return Files.newBufferedReader(prefs);
      } catch (IOException e) {
        fail(Throwables.getStackTraceAsString(e));
        throw new RuntimeException(e);
      }
    }

    private Path actuallyGetPrefsPath() {
      if (prefs != null) {
        return prefs;
      }

      synchronized (CustomProfile.class) {
        if (prefs == null) {
          try {
            prefs = new BuckBuild().of("//javascript/firefox-driver:webdriver_prefs").go();
          } catch (IOException ioe) {
            throw new WebDriverException(ioe);
          }
        }
      }

      return prefs;
    }
  }
}

