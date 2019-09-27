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

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Before;
import org.junit.Rule;
import org.junit.rules.RuleChain;
import org.junit.rules.TestName;
import org.junit.rules.TestRule;
import org.junit.rules.TestWatcher;
import org.junit.runner.Description;
import org.junit.runner.RunWith;
import org.junit.runners.model.Statement;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.util.logging.Logger;
import java.util.stream.Stream;

@RunWith(SeleniumTestRunner.class)
public abstract class JUnit4TestBase {

  private static final Logger logger = Logger.getLogger(JUnit4TestBase.class.getName());

  private Browser current = Browser.detect();
  protected TestEnvironment environment;
  protected AppServer appServer;
  protected Pages pages;
  private static ThreadLocal<WebDriver> storedDriver = new ThreadLocal<>();
  protected WebDriver driver;
  protected Wait<WebDriver> wait;
  protected Wait<WebDriver> shortWait;

  @Before
  public void prepareEnvironment() {
    environment = GlobalTestEnvironment.get(InProcessTestEnvironment.class);
    appServer = environment.getAppServer();

    pages = new Pages(appServer);

    String hostName = environment.getAppServer().getHostName();
    String alternateHostName = environment.getAppServer().getAlternateHostName();

    assertThat(hostName).isNotEqualTo(alternateHostName);
  }

  @Rule
  public TestName testName = new TestName();

  @Rule
  public TestRule chain = RuleChain
    .outerRule(new TraceMethodNameRule())
    .around(new NotificationRule())
    .around(new ManageDriverRule())
    .around(new SwitchToTopRule())
    .around(new NotYetImplementedRule());

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
      NoDriverBeforeTest killSharedDriver = description.getAnnotation(NoDriverBeforeTest.class);
      if (killSharedDriver != null && matches(current, killSharedDriver.value())) {
        System.out.println("Destroying driver before test " + description);
        removeDriver();
        return;
      }
      NeedsFreshDriver annotation = description.getAnnotation(NeedsFreshDriver.class);
      if (annotation != null && matches(current, annotation.value())) {
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
      if (annotation != null && !annotation.failedOnly() && matches(current, annotation.value())) {
        System.out.println("Restarting driver after succeeded test " + description);
        removeDriver();
      }
    }

    @Override
    protected void failed(Throwable e, Description description) {
      super.finished(description);
      NoDriverAfterTest annotation = description.getAnnotation(NoDriverAfterTest.class);
      if (annotation != null && matches(current, annotation.value())) {
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

  private class NotYetImplementedRule implements TestRule {

    private boolean notImplemented(NotYetImplementedList list) {
      return list != null && list.value().length > 0 && notImplemented(Stream.of(list.value()));
    }

    private boolean notImplemented(NotYetImplemented single) {
      return single !=  null && notImplemented(Stream.of(single));
    }

    private boolean notImplemented(Stream<NotYetImplemented> nyi) {
      return nyi.anyMatch(driver -> matches(current, new Browser[]{driver.value()}));
    }

    @Override
    public Statement apply(final Statement base, final Description description) {
      if (notImplemented(description.getAnnotation(NotYetImplementedList.class)) ||
          notImplemented(description.getAnnotation(NotYetImplemented.class))) {
        return new Statement() {
          @Override
          public void evaluate() throws Throwable {
            Exception toBeThrown = null;
            try {
              base.evaluate();
              toBeThrown = new Exception(String.format(
                  "%s.%s is marked as not yet implemented with %s but already works!",
                  description.getTestClass().getSimpleName(), description.getMethodName(), current));
            }
            catch (final Throwable e) {
              // expected
            }
            if (toBeThrown != null) {
              throw toBeThrown;
            }
          }
        };

      } else {
        return base;
      }
    }
  }

  private void createDriver() {
    System.out.println("CREATING DRIVER");
    driver = actuallyCreateDriver();
    System.out.println("CREATED " + driver);
    wait = new WebDriverWait(driver, 10);
    shortWait = new WebDriverWait(driver, 5);
  }

  public void createNewDriver(Capabilities capabilities) {
    removeDriver();
    driver = actuallyCreateDriver(capabilities);
    wait = new WebDriverWait(driver, 10);
    shortWait = new WebDriverWait(driver, 5);
  }

  private static WebDriver actuallyCreateDriver() {
    WebDriver driver = storedDriver.get();

    if (driver == null ||
        (driver instanceof RemoteWebDriver && ((RemoteWebDriver)driver).getSessionId() == null)) {
      StaticResources.ensureAvailable();
      driver = new WebDriverBuilder().get();
      storedDriver.set(driver);
    }
    return storedDriver.get();
  }

  private static WebDriver actuallyCreateDriver(Capabilities capabilities) {
    WebDriver driver = storedDriver.get();

    if (driver == null ||
        (driver instanceof RemoteWebDriver && ((RemoteWebDriver)driver).getSessionId() == null)) {
      StaticResources.ensureAvailable();
      driver = new WebDriverBuilder().get(capabilities);
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

  private static boolean matches(Browser current, Browser[] drivers) {
    for (Browser item : drivers) {
      if (item == Browser.ALL) {
        return true;
      }

      if (item == current) {
        return true;
      }
    }
    return false;
  }
}
