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

package org.openqa.selenium.ie;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Platform.WINDOWS;

import org.openqa.selenium.EmptyTest;
import org.openqa.selenium.Platform;
import org.openqa.selenium.TestSuiteBuilder;

public class InternetExplorerDriverTestSuite extends TestCase {
  public static Test suite() throws Exception {
    System.setProperty("webdriver.development", "true");
    String arch = System.getProperty("os.arch").toLowerCase() + "/";
    if (arch.contains("64")) {
      System.setProperty("jna.library.path", "..\\build\\x64\\Debug;build\\x64\\Debug");
    } else {
      System.setProperty("jna.library.path", "..\\build\\Win32\\Debug;build\\Win32\\Debug");
    }

    if (Platform.getCurrent().is(WINDOWS)) {
      return new TestSuiteBuilder()
          .addSourceDir("common")
          .addSourceDir("jobbie")
          .usingDriver(InternetExplorerDriver.class)
          .exclude(IE)
          .includeJavascriptTests()
          .keepDriverInstance()
          .create();
    }

    TestSuite toReturn = new TestSuite();
    toReturn.addTestSuite(EmptyTest.class);
    return toReturn;
  }
}
