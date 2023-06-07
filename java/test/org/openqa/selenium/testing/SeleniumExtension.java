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

import static org.junit.platform.commons.util.AnnotationUtils.findAnnotation;
import static org.junit.platform.commons.util.AnnotationUtils.findRepeatableAnnotations;

import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Method;
import java.time.Duration;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.logging.Logger;
import java.util.stream.Stream;
import org.junit.jupiter.api.extension.AfterEachCallback;
import org.junit.jupiter.api.extension.BeforeEachCallback;
import org.junit.jupiter.api.extension.ConditionEvaluationResult;
import org.junit.jupiter.api.extension.ExecutionCondition;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestExecutionExceptionHandler;
import org.junit.jupiter.api.extension.TestWatcher;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

public class SeleniumExtension
    implements BeforeEachCallback,
        AfterEachCallback,
        TestWatcher,
        ExecutionCondition,
        TestExecutionExceptionHandler {

  private static final ThreadLocal<SeleniumExtension.Instances> instances = new ThreadLocal<>();

  private static final Logger LOG = Logger.getLogger(SeleniumExtension.class.getName());

  private final Duration regularWait;

  private final Duration shortWait;

  private boolean nullDriver = false;

  private final TestIgnorance ignorance;

  private final CaptureLoggingRule captureLoggingRule;

  private boolean failedWithNotYetImplemented = false;
  private boolean failedWithRemoteBuild = false;

  public SeleniumExtension() {
    this(Duration.ofSeconds(10), Duration.ofSeconds(5));
  }

  public SeleniumExtension(Duration regularWait, Duration shortWait) {
    this.regularWait = Require.nonNull("Regular wait duration", regularWait);
    this.shortWait = Require.nonNull("Short wait duration", shortWait);

    this.ignorance =
        new TestIgnorance(Optional.ofNullable(Browser.detect()).orElse(Browser.CHROME));
    this.captureLoggingRule = new CaptureLoggingRule();
  }

  @Override
  public void beforeEach(ExtensionContext context) throws Exception {
    nullDriver = false;

    // ManageDriverRule.starting
    Browser current = Objects.requireNonNull(Browser.detect());
    Optional<Method> testMethod = context.getTestMethod();
    Optional<NoDriverBeforeTest> noDriverBeforeTest =
        findAnnotation(testMethod, NoDriverBeforeTest.class);

    if (noDriverBeforeTest.isPresent()) {
      NoDriverBeforeTest annotation = noDriverBeforeTest.get();
      if (current.matches(annotation.value())) {
        LOG.info("Destroying driver before test " + context.getDisplayName());
        removeDriver();
        nullDriver = true;
        return;
      }
    }
    Optional<NeedsFreshDriver> needsFreshDriver =
        findAnnotation(testMethod, NeedsFreshDriver.class);
    if (needsFreshDriver.isPresent()) {
      NeedsFreshDriver annotation = needsFreshDriver.get();
      if (current.matches(annotation.value())) {
        LOG.info("Restarting driver before test " + context.getDisplayName());
        removeDriver();
      }
    }

    // TraceMethodNameRule.starting
    LOG.info(">>> Starting " + context.getDisplayName());

    // NotYetImplementedRule
    failedWithNotYetImplemented = false;

    // Remote builds
    failedWithRemoteBuild = false;
  }

  @Override
  public void afterEach(ExtensionContext context) throws Exception {
    // SwitchToTopRule
    SwitchToTopRule switchToTopRule = new SwitchToTopRule(context);
    switchToTopRule.apply();

    // TraceMethodNameRule.finished
    LOG.info("<<< Finished  " + context.getDisplayName());

    // CaptureLoggingRule
    captureLoggingRule.endLogCapture();

    // NotYetImplementedRule
    NotYetImplementedRule notYetImplementedRule = new NotYetImplementedRule(context);
    boolean isNotYetImplemented = notYetImplementedRule.check();

    if (isNotYetImplemented && !failedWithNotYetImplemented) {
      Optional<Class<?>> testClass = context.getTestClass();
      Optional<Method> testMethod = context.getTestMethod();
      Browser current = Objects.requireNonNull(Browser.detect());
      throw new Exception(
          String.format(
              "%s.%s is marked as not yet implemented with %s but already works!",
              testClass.map(Class::getName).orElse(""),
              testMethod.map(Method::getName).orElse(""),
              current));
    }

    NotWorkingInRemoteBazelBuildsRule notWorkingInRemoteBuilds =
        new NotWorkingInRemoteBazelBuildsRule(context);
    boolean isNotExpectedToWork = notWorkingInRemoteBuilds.check();

    if (isNotExpectedToWork && !failedWithRemoteBuild) {
      Optional<Class<?>> testClass = context.getTestClass();
      Optional<Method> testMethod = context.getTestMethod();
      throw new Exception(
          String.format(
              "%s.%s is not yet expected to work on remote builds using %s, but it already works!",
              testClass.map(Class::getName).orElse(""),
              testMethod.map(Method::getName).orElse(""),
              Browser.detect()));
    }
  }

  @Override
  public void testSuccessful(ExtensionContext context) {
    TestWatcher.super.testSuccessful(context);

    // ManageDriverRule.succeeded
    Browser current = Objects.requireNonNull(Browser.detect());
    Optional<Method> testMethod = context.getTestMethod();
    Optional<NoDriverAfterTest> noDriverAfterTest =
        findAnnotation(testMethod, NoDriverAfterTest.class);
    if (noDriverAfterTest.isPresent()) {
      NoDriverAfterTest annotation = noDriverAfterTest.get();
      if (!annotation.failedOnly() && current.matches(annotation.value())) {
        System.out.println("Restarting driver after succeeded test " + context.getDisplayName());
        removeDriver();
      }
    }
  }

  @Override
  public void testFailed(ExtensionContext context, Throwable cause) {
    TestWatcher.super.testFailed(context, cause);

    // ManageDriverRule.failed
    Browser current = Objects.requireNonNull(Browser.detect());
    Optional<Method> testMethod = context.getTestMethod();
    Optional<NoDriverAfterTest> noDriverAfterTest =
        findAnnotation(testMethod, NoDriverAfterTest.class);
    if (noDriverAfterTest.isPresent()) {
      NoDriverAfterTest annotation = noDriverAfterTest.get();
      if (current.matches(annotation.value())) {
        System.out.println("Restarting driver after failed test " + context.getDisplayName());
        removeDriver();
      }
    }

    // CaptureLoggingRule
    captureLoggingRule.writeCapturedLogs();
  }

  @Override
  public ConditionEvaluationResult evaluateExecutionCondition(ExtensionContext context) {
    if (ignorance.isIgnored(context)) {
      return ConditionEvaluationResult.disabled("Test disabled");
    }
    return ConditionEvaluationResult.enabled("Test enabled");
  }

  @Override
  public void handleTestExecutionException(ExtensionContext context, Throwable throwable)
      throws Throwable {
    // NotYetImplementedRule
    NotYetImplementedRule notYetImplementedRule = new NotYetImplementedRule(context);
    if (notYetImplementedRule.check()) {
      failedWithNotYetImplemented = true;
    }

    NotWorkingInRemoteBazelBuildsRule notWorkingInRemoteBuilds =
        new NotWorkingInRemoteBazelBuildsRule(context);
    if (notWorkingInRemoteBuilds.check()) {
      failedWithRemoteBuild = true;
    }

    if (failedWithNotYetImplemented || failedWithRemoteBuild) {
      // Expected failures.
      return;
    }

    throw throwable;
  }

  public <T> T waitUntil(Function<? super WebDriver, T> condition) {
    getDriver();
    return instances.get().regularWait.until(condition);
  }

  public <T> T shortWaitUntil(Function<? super WebDriver, T> condition) {
    getDriver();
    return instances.get().shortWait.until(condition);
  }

  public WebDriver getDriver() {
    if (nullDriver) {
      return null;
    }

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

    if (current == null
        || current.driver == null
        || (current.driver instanceof RemoteWebDriver
            && ((RemoteWebDriver) current.driver).getSessionId() == null)) {
      StaticResources.ensureAvailable();
      WebDriver driver = new WebDriverBuilder().get(capabilities);
      nullDriver = false;
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

  private static class NotYetImplementedRule {

    ExtensionContext context;

    public NotYetImplementedRule(ExtensionContext context) {
      this.context = context;
    }

    private final Browser current = Objects.requireNonNull(Browser.detect());

    private boolean notImplemented(Optional<NotYetImplementedList> list) {
      return list.isPresent() && notImplemented(Stream.of(list.get().value()));
    }

    private boolean notImplemented(Stream<NotYetImplemented> nyi) {
      return nyi.anyMatch(driver -> current.matches(driver.value()));
    }

    public boolean check() throws Exception {
      Optional<AnnotatedElement> element = context.getElement();
      Optional<NotYetImplementedList> notYetImplementedList =
          findAnnotation(element, NotYetImplementedList.class);
      List<NotYetImplemented> notYetImplemented =
          findRepeatableAnnotations(element, NotYetImplemented.class);
      return notImplemented(notYetImplementedList) || notImplemented(notYetImplemented.stream());
    }
  }

  private static class NotWorkingInRemoteBazelBuildsRule {
    ExtensionContext context;
    private final Browser current = Objects.requireNonNull(Browser.detect());

    public NotWorkingInRemoteBazelBuildsRule(ExtensionContext context) {
      this.context = context;
    }

    private boolean notWorkingYet(Optional<NotWorkingInRemoteBazelBuilds> list) {
      return list.isPresent() && notWorkingYet(Stream.of(list.get()));
    }

    private boolean notWorkingYet(Stream<NotWorkingInRemoteBazelBuilds> value) {
      return value.anyMatch(notWorking -> current.matches(notWorking.value()));
    }

    public boolean check() {
      if (!Objects.equals("1", System.getenv("REMOTE_BUILD"))) {
        return false;
      }

      Optional<AnnotatedElement> element = context.getElement();
      Optional<NotWorkingInRemoteBazelBuilds> notWorkingList =
          findAnnotation(element, NotWorkingInRemoteBazelBuilds.class);
      List<NotWorkingInRemoteBazelBuilds> notWorking =
          findRepeatableAnnotations(element, NotWorkingInRemoteBazelBuilds.class);
      return notWorkingYet(notWorkingList) || notWorkingYet(notWorking.stream());
    }
  }

  private static class SwitchToTopRule {
    ExtensionContext context;

    public SwitchToTopRule(ExtensionContext context) {
      this.context = context;
    }

    protected void apply() {
      Optional<Method> testMethod = context.getTestMethod();

      if (findAnnotation(testMethod, SwitchToTopAfterTest.class).isPresent()) {
        Instances currentInstances = instances.get();
        if (currentInstances == null) {
          return;
        }
        currentInstances.driver.switchTo().defaultContent();
      }
    }
  }
}
