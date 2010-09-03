package org.openqa.selenium;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import java.io.File;

import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.internal.InProject;

public class WebDriverFragmentsTestSuite {
  public static Test suite() {
    TestSuite suite = new TestSuite();

    File testDir = InProject.locate("common/test/js/webdriver");

     for (File file : testDir.listFiles(new TestSuiteBuilder.TestFilenameFilter())) {
      String path = file.getAbsolutePath()
          .replace(testDir.getAbsolutePath() + File.separator, "")
          .replace(File.separator, "/");
      TestCase test = new JsApiTestCase("/js/test/webdriver/" + path);
      suite.addTest(new DriverTestDecorator(test, FirefoxDriver.class,
          /*keepDriver=*/true, /*freshDriver=*/false, /*refreshDriver=*/false));
    }

    return new EnvironmentStarter(suite);
  }
}
