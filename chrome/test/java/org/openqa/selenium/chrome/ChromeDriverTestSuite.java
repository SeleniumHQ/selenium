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
import org.openqa.selenium.Platform;
import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.FileHandler;
import org.openqa.selenium.internal.TemporaryFilesystem;

import junit.framework.Assert;
import junit.framework.Test;
import junit.framework.TestCase;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

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
      super(new ChromeProfile(), createExtension());
    }

    private static ChromeExtension createExtension() {
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
          !System.getProperty("webdriver.chrome.extensiondir").equals(extensionDstDir.getAbsolutePath()) ||
          !dllToUse.exists()) {
        System.setProperty("webdriver.chrome.extensiondir", extensionDst);
        try {
          copyDll();
        } catch (IOException e) {
          throw new WebDriverException(e);
        }
      }
      return new ChromeExtension(extensionDstDir);
    }

    private static void copyDll() throws IOException {
      if (System.getProperty("os.name").startsWith("Windows")) {
        File topLevel = locateTopLevelProjectDirectory();
        File dllFrom = new File(System.getProperty("user.dir"),
            topLevel.getAbsolutePath() + "/build/Win32/Debug/npchromedriver.dll");
        if (!dllFrom.exists()) {
          // Fall back to the prebuilt, if possible
          dllFrom = new File(topLevel, "chrome/prebuilt/Win32/Release/npchromedriver.dll");
          if (!dllFrom.exists())
            throw new FileNotFoundException("Could not find " + dllFrom.getCanonicalFile());
          System.out.println("Falling back to prebuilt chrome DLL");
        }
        File dllToUse = new File(System.getProperty("webdriver.chrome.extensiondir"),
            "npchromedriver.dll");
        dllToUse.deleteOnExit();
        FileHandler.copy(dllFrom, dllToUse);
      }
    }

    private static File locateTopLevelProjectDirectory() {
      File dir = new File(".").getAbsoluteFile();
      do {
        File rakefile = new File(dir, "Rakefile");
        if (rakefile.exists()) {
          return dir;
        }
        dir = dir.getParentFile();
      } while (dir != null);

      Assert.fail("Cannot locate top-level directory");
      return null;
    }
  }
}
