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

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

import junit.framework.Test;
import junit.framework.TestCase;

import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.CHROME_NON_WINDOWS;

import org.openqa.selenium.Platform;
import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.FileHandler;
import org.openqa.selenium.internal.TemporaryFilesystem;

public class ChromeDriverTestSuite extends TestCase {
  public static Test suite() throws Exception {
    TestSuiteBuilder builder = new TestSuiteBuilder();
    builder
        .addSourceDir("common")
        .addSourceDir("chrome")
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
    public TestChromeDriver() throws Exception {
      super();
    }
    @Override
    protected void startClient() {
      File extensionSrcDir = FileHandler.locateInProject("chrome/src/extension");
      File extensionDstDir = TemporaryFilesystem.createTempDir("extension", "folder");
      String extensionDst;
      try {
        extensionDst = extensionDstDir.getCanonicalPath();
        extensionDstDir.mkdir();
        for (File file : extensionSrcDir.listFiles()) {
          FileHandler.copy(file, new File(extensionDst, file.getName()));
        }
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
      
      File dllToUse = new File(System.getProperty("webdriver.chrome.extensiondir"),
          "npchromedriver.dll");
      if (System.getProperty("webdriver.chrome.extensiondir") == null ||
          !System.getProperty("webdriver.chrome.extensiondir").equals(extensionDstDir) ||
          !dllToUse.exists()) {
        System.setProperty("webdriver.chrome.extensiondir", extensionDst);
        try {
          copyDll();
        } catch (IOException e) {
          throw new WebDriverException(e);
        }
      }
      super.startClient();
    }

    private void copyDll() throws IOException {
      if (System.getProperty("os.name").startsWith("Windows")) {
        File dllFrom = new File(System.getProperty("user.dir"),
            "../build/Win32/Debug/npchromedriver.dll");
        if (!dllFrom.exists()) {
          throw new FileNotFoundException("Could not find " + dllFrom.getCanonicalFile());
        }
        File dllToUse = new File(System.getProperty("webdriver.chrome.extensiondir"),
            "npchromedriver.dll");
        dllToUse.deleteOnExit();
        FileHandler.copy(dllFrom, dllToUse);
      }
    }
  }
}
