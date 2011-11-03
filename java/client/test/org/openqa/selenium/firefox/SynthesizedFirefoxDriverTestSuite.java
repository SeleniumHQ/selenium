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
import junit.framework.TestSuite;

import org.openqa.selenium.Build;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Ignore;
import org.openqa.selenium.Platform;
import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.internal.InProject;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.File;
import java.io.IOException;

import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.FIREFOX_SYNTHESIZED;

public class SynthesizedFirefoxDriverTestSuite extends TestCase {
  public static Test suite() throws Exception {
    if (Platform.getCurrent().is(Platform.WINDOWS)) {
      return new TestSuite();
    }

    // System.setProperty("webdriver.development", "true");
    // System.setProperty("webdriver.firefox.useExisting", "true");

    // System.setProperty("webdriver.firefox.bin",
    // "/Applications/Firefox3.app/Contents/MacOS/firefox-bin");
    // System.setProperty("webdriver.firefox.bin",
    // "/Applications/Firefox3_6.app/Contents/MacOS/firefox-bin");
    // System.setProperty("webdriver.firefox.bin",
    // "/Applications/Firefox4.app/Contents/MacOS/firefox-bin");
    // System.setProperty("webdriver.firefox.bin",
    // "/Applications/Firefox5.app/Contents/MacOS/firefox-bin");

    return new TestSuiteBuilder()
        .addSourceDir("java/client/test")
//        .addSourceDir("java/client/test/org/openqa/selenium/firefox") Haven't been running for a while, apparently, and some of them don't pass now...
        .usingDriver(FirefoxDriver.class)
        .exclude(FIREFOX)
        .exclude(FIREFOX_SYNTHESIZED)
        .exclude(Ignore.NativeEventsEnabledState.DISABLED)
        .keepDriverInstance()
        .includeJavascriptTests()
        .create();
  }
}
