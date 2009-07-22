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

import static org.openqa.selenium.Ignore.Driver.FIREFOX;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestListener;
import junit.framework.AssertionFailedError;
import junit.framework.TestSuite;
import junit.framework.TestResult;
import junit.extensions.TestDecorator;

import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.internal.TemporaryFilesystem;
import org.openqa.selenium.internal.FileHandler;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

public class FirefoxDriverTestSuite extends TestCase {
  public static Test suite() throws Exception {

    System.setProperty("webdriver.development", "true");
//  System.setProperty("webdriver.firefox.useExisting", "true");
    
    return new TestSuiteBuilder()
        .addSourceDir("firefox")
        .addSourceDir("common")
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

    private static FirefoxProfile createTemporaryProfile() {
      // Locate the extension directory
      File extensionSource = locate("firefox/src/extension");
      File dir = TemporaryFilesystem.createTempDir("firefoxdriver", "");
      File extension = new File(dir, "extensions/fxdriver@googlecode.com");

      try {
        if (!extension.mkdirs()) {
          throw new RuntimeException("Unable to create temp directory for webdriver extension");
        }
        FileHandler.copy(extensionSource, extension);
      } catch (IOException e) {
        throw new RuntimeException("Cannot copy extension directory");
      }

      File buildDir = locate("build/Win32");

      // Copy in the native events library/libraries
      Map<String, String> fromTo = new HashMap<String, String>();
      fromTo.put("Debug/webdriver-firefox.dll",
          "platform/WINNT_x86-msvc/components/webdriver-firefox.dll");
      
      fromTo.put("../linux64/Release/libwebdriver-firefox.so",
          "platform/Linux/components/libwebdriver-firefox.so");

      // We know the location of the "from" in relation to the extension source
      for (Map.Entry<String, String> entry : fromTo.entrySet()) {
        File source = new File(buildDir, entry.getKey());
        if (!source.exists()) {
          System.out.println("File does not exist. Skipping: " + source);
          continue;
        }
        File dest = new File(extension, entry.getValue());
        dest.getParentFile().mkdirs(); // Ignore the return code, cos we're about to throw an exception
        try {
          FileHandler.copy(source, dest);
        } catch (IOException e) {
          throw new RuntimeException(e);
        }
      }

      File xpt = locate("firefox/build/extension/components/nsINativeEvents.xpt");
      File outXpt = new File(extension, "components/nsINativeEvents.xpt");

      try {
        if (xpt.exists()) {
          FileHandler.copy(xpt, outXpt);
        }
      } catch (IOException e) {
        throw new RuntimeException(e);
      }

      return new FirefoxProfile(dir);
    }

    private static File locate(String path) {
      // It'll be one of these. Probably
      String[] locations = {
        "../",  // IDEA
        ".",     // Eclipse
      };

      for (String location : locations) {
        File file = new File(location, path);
        if (file.exists()) {
          return file;
        }
      }

      // we know that this doesn't exist
      return new File(locations[0], path);
    }
  }
}
