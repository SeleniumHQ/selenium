/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

package org.openqa.selenium.javascript;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import com.google.common.base.Throwables;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import org.openqa.selenium.DriverTestDecorator;
import org.openqa.selenium.EnvironmentStarter;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.InProject;

import java.io.File;

public class ClosureTestSuite {

  public static Test suite() {
    TestSuite suite = new TestSuite();

    String testDirName = System.getProperty("js.test.dir");
    assertNotNull("You must set the test directory name", testDirName);

    File testDir = InProject.locate(testDirName);
    assertTrue("Test directory does not exist: " + testDirName, testDir.exists());

    String urlPath = System.getProperty("js.test.url.path");
    assertNotNull("You must set the url path to use", urlPath);
    if (!urlPath.endsWith("/")) {
      urlPath += "/";
    }

    String className = System.getProperty("selenium.browser", "org.openqa.selenium.firefox.FirefoxDriver");
    Class<? extends WebDriver> driverClazz = getDriverClass(className);

    for (File file : testDir.listFiles(new TestFilenameFilter())) {
      String path = file.getAbsolutePath()
          .replace(testDir.getAbsolutePath() + File.separator, "")
          .replace(File.separator, "/");
      TestCase test = new JsApiTestCase(urlPath + path);
      suite.addTest(new DriverTestDecorator(test, driverClazz,
          /*keepDriver=*/true, /*freshDriver=*/false, /*refreshDriver=*/false));
    }

    return new EnvironmentStarter(suite);
  }

  private static Class<? extends WebDriver> getDriverClass(String name) {
    try {
      return Class.forName(name).asSubclass(WebDriver.class);
    } catch (ClassNotFoundException e) {
      throw Throwables.propagate(e);
    }
  }
}
