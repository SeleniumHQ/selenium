package org.openqa.selenium.safari;


import static org.junit.Assert.assertEquals;
import static org.junit.Assume.assumeTrue;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class TechnologyPreviewTest extends JUnit4TestBase {

  @Before
  public void checkTechnologyPreviewInstalled() {
    Path driverShim =
      Paths.get("/Applications/Safari Technology Preview.app/Contents/MacOS/safaridriver");
    assumeTrue("Technology Preview not installed", Files.exists(driverShim));
  }

  @Test
  public void canStartTechnologyPreview() {
    SafariOptions options = new SafariOptions();
    options.setUseTechnologyPreview(true);

    WebDriver driver = new SafariDriver(options);

    driver.get(pages.xhtmlTestPage);
    assertEquals("XHTML Test Page", driver.getTitle());
  }

}
