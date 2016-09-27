// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.testing;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.junit.Assert.assertThat;

import com.google.common.base.Throwables;

import org.junit.AssumptionViolatedException;
import org.junit.Before;
import org.junit.Rule;
import org.junit.rules.RuleChain;
import org.junit.rules.TestName;
import org.junit.rules.TestRule;
import org.junit.rules.TestWatcher;
import org.junit.runner.Description;
import org.junit.runner.RunWith;
import org.junit.runners.model.Statement;
import org.openqa.selenium.Pages;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.testing.drivers.SauceDriver;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.util.logging.Logger;

@RunWith(SeleniumTestRunner.class)
public abstract class JUnit4TestBase implements WrapsDriver {

  private static final Logger logger = Logger.getLogger(JUnit4TestBase.class.getName());

  private Browser browser = Browser.detect();
  protected TestEnvironment environment;
  protected AppServer appServer;
  protected Pages pages;
  private static ThreadLocal<WebDriver> storedDriver = new ThreadLocal<>();
  protected WebDriver driver;
  protected Wait<WebDriver> wait;
  protected Wait<WebDriver> shortWait;

  @Before
  public void prepareEnvironment() throws Exception {
    environment = GlobalTestEnvironment.get(InProcessTestEnvironment.class);
    appServer = environment.getAppServer();

    pages = new Pages(appServer);

    String hostName = environment.getAppServer().getHostName();
    String alternateHostName = environment.getAppServer().getAlternateHostName();

    assertThat(hostName, is(not(equalTo(alternateHostName))));
  }

  @Rule
  public TestName testName = new TestName();

  @Rule
  public TestRule chain = RuleChain
    .outerRule(new TraceMethodNameRule())
    .around(new ManageDriverRule())
    .around(new SwitchToTopRule())
    .around(new NotYetImplementedRule())
    .around(new CoveringUpSauceErrorsRule());

  private class TraceMethodNameRule extends TestWatcher {
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
  }

  private class ManageDriverRule extends TestWatcher {
    @Override
    protected void starting(Description description) {
      super.starting(description);
      NeedsFreshDriver annotation = description.getAnnotation(NeedsFreshDriver.class);
      if (annotation != null && matches(browser, annotation.value())) {
        System.out.println("Restarting driver before test " + description);
        removeDriver();
      }
      try {
        createDriver();
      } catch (Exception e) {
        throw new RuntimeException("Exception creating driver", e);
      }
    }

    @Override
    protected void succeeded(Description description) {
      super.finished(description);
      NoDriverAfterTest annotation = description.getAnnotation(NoDriverAfterTest.class);
      if (annotation != null && !annotation.failedOnly() && matches(browser, annotation.value())) {
        System.out.println("Restarting driver after succeeded test " + description);
        removeDriver();
      }
    }

    @Override
    protected void failed(Throwable e, Description description) {
      super.finished(description);
      NoDriverAfterTest annotation = description.getAnnotation(NoDriverAfterTest.class);
      if (annotation != null && matches(browser, annotation.value())) {
        System.out.println("Restarting driver after failed test " + description);
        removeDriver();
      }
    }
  }

  private class SwitchToTopRule extends TestWatcher {
    @Override
    protected void finished(Description description) {
      super.finished(description);
      SwitchToTopAfterTest annotation = description.getAnnotation(SwitchToTopAfterTest.class);
      if (annotation != null) {
        driver.switchTo().defaultContent();
      }
    }
  }

  private class CoveringUpSauceErrorsRule implements TestRule {
    @Override
    public Statement apply(final Statement base, final Description description) {
      return new Statement() {
        @Override
        public void evaluate() throws Throwable {
          try {
            base.evaluate();
          } catch (Throwable t) {
            dealWithSauceFailureIfNecessary(t);
            // retry if we got a 'sauce' failure
            base.evaluate();
          }
        }
      };
    }

    private void dealWithSauceFailureIfNecessary(Throwable t) {
      String message = t.getMessage();
      if (!(t instanceof AssumptionViolatedException) && message != null
          && (message.contains("sauce") || message.contains("Sauce"))) {
        try {
          removeDriver();
          createDriver();
        } catch (Exception e) {
          t.addSuppressed(e);
          throw new RuntimeException("Sauce-related failure. Tried re-creating the driver, but that failed too.", t);
        }
      } else {
        throw Throwables.propagate(t);
      }
    }
  }

  private class NotYetImplementedRule implements TestRule {

    @Override
    public Statement apply(final Statement base, final Description description) {
      final NotYetImplemented notYetImplementedBrowsers = description.getAnnotation(NotYetImplemented.class);
      if (notYetImplementedBrowsers == null || !matches(browser, notYetImplementedBrowsers.value())) {
        return base;
      }

      return new Statement() {
        @Override
        public void evaluate() throws Throwable {
          Exception toBeThrown = null;
          try {
            base.evaluate();
            toBeThrown = new Exception(description.getTestClass().getSimpleName() + '.' + description.getMethodName()
                                       + " is marked as not yet implemented with " + browser + " but already works!");
          }
          catch (final Throwable e) {
            // expected
          }
          if (toBeThrown != null) {
            throw toBeThrown;
          }
        }
      };
    }
  }

  public WebDriver getWrappedDriver() {
    return storedDriver.get();
  }

  private void createDriver() {
    driver = actuallyCreateDriver();
    wait = new WebDriverWait(driver, 30);
    shortWait = new WebDriverWait(driver, 5);
  }

  public static WebDriver actuallyCreateDriver() {
    WebDriver driver = storedDriver.get();

    if (driver == null ||
        (driver instanceof RemoteWebDriver && ((RemoteWebDriver)driver).getSessionId() == null)) {
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

  private static boolean matches(Browser browser, Driver[] drivers) {
    for (Driver driver : drivers) {
      switch (driver) {
        case ALL:
          return true;

        case CHROME:
          if (browser == Browser.chrome) {
            return true;
          }
          break;

        case FIREFOX:
          if (browser == Browser.ff && !Boolean.getBoolean("webdriver.firefox.marionette")) {
            return true;
          }
          break;

        case HTMLUNIT:
          if (browser == Browser.htmlunit || browser == Browser.htmlunit_js) {
            return true;
          }
          break;

        case IE:
          if (browser == Browser.ie) {
            return true;
          }
          break;

        case MARIONETTE:
          if (browser == Browser.ff && Boolean.getBoolean("webdriver.firefox.marionette")) {
            return true;
          }
          break;

        case PHANTOMJS:
          if (browser == Browser.phantomjs) {
            return true;
          }
          break;

        case REMOTE:
          if (Boolean.getBoolean("selenium.browser.remote") || SauceDriver.shouldUseSauce()) {
            return true;
          }
          break;

        case SAFARI:
          if (browser == Browser.safari) {
            return true;
          }
          break;

        default:
          throw new RuntimeException("Cannot determine driver");
      }
    }
    return false;
  }
}
