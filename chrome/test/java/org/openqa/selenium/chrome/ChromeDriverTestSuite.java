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
import java.io.IOException;

import junit.framework.Test;
import junit.framework.TestCase;

import static org.openqa.selenium.Ignore.Driver.CHROME;
import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.internal.FileHandler;

public class ChromeDriverTestSuite extends TestCase {
  public static Test suite() throws Exception {
    return new TestSuiteBuilder()
        .addSourceDir("common")
        .addSourceDir("chrome")
        .usingDriver(ChromeDriver.class)
        .exclude(CHROME)
        .includeJavascriptTests()
        .keepDriverInstance()
        .create();
  }
  
  public static class TestChromeDriver extends ChromeDriver {
    public TestChromeDriver() throws Exception {
      super();
    }
    @Override
    protected void startClient() {
      String extensionDir = System.getProperty("user.dir") + "/src/extension";
      System.setProperty("webdriver.chrome.extensiondir", extensionDir);
      try {
        copyDll();
      } catch (IOException e) {
        //TODO(danielwh): Uncomment this when the browser doesn't crash
        //throw new RuntimeException(e);
      }
      super.startClient();
    }
    
    private void copyDll() throws IOException {
      File dllFrom = new File(System.getProperty("user.dir"),
          "../build/Win32/Release/npwebdriver.dll");
      File dllToUse = new File(System.getProperty("webdriver.chrome.extensiondir"),
          "npwebdriver.dll");
      dllToUse.deleteOnExit();
      FileHandler.copy(dllFrom, dllToUse);
    }
  }
}
