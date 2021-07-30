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

import org.junit.rules.RuleChain;
import org.junit.rules.TestRule;
import org.junit.rules.TestWatcher;
import org.junit.runner.Description;
import org.junit.runners.model.Statement;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.time.Duration;
import java.util.Objects;
import java.util.function.Function;
import java.util.logging.Logger;
import java.util.stream.Stream;

public class SeleniumTestRule implements TestRule {

  private static final ThreadLocal<Instances> instances = new ThreadLocal<>();
  private static final Logger LOG = Logger.getLogger(SeleniumTestRule.class.getName());
  private final Duration regularWait;
  private final Duration shortWait;
  private final RuleChain chain;

  public SeleniumTestRule() {
    this(Duration.ofSeconds(10), Duration.ofSeconds(5));
  }

  public SeleniumTestRule(Duration regularWait, Duration shortWait) {
    this.regularWait = Require.nonNull("Regular wait duration", regularWait);
    this.shortWait = Require.nonNull("Short wait duration", shortWait);

    this.chain = RuleChain.outerRule(new CaptureLoggingRule())
      .around(new TraceMethodNameRule())
      .around(new ManageDriverRule())
      .around(new SwitchToTopRule())
      .around(new NotYetImplementedRule());
  }

  @Override
  public Statement apply(Statement base, Description description) {
    return chain.apply(base, description);
  }

  public <X> X waitUntil(Function<? super WebDriver, X> condition) {
    getDriver();
    return instances.get().regularWait.until(condition);
  }

  public <X> X shortWaitUntil(Function<? super WebDriver, X> condition) {
    getDriver();
    return instances.get().shortWait.until(condition);
  }


  public WebDriver getDriver() {
    LOG.info("CREATING DRIVER");
    WebDriver driver = actuallyCreateDriver();
    LOG.info("CREATED " + driver);
    return driver;
  }

  public WebDriver createNewDriver(Capabilities capabilities) {
    removeDriver();
    return actuallyCreateDriver(capabilities);
  }

  private WebDriver actuallyCreateDriver() {
    return actuallyCreateDriver(Objects.requireNonNull(Browser.detect()).getCapabilities());
  }

  private WebDriver actuallyCreateDriver(Capabilities capabilities) {
    Instances current = instances.get();

    if (current == null ||
        current.driver == null ||
        (current.driver instanceof RemoteWebDriver && ((RemoteWebDriver) current.driver).getSessionId() == null)) {
      StaticResources.ensureAvailable();
      WebDriver driver = new WebDriverBuilder().get(capabilities);
      instances.set(new Instances(driver, regularWait, shortWait));
    }
    return instances.get().driver;
  }

  public void removeDriver() {
    if (Boolean.getBoolean("webdriver.singletestsuite.leaverunning")) {
      return;
    }

    Instances current = instances.get();

    if (current == null) {
      return;
    }

    try {
      current.driver.quit();
    } catch (RuntimeException ignored) {
      // fall through
    }

    instances.remove();
  }

  private static class Instances {
    public final WebDriver driver;
    public final Wait<WebDriver> regularWait;
    public final Wait<WebDriver> shortWait;

    public Instances(WebDriver driver, Duration regularWait, Duration shortWait) {
      this.driver = driver;
      this.regularWait = new WebDriverWait(driver, regularWait);
      this.shortWait = new WebDriverWait(driver, shortWait);
    }
  }

  private class ManageDriverRule extends TestWatcher {
    private final Browser current = Objects.requireNonNull(Browser.detect());

    @Override
    protected void starting(Description description) {
      super.starting(description);

      NoDriverBeforeTest killSharedDriver = description.getAnnotation(NoDriverBeforeTest.class);
      if (killSharedDriver != null && current.matches(killSharedDriver.value())) {
        LOG.info("Destroying driver before test " + description);
        removeDriver();
        return;
      }
      NeedsFreshDriver annotation = description.getAnnotation(NeedsFreshDriver.class);
      if (annotation != null && current.matches(annotation.value())) {
        LOG.info("Restarting driver before test " + description);
        removeDriver();
      }
    }

    @Override
    protected void succeeded(Description description) {
      super.finished(description);
      NoDriverAfterTest annotation = description.getAnnotation(NoDriverAfterTest.class);
      if (annotation != null && !annotation.failedOnly() && current.matches(annotation.value())) {
        System.out.println("Restarting driver after succeeded test " + description);
        removeDriver();
      }
    }

    @Override
    protected void failed(Throwable e, Description description) {
      super.finished(description);
      NoDriverAfterTest annotation = description.getAnnotation(NoDriverAfterTest.class);
      if (annotation != null && current.matches(annotation.value())) {
        System.out.println("Restarting driver after failed test " + description);
        removeDriver();
      }
    }
  }

  private static class SwitchToTopRule extends TestWatcher {
    @Override
    protected void finished(Description description) {
      super.finished(description);
      SwitchToTopAfterTest annotation = description.getAnnotation(SwitchToTopAfterTest.class);
      if (annotation != null) {
        Instances currentInstances = SeleniumTestRule.instances.get();
        if (currentInstances == null) {
          return;
        }
        currentInstances.driver.switchTo().defaultContent();
      }
    }
  }

  private static class TraceMethodNameRule extends TestWatcher {
    @Override
    protected void starting(Description description) {
      super.starting(description);
      LOG.info(">>> Starting " + description);
    }

    @Override
    protected void finished(Description description) {
      super.finished(description);
      LOG.info("<<< Finished " + description);
    }
  }

  private static class NotYetImplementedRule implements TestRule {

    private final Browser current = Objects.requireNonNull(Browser.detect());

    private boolean notImplemented(NotYetImplementedList list) {
      return list != null && list.value().length > 0 && notImplemented(Stream.of(list.value()));
    }

    private boolean notImplemented(NotYetImplemented single) {
      return single !=  null && notImplemented(Stream.of(single));
    }

    private boolean notImplemented(Stream<NotYetImplemented> nyi) {
      return nyi.anyMatch(driver -> current.matches(driver.value()));
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
}
