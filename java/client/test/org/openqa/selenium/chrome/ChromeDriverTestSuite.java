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

package org.openqa.selenium.chrome;

import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.CHROME_NON_WINDOWS;

import org.openqa.selenium.Build;
import org.openqa.selenium.Platform;
import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.internal.InProject;

import junit.framework.Test;
import junit.framework.TestCase;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

public class ChromeDriverTestSuite extends TestCase {
  private static boolean runBuild = true;

  public static Test suite() throws Exception {
    TestSuiteBuilder builder = new TestSuiteBuilder();
    builder
        .addSourceDir("java/client/test")
        .exclude(CHROME)
        .usingDriver(ChromeDriver.class)
        .includeJavascriptTests()
        .keepDriverInstance();
    
    if (!Platform.getCurrent().is(Platform.WINDOWS)) {
      builder.exclude(CHROME_NON_WINDOWS);
    }
    
    return builder.create();
  }
  
  public static class TestChromeDriver extends ChromeDriver {
    public TestChromeDriver() {
      super(new ChromeProfile(), createExtension());
    }

    private static ChromeExtension createExtension() {
      File topDir = InProject.locate("Rakefile").getParentFile();
      File ext = new File(topDir, "build/chrome/chrome-extension.zip");
      if (!ext.exists() || runBuild) {
        ext.delete();
        new Build().of("//chrome:chrome_extension").go();
        runBuild = false;
      }

      File profileDir = null;
      try {
        FileInputStream stream = new FileInputStream(ext);
        profileDir = FileHandler.unzip(stream);
      } catch (FileNotFoundException e) {
        throw new WebDriverException(e);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }

      return new ChromeExtension(profileDir);
    }
  }
}
