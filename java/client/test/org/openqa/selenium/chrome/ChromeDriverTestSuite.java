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

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import org.openqa.selenium.TestSuiteBuilder;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

public class ChromeDriverTestSuite extends TestCase {
  private static ChromeDriverService chromeDriverService;

  public static Test suite() throws Exception {
    try {
      chromeDriverService = ChromeDriverService.createDefaultService();
    } catch (Throwable t) {
      return new InitializationError(t);
    }

    Test rawTest = new TestSuiteBuilder()
        .addSourceDir("java/client/test")
        .exclude(CHROME)
        .usingDriver(DriverForTest.class)
        .includeJavascriptTests()
        .keepDriverInstance()
        .restrictToPackage("org.openqa.selenium")
        .create();

    TestSuite suite = new TestSuite();
    suite.addTest(new ServiceStarter(rawTest));
    return suite;
  }

  /**
   * Customized RemoteWebDriver that will communicate with a service that
   * lives and dies with the entire test suite. We do not use
   * {@link ChromeDriver} since that starts and stops the service with
   * each instance (and that is too expensive for our purposes).
   */
  public static class DriverForTest extends RemoteWebDriver {
    public DriverForTest() {
      super(chromeDriverService.getUrl(), DesiredCapabilities.chrome());
    }
  }

  private static class ServiceStarter extends TestSetup {

    public ServiceStarter(Test test) {
      super(test);
    }

    @Override
    protected void setUp() throws Exception {
      super.setUp();
      chromeDriverService.start();
    }

    @Override
    protected void tearDown() throws Exception {
      chromeDriverService.stop();
      super.tearDown();
    }
  }

  private static class InitializationError extends TestCase {
    private final Throwable t;

    public InitializationError(Throwable t) {
      this.t = t;
    }

    @Override
    protected void runTest() throws Throwable {
      throw t;
    }
  }

}
