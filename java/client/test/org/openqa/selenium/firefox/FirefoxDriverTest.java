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

package org.openqa.selenium.firefox;

import com.google.common.collect.ImmutableMap;
import org.junit.After;
import org.junit.Test;
import org.mockito.ArgumentMatchers;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.ParallelTestRunner;
import org.openqa.selenium.ParallelTestRunner.Worker;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.UnreachableBrowserException;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.fail;
import static org.junit.Assume.assumeNotNull;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_SSL_CERTS;
import static org.openqa.selenium.remote.CapabilityType.PAGE_LOAD_STRATEGY;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

@NeedsLocalEnvironment(reason = "Requires local browser launching environment")
public class FirefoxDriverTest extends JUnit4TestBase {

  private FirefoxDriver localDriver;

  @After
  public void quitDriver() {
    if (localDriver != null) {
      localDriver.quit();
    }
  }

  @Test
  public void canStartDriverWithNoParameters() {
    localDriver = new FirefoxDriver();
    assertThat(localDriver.getCapabilities().getBrowserName()).isEqualTo("firefox");
  }

  @Test
  @Ignore(value = FIREFOX, reason = "Assumed to be covered by tests for GeckoDriverService")
  public void canStartDriverWithSpecifiedBinary() {
    FirefoxBinary binary = spy(new FirefoxBinary());
    FirefoxOptions options = new FirefoxOptions()
        .setBinary(binary);

    localDriver = new FirefoxDriver(options);

    verify(binary, atLeastOnce()).getPath();
  }

  @Test
  public void canStartDriverWithSpecifiedProfile() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", 1);
    profile.setPreference("browser.startup.homepage", pages.xhtmlTestPage);

    localDriver = new FirefoxDriver(new FirefoxOptions().setProfile(profile));
    wait.until($ -> "XHTML Test Page".equals(localDriver.getTitle()));
  }

  @Test
  public void canPassCapabilities() {
    Capabilities caps = new ImmutableCapabilities(CapabilityType.PAGE_LOAD_STRATEGY, "none");

    localDriver = new FirefoxDriver(caps);

    assertThat(localDriver.getCapabilities().getCapability(PAGE_LOAD_STRATEGY)).isEqualTo("none");
  }

  @Test
  public void canSetPreferencesInFirefoxOptions() {
    FirefoxOptions options = new FirefoxOptions()
        .addPreference("browser.startup.page", 1)
        .addPreference("browser.startup.homepage", pages.xhtmlTestPage);

    localDriver = new FirefoxDriver(options);
    wait.until($ -> "XHTML Test Page".equals(localDriver.getTitle()));
  }

  @Test
  public void canSetProfileInFirefoxOptions() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", 1);
    profile.setPreference("browser.startup.homepage", pages.xhtmlTestPage);

    FirefoxOptions options = new FirefoxOptions().setProfile(profile);

    localDriver = new FirefoxDriver(options);
    wait.until($ -> "XHTML Test Page".equals(localDriver.getTitle()));
  }

  @Test
  public void canSetProfileInCapabilities() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", 1);
    profile.setPreference("browser.startup.homepage", pages.xhtmlTestPage);

    Capabilities caps = new ImmutableCapabilities(FirefoxDriver.Capability.PROFILE, profile);

    localDriver = new FirefoxDriver(caps);
    wait.until($ -> "XHTML Test Page".equals(localDriver.getTitle()));
  }

  @Test
  @Ignore(value = FIREFOX, reason = "Assumed to be covered by tests for GeckoDriverService")
  public void canSetBinaryInCapabilities() {
    FirefoxBinary binary = spy(new FirefoxBinary());
    Capabilities caps = new ImmutableCapabilities(FirefoxDriver.Capability.BINARY, binary);

    localDriver = new FirefoxDriver(caps);

    verify(binary, atLeastOnce()).getPath();
  }

  @Test
  public void canSetBinaryPathInCapabilities() {
    String binPath = new FirefoxBinary().getPath();
    Capabilities caps = new ImmutableCapabilities(FirefoxDriver.Capability.BINARY, binPath);

    localDriver = new FirefoxDriver(caps);
  }

  @Test
  public void canSetPreferencesAndProfileInFirefoxOptions() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", 1);
    profile.setPreference("browser.startup.homepage", pages.xhtmlTestPage);

    FirefoxOptions options = new FirefoxOptions()
        .setProfile(profile)
        .addPreference("browser.startup.homepage", pages.javascriptPage);

    localDriver = new FirefoxDriver(options);
    wait.until($ -> "Testing Javascript".equals(localDriver.getTitle()));
  }

  @Test
  public void shouldGetMeaningfulExceptionOnBrowserDeath() throws Exception {
    FirefoxDriver driver2 = new FirefoxDriver();
    driver2.get(pages.formPage);

    // Grab the command executor
    CommandExecutor keptExecutor = driver2.getCommandExecutor();
    SessionId sessionId = driver2.getSessionId();

    try {
      Field field = RemoteWebDriver.class.getDeclaredField("executor");
      field.setAccessible(true);
      CommandExecutor spoof = mock(CommandExecutor.class);
      doThrow(new IOException("The remote server died"))
          .when(spoof).execute(ArgumentMatchers.any());

      field.set(driver2, spoof);

      driver2.get(pages.formPage);
      fail("Should have thrown.");
    } catch (UnreachableBrowserException e) {
      assertThat(e.getMessage()).contains("Error communicating with the remote browser");
    } finally {
      keptExecutor.execute(new Command(sessionId, DriverCommand.QUIT));
    }
  }

  @NeedsFreshDriver
  @NoDriverAfterTest
  @Test
  public void shouldWaitUntilBrowserHasClosedProperly() {
    driver.get(pages.simpleTestPage);
    driver.quit();
    removeDriver();

    driver = new WebDriverBuilder().get();

    driver.get(pages.formPage);
    WebElement textarea = driver.findElement(By.id("withText"));
    String sentText = "I like cheese\n\nIt's really nice";
    String expectedText = textarea.getAttribute("value") + sentText;
    textarea.sendKeys(sentText);
    wait.until(elementValueToEqual(textarea, expectedText));
    driver.quit();
  }

  @Test
  public void shouldBeAbleToStartMoreThanOneInstanceOfTheFirefoxDriverSimultaneously() {
    WebDriver secondDriver = new FirefoxDriver();

    try {
      driver.get(pages.xhtmlTestPage);
      secondDriver.get(pages.formPage);

      assertThat(driver.getTitle()).isEqualTo("XHTML Test Page");
      assertThat(secondDriver.getTitle()).isEqualTo("We Leave From Here");
    } finally {
      secondDriver.quit();
    }
  }

  @Test
  public void shouldBeAbleToStartFromAUniqueProfile() {
    FirefoxProfile profile = new FirefoxProfile();
    localDriver = new FirefoxDriver(new FirefoxOptions().setProfile(profile));
  }

  @Test
  public void aNewProfileShouldAllowSettingAdditionalParameters() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.homepage", pages.formPage);

    localDriver = new FirefoxDriver(new FirefoxOptions().setProfile(profile));
    new WebDriverWait(localDriver, Duration.ofSeconds(30)).until(titleIs("We Leave From Here"));
    String title = localDriver.getTitle();

    assertThat(title).isEqualTo("We Leave From Here");
  }

  @Test
  public void shouldBeAbleToStartFromProfileWithLogFileSet() throws IOException {
    FirefoxProfile profile = new FirefoxProfile();
    File logFile = File.createTempFile("test", "firefox.log");
    logFile.deleteOnExit();

    profile.setPreference("webdriver.log.file", logFile.getAbsolutePath());

    localDriver = new FirefoxDriver(new FirefoxOptions().setProfile(profile));
    assertThat(logFile).exists();
  }

  @Test
  public void shouldBeAbleToStartFromProfileWithLogFileSetToStdout() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("webdriver.log.file", "/dev/stdout");

    localDriver = new FirefoxDriver(new FirefoxOptions().setProfile(profile));
  }

  @Test
  public void shouldBeAbleToStartANamedProfile() {
    FirefoxProfile profile = new ProfilesIni().getProfile("default");
    assumeNotNull(profile);

    localDriver = new FirefoxDriver(new FirefoxOptions().setProfile(profile));
  }

  @Test(timeout = 60000)
  @Ignore(FIREFOX)
  public void shouldBeAbleToStartANewInstanceEvenWithVerboseLogging() {
    FirefoxBinary binary = new FirefoxBinary();
    GeckoDriverService service = new GeckoDriverService.Builder()
        .usingFirefoxBinary(binary)
        .withEnvironment(ImmutableMap.of("NSPR_LOG_MODULES", "all:5"))
        .build();

    // We will have an infinite hang if this driver does not start properly.
    new FirefoxDriver(service).quit();
  }

  @Test
  public void shouldBeAbleToPassCommandLineOptions() {
    FirefoxBinary binary = new FirefoxBinary();
    binary.addCommandLineOptions("-width", "800", "-height", "600");

    localDriver = new FirefoxDriver(new FirefoxOptions().setBinary(binary));
    Dimension size = localDriver.manage().window().getSize();
    assertThat(size.width).isGreaterThanOrEqualTo(800);
    assertThat(size.width).isLessThan(850);
    assertThat(size.height).isGreaterThanOrEqualTo(600);
    assertThat(size.height).isLessThan(650);
  }


  @Test
  public void canBlockInvalidSslCertificates() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setAcceptUntrustedCertificates(false);

    localDriver = new FirefoxDriver(new FirefoxOptions().setProfile(profile));
    Capabilities caps = localDriver.getCapabilities();
    assertThat(caps.is(ACCEPT_SSL_CERTS)).isFalse();
  }

  @Test
  public void shouldAllowUserToSuccessfullyOverrideTheHomePage() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", "1");
    profile.setPreference("browser.startup.homepage", pages.javascriptPage);

    localDriver = new FirefoxDriver(new FirefoxOptions().setProfile(profile));
    new WebDriverWait(localDriver, Duration.ofSeconds(30)).until(urlToBe(pages.javascriptPage));
  }

  private ExpectedCondition<Boolean> urlToBe(final String expectedUrl) {
    return driver1 -> expectedUrl.equals(driver1.getCurrentUrl());
  }

  @Test
  @Ignore(value = FIREFOX, issue = "https://github.com/mozilla/geckodriver/issues/273")
  public void canAccessUrlProtectedByBasicAuth() {
    driver.get(appServer.whereIsWithCredentials("basicAuth", "test", "test"));
    assertThat(driver.findElement(By.tagName("h1")).getText()).isEqualTo("authorized");
  }

  @Test
  public void shouldAllowTwoInstancesOfFirefoxAtTheSameTimeInDifferentThreads()
      throws InterruptedException {
    class FirefoxRunner implements Runnable {
      private volatile WebDriver myDriver;
      private final String url;

      public FirefoxRunner(String url) {
        this.url = url;
      }

      @Override
      public void run() {
        myDriver = new FirefoxDriver();
        myDriver.get(url);
      }

      public void quit() {
        if (myDriver != null) {
          myDriver.quit();
        }
      }

      public void assertOnRightPage() {
        assertThat(myDriver.getCurrentUrl()).isEqualTo(url);
      }
    }

    FirefoxRunner runnable1 = new FirefoxRunner(pages.formPage);
    Thread thread1 = new Thread(runnable1); // Thread safety reviewed
    FirefoxRunner runnable2 = new FirefoxRunner(pages.xhtmlTestPage);
    Thread thread2 = new Thread(runnable2); // Thread safety reviewed

    try {
      thread1.start();
      thread2.start();

      thread1.join();
      thread2.join();

      runnable1.assertOnRightPage();
      runnable2.assertOnRightPage();
    } finally {
      runnable1.quit();
      runnable2.quit();
    }

  }

  private static char[] CHARS =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!\"§$%&/()+*~#',.-_:;\\"
          .toCharArray();
  private static Random RANDOM = new Random();

  private static String randomString() {
    int n = 20 + RANDOM.nextInt(80);
    StringBuilder sb = new StringBuilder(n);
    for (int i = 0; i < n; ++i) {
      sb.append(CHARS[RANDOM.nextInt(CHARS.length)]);
    }
    return sb.toString();
  }

  @Test
  public void multipleFirefoxDriversRunningConcurrently() throws Exception {
    int numThreads = 6;
    final int numRoundsPerThread = 5;
    WebDriver[] drivers = new WebDriver[numThreads];
    List<Worker> workers = new ArrayList<>(numThreads);
    try {
      for (int i = 0; i < numThreads; ++i) {
        final WebDriver driver = (i == 0 ? super.driver : new FirefoxDriver());
        drivers[i] = driver;
        workers.add(() -> {
          driver.get(pages.formPage);
          WebElement inputField = driver.findElement(By.id("working"));
          for (int i1 = 0; i1 < numRoundsPerThread; ++i1) {
            String s = randomString();
            inputField.clear();
            inputField.sendKeys(s);
            String value = inputField.getAttribute("value");
            assertThat(value).isEqualTo(s);
          }
        });
      }
      ParallelTestRunner parallelTestRunner = new ParallelTestRunner(workers);
      parallelTestRunner.run();
    } finally {
      for (int i = 1; i < numThreads; ++i) {
        if (drivers[i] != null) {
          try {
            drivers[i].quit();
          } catch (RuntimeException ignored) {
          }
        }
      }
    }
  }

  @Test
  public void shouldBeAbleToUseTheSameProfileMoreThanOnce() {
    FirefoxProfile profile = new FirefoxProfile();

    profile.setPreference("browser.startup.homepage", pages.formPage);

    WebDriver one = null;
    WebDriver two = null;

    try {
      one = new FirefoxDriver(new FirefoxOptions().setProfile(profile));
      two = new FirefoxDriver(new FirefoxOptions().setProfile(profile));

      // If we get this far, then both firefoxes have started. If this test
      // two browsers will start, but the second won't have a valid port and an
      // exception will be thrown. Hurrah! Test passes.
    } finally {
      if (one != null) one.quit();
      if (two != null) two.quit();
    }
  }

  // See https://github.com/SeleniumHQ/selenium-google-code-issue-archive/issues/1774
  @Test
  public void canStartFirefoxDriverWithSubclassOfFirefoxProfile() {
    new FirefoxDriver(new FirefoxOptions().setProfile(new CustomFirefoxProfile())).quit();
    new FirefoxDriver(new FirefoxOptions().setProfile(new FirefoxProfile() {})).quit();
  }

  /**
   * Tests that we do not pollute the global namespace with Sizzle in Firefox 3.
   */
  @Test
  public void searchingByCssDoesNotPolluteGlobalNamespaceWithSizzleLibrary() {
    driver.get(pages.xhtmlTestPage);
    driver.findElement(By.cssSelector("div.content"));
    assertThat(((JavascriptExecutor) driver).executeScript("return typeof Sizzle == 'undefined';"))
        .isEqualTo(true);
  }

  /**
   * Tests that we do not pollute the global namespace with Sizzle in Firefox 3.
   */
  @Test
  public void searchingByCssDoesNotOverwriteExistingSizzleDefinition() {
    driver.get(pages.xhtmlTestPage);
    ((JavascriptExecutor) driver).executeScript("window.Sizzle = 'original sizzle value';");
    driver.findElement(By.cssSelector("div.content"));
    assertThat(((JavascriptExecutor) driver).executeScript("return window.Sizzle + '';"))
        .isEqualTo("original sizzle value");
  }

  @Test
  @NotYetImplemented(value = FIREFOX, reason = "https://bugzilla.mozilla.org/show_bug.cgi?id=1415067")
  public void testFirefoxCanNativelyClickOverlappingElements() {
    FirefoxOptions options = new FirefoxOptions();
    options.setCapability(CapabilityType.OVERLAPPING_CHECK_DISABLED, true);
    localDriver = new FirefoxDriver(options);
    localDriver.get(appServer.whereIs("click_tests/overlapping_elements.html"));
    localDriver.findElement(By.id("under")).click();
    assertThat(localDriver.findElement(By.id("log")).getText())
        .isEqualTo("Log:\n"
                 + "mousedown in over (handled by over)\n"
                 + "mousedown in over (handled by body)\n"
                 + "mouseup in over (handled by over)\n"
                 + "mouseup in over (handled by body)\n"
                 + "click in over (handled by over)\n"
                 + "click in over (handled by body)");
  }

  private static class CustomFirefoxProfile extends FirefoxProfile {}

}
