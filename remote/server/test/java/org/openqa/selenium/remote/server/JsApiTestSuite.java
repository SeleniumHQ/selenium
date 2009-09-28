package org.openqa.selenium.remote.server;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import java.io.File;
import java.io.FilenameFilter;
import java.net.URL;
import java.util.logging.Logger;

/**
 * Automated test runner for the JS API.
 * 
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class JsApiTestSuite extends TestCase {

  private static final Logger LOG =
      Logger.getLogger(JsApiTestSuite.class.getName());
  private static final String TEST_PATH = "selenium/tests";

  public static Test suite() throws Exception {
    TestSuite suite = new TestSuite();
    suite.setName(JsApiTestSuite.class.getName());

    JsApiTestServer testServer = new JsApiTestServer();

    FirefoxProfile profile = new FirefoxProfile();
    profile.setEnableNativeEvents(false);  // Native events aren't 100% yet.
    WebDriver driver = new FirefoxDriver();

    LOG.info("Searching for test files");
    File rootDir = JsApiTestServer.getRootDirectory();
    File testsDir = new File(rootDir, TEST_PATH);

    for (File file : testsDir.listFiles(new TestFilenameFilter())) {
      String path = file.getAbsolutePath()
          .replace(rootDir.getAbsolutePath() + File.separator, "");
      URL url = new URL(testServer.whereIs("/remote", path));
      TestCase test = new JsApiTestCase(url, driver);
      LOG.info("Adding test: " + test.getName());
      suite.addTest(test);
    }

    return new JsApiTestSetup(suite, testServer, driver);
  }

  private static class TestFilenameFilter implements FilenameFilter {
    public boolean accept(File dir, String name) {
      return name.endsWith("_test.html");
    }
  }
}
