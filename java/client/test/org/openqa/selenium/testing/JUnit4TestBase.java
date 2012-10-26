/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

package org.openqa.selenium.testing;

import java.util.logging.Logger;

import org.junit.Before;
import org.junit.Rule;
import org.junit.rules.TestRule;
import org.junit.rules.TestWatcher;
import org.junit.runner.Description;
import org.junit.runner.RunWith;
import org.openqa.selenium.Pages;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.core.IsNot.not;
import static org.junit.Assert.assertThat;

@RunWith(SeleniumTestRunner.class)
public abstract class JUnit4TestBase implements WrapsDriver {

  private static final Logger logger = Logger.getLogger(JUnit4TestBase.class.getName());

  protected TestEnvironment environment;
  protected AppServer appServer;
  protected Pages pages;
  private static ThreadLocal<WebDriver> storedDriver = new ThreadLocal<WebDriver>();
  protected WebDriver driver;

  @Before
  public void prepareEnvironment() throws Exception {
    environment = GlobalTestEnvironment.get(InProcessTestEnvironment.class);
    appServer = environment.getAppServer();

    pages = new Pages(appServer);

    String hostName = environment.getAppServer().getHostName();
    String alternateHostName = environment.getAppServer().getAlternateHostName();

    assertThat(hostName, is(not(equalTo(alternateHostName))));
  }

  @Before
  public void createDriver() throws Exception {
    driver = actuallyCreateDriver();
  }

  @Rule
  public TestRule traceMethodName = new TestWatcher() {
    @Override
    protected void starting(Description description) {
      super.starting(description);
      logger.info(">>> Starting " + description);
    }

    @Override
    protected void finished(Description description) {
      super.finished(description);
      logger.info("<<< Finished " + description);
    }
  };
  
  public WebDriver getWrappedDriver() {
    return storedDriver.get();
  }

  public static WebDriver actuallyCreateDriver() {
    WebDriver driver = storedDriver.get();

    if (driver == null) {
      driver = new WebDriverBuilder().get();
      storedDriver.set(driver);
    }
    return storedDriver.get();
  }

  public static void removeDriver() {
    if (Boolean.getBoolean("webdriver.singletestsuite.leaverunning")) {
      return;
    }

    WebDriver current = storedDriver.get();

    if (current == null) {
      return;
    }

    try {
      current.quit();
    } catch (RuntimeException ignored) {
      // fall through
    }

    storedDriver.remove();
  }

  protected boolean isIeDriverTimedOutException(IllegalStateException e) {
    // The IE driver may throw a timed out exception
    return e.getClass().getName().contains("TimedOutException");
  }

}