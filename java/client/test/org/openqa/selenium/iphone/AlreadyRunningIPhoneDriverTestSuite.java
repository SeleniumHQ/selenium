package org.openqa.selenium.iphone;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.drivers.Browser;

import java.net.MalformedURLException;
import java.net.URL;

public class AlreadyRunningIPhoneDriverTestSuite extends TestSuite {
  public static Test suite() throws Exception {
    return new TestSuiteBuilder()
        .addSourceDir("java/client/test")
        .using(Browser.iphone)
        .keepDriverInstance()
        .includeJavascriptTests()
        .create();
  }

  // TODO(simon): Hook this into the test suite
  public static class AlreadyRunningIPhoneDriver extends RemoteWebDriver {
    public AlreadyRunningIPhoneDriver() throws MalformedURLException {
      super(new URL("http://localhost:3001/hub"), DesiredCapabilities.iphone());
    }
  }

}
