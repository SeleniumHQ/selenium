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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.mockito.ArgumentMatchers;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.ParallelTestRunner;
import org.openqa.selenium.ParallelTestRunner.Worker;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.RemoteWebDriverBuilder;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.UnreachableBrowserException;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_SSL_CERTS;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

public class FirefoxDriverTest extends JupiterTestBase {

  private static final String EXT_PATH = "common/extensions/webextensions-selenium-example.xpi";
  private static final String EXT_PATH_DIR = "common/extensions/webextensions-selenium-example";
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
  @NoDriverBeforeTest
  public void builderGeneratesDefaultFirefoxOptions() {
    localDriver = FirefoxDriver.builder().build();
    FirefoxDriver firefoxDriver = (FirefoxDriver) localDriver;
    Capabilities capabilities = firefoxDriver.getCapabilities();

    assertThat(localDriver.manage().timeouts().getImplicitWaitTimeout()).isEqualTo(Duration.ZERO);
    assertTrue((Boolean) capabilities.getCapability("acceptInsecureCerts"));
    assertThat(capabilities.getCapability("browserName")).isEqualTo("firefox");
  }

  @Test
  @NoDriverBeforeTest
  public void builderOverridesDefaultFirefoxOptions() {
    FirefoxOptions options = new FirefoxOptions();
    options.setImplicitWaitTimeout(Duration.ofMillis(1));
    localDriver = FirefoxDriver.builder().oneOf(options).build();
    assertThat(localDriver.manage().timeouts().getImplicitWaitTimeout()).isEqualTo(Duration.ofMillis(1));
  }

  @Test
  public void builderWithClientConfigThrowsException() {
    ClientConfig clientConfig = ClientConfig.defaultConfig().readTimeout(Duration.ofMinutes(1));
    RemoteWebDriverBuilder builder = FirefoxDriver.builder().config(clientConfig);

    assertThatExceptionOfType(IllegalArgumentException.class)
      .isThrownBy(builder::build)
      .withMessage("ClientConfig instances do not work for Local Drivers");
  }

  @Test
  @NoDriverBeforeTest
  public void canStartDriverWithNoParameters() {
    localDriver = new WebDriverBuilder().get();
    assertThat(((HasCapabilities) localDriver).getCapabilities().getBrowserName()).isEqualTo("firefox");
  }

  @Test
  @Ignore(value = FIREFOX, reason = "Assumed to be covered by tests for GeckoDriverService")
  @NoDriverBeforeTest
  public void canStartDriverWithSpecifiedBinary() {
    FirefoxBinary binary = spy(new FirefoxBinary());
    FirefoxOptions options = new FirefoxOptions()
      .setBinary(binary);

    localDriver = new WebDriverBuilder().get(options);

    verify(binary, atLeastOnce()).getPath();
  }

  @Test
  @NoDriverBeforeTest
  public void canStartDriverWithSpecifiedProfile() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", 1);
    profile.setPreference("browser.startup.homepage", pages.xhtmlTestPage);

    localDriver = new WebDriverBuilder().get(new FirefoxOptions().setProfile(profile));
    wait(localDriver).until($ -> "XHTML Test Page".equals(localDriver.getTitle()));
  }

  @Test
  @NoDriverBeforeTest
  public void canSetPreferencesInFirefoxOptions() {
    FirefoxOptions options = new FirefoxOptions()
      .addPreference("browser.startup.page", 1)
      .addPreference("browser.startup.homepage", pages.xhtmlTestPage);

    localDriver = new WebDriverBuilder().get(options);
    wait(localDriver).until($ -> "XHTML Test Page".equals(localDriver.getTitle()));
  }

  @Test
  @NoDriverBeforeTest
  public void canSetProfileInFirefoxOptions() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", 1);
    profile.setPreference("browser.startup.homepage", pages.xhtmlTestPage);

    FirefoxOptions options = new FirefoxOptions().setProfile(profile);

    localDriver = new WebDriverBuilder().get(options);
    wait(localDriver).until($ -> "XHTML Test Page".equals(localDriver.getTitle()));
  }

  @Test
  @Ignore(value = FIREFOX, reason = "Assumed to be covered by tests for GeckoDriverService")
  @NoDriverBeforeTest
  public void canSetBinaryInCapabilities() {
    FirefoxBinary binary = spy(new FirefoxBinary());
    Capabilities caps = new ImmutableCapabilities(FirefoxDriver.Capability.BINARY, binary);

    localDriver = new WebDriverBuilder().get(caps);

    verify(binary, atLeastOnce()).getPath();
  }

  @Test
  @NoDriverBeforeTest
  public void canSetBinaryPathInCapabilities() {
    String binPath = new FirefoxBinary().getPath();
    Capabilities caps = new ImmutableCapabilities(FirefoxDriver.Capability.BINARY, binPath);

    localDriver = new WebDriverBuilder().get(caps);
  }

  @Test
  @NoDriverBeforeTest
  public void canSetPreferencesAndProfileInFirefoxOptions() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", 1);
    profile.setPreference("browser.startup.homepage", pages.xhtmlTestPage);

    FirefoxOptions options = new FirefoxOptions()
      .setProfile(profile)
      .addPreference("browser.startup.homepage", pages.javascriptPage);

    localDriver = new WebDriverBuilder().get(options);
    wait(localDriver).until($ -> "Testing Javascript".equals(localDriver.getTitle()));
  }

  @Test
  public void shouldGetMeaningfulExceptionOnBrowserDeath() throws Exception {
    RemoteWebDriver driver2 = (RemoteWebDriver) new WebDriverBuilder().get();
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
    localDriver = new WebDriverBuilder().get();

    driver.get(pages.xhtmlTestPage);
    localDriver.get(pages.formPage);

    assertThat(driver.getTitle()).isEqualTo("XHTML Test Page");
    assertThat(localDriver.getTitle()).isEqualTo("We Leave From Here");
  }

  @Test
  @NoDriverBeforeTest
  public void shouldBeAbleToStartFromAUniqueProfile() {
    FirefoxProfile profile = new FirefoxProfile();
    localDriver = new WebDriverBuilder().get(new FirefoxOptions().setProfile(profile));
  }

  @Test
  @NoDriverBeforeTest
  public void aNewProfileShouldAllowSettingAdditionalParameters() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.homepage", pages.formPage);

    localDriver = new WebDriverBuilder().get(new FirefoxOptions().setProfile(profile));
    new WebDriverWait(localDriver, Duration.ofSeconds(30)).until(titleIs("We Leave From Here"));
    String title = localDriver.getTitle();

    assertThat(title).isEqualTo("We Leave From Here");
  }

  @Test
  @NoDriverBeforeTest
  public void shouldBeAbleToStartFromProfileWithLogFileSet() throws IOException {
    FirefoxProfile profile = new FirefoxProfile();
    File logFile = File.createTempFile("test", "firefox.log");
    logFile.deleteOnExit();

    profile.setPreference("webdriver.log.file", logFile.getAbsolutePath());

    localDriver = new WebDriverBuilder().get(new FirefoxOptions().setProfile(profile));
    assertThat(logFile).exists();
  }

  @Test
  @NoDriverBeforeTest
  public void shouldBeAbleToStartFromProfileWithLogFileSetToStdout() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("webdriver.log.file", "/dev/stdout");

    localDriver = new WebDriverBuilder().get(new FirefoxOptions().setProfile(profile));
  }

  @Test
  @NoDriverBeforeTest
  public void shouldBeAbleToStartANamedProfile() {
    FirefoxProfile profile = new ProfilesIni().getProfile("default");
    assumeTrue(profile != null);

    localDriver = new WebDriverBuilder().get(new FirefoxOptions().setProfile(profile));
  }

  @Test
  @Timeout(60)
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
  @NoDriverBeforeTest
  public void shouldBeAbleToPassCommandLineOptions() {
    FirefoxBinary binary = new FirefoxBinary();
    binary.addCommandLineOptions("-width", "800", "-height", "600");

    localDriver = new WebDriverBuilder().get(new FirefoxOptions().setBinary(binary));
    Dimension size = localDriver.manage().window().getSize();
    assertThat(size.width).isGreaterThanOrEqualTo(800);
    assertThat(size.width).isLessThan(850);
    assertThat(size.height).isGreaterThanOrEqualTo(600);
    assertThat(size.height).isLessThan(650);
  }

  @Test
  @NoDriverBeforeTest
  public void canBlockInvalidSslCertificates() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setAcceptUntrustedCertificates(false);

    localDriver = new WebDriverBuilder().get(new FirefoxOptions().setProfile(profile));
    Capabilities caps = ((HasCapabilities) localDriver).getCapabilities();
    assertThat(caps.is(ACCEPT_SSL_CERTS)).isFalse();
  }

  @Test
  @NoDriverBeforeTest
  public void shouldAllowUserToSuccessfullyOverrideTheHomePage() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", "1");
    profile.setPreference("browser.startup.homepage", pages.javascriptPage);

    localDriver = new WebDriverBuilder().get(new FirefoxOptions().setProfile(profile));
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
      private final String url;
      private volatile WebDriver myDriver;

      public FirefoxRunner(String url) {
        this.url = url;
      }

      @Override
      public void run() {
        myDriver = new WebDriverBuilder().get();
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

  @Test
  public void multipleFirefoxDriversRunningConcurrently() throws Exception {
    int numThreads = 6;
    final int numRoundsPerThread = 5;
    WebDriver[] drivers = new WebDriver[numThreads];
    List<Worker> workers = new ArrayList<>(numThreads);
    try {
      for (int i = 0; i < numThreads; ++i) {
        final WebDriver driver = (i == 0 ? super.driver : new WebDriverBuilder().get());
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
      one = new WebDriverBuilder().get(new FirefoxOptions().setProfile(profile));
      two = new WebDriverBuilder().get(new FirefoxOptions().setProfile(profile));

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
    new WebDriverBuilder().get(new FirefoxOptions().setProfile(new CustomFirefoxProfile())).quit();
    new WebDriverBuilder().get(new FirefoxOptions().setProfile(new FirefoxProfile() {
    })).quit();
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
  @NoDriverBeforeTest
  public void testFirefoxCanNativelyClickOverlappingElements() {
    FirefoxOptions options = new FirefoxOptions();
    options.setCapability(CapabilityType.OVERLAPPING_CHECK_DISABLED, true);
    localDriver = new WebDriverBuilder().get(options);
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

  @Test
  public void canAddRemoveExtensions() {
    Path extension = InProject.locate(EXT_PATH);

    String id = ((HasExtensions) driver).installExtension(extension);
    assertThat(id).isEqualTo("webextensions-selenium-example@example.com");

    try {
      ((HasExtensions) driver).uninstallExtension(id);
    } catch (WebDriverException ex) {
      fail(ex.getMessage());
    }
  }

  @Test
  public void canAddRemoveTempExtensions() {
    Path extension = InProject.locate(EXT_PATH);

    String id = ((HasExtensions) driver).installExtension(extension, true);
    assertThat(id).isEqualTo("webextensions-selenium-example@example.com");

    try {
      ((HasExtensions) driver).uninstallExtension(id);
    } catch (WebDriverException ex) {
      fail(ex.getMessage());
    }
  }

  @Test
  public void canAddRemoveTempExtensionsDirectory() {
    Path extension = InProject.locate(EXT_PATH_DIR);

    String id = ((HasExtensions) driver).installExtension(extension, true);
    assertThat(id).isEqualTo("webextensions-selenium-example@example.com");

    try {
      ((HasExtensions) driver).uninstallExtension(id);
    } catch (WebDriverException ex) {
      fail(ex.getMessage());
    }
  }

  @Test
  public void canTakeFullPageScreenshot() {
    File tempFile = ((HasFullPageScreenshot) driver).getFullPageScreenshotAs(OutputType.FILE);
    assertThat(tempFile.exists()).isTrue();
    assertThat(tempFile.length()).isGreaterThan(0);
  }

  @NeedsFreshDriver
  @NoDriverAfterTest
  @Test
  public void canSetContext() {
    HasContext context = (HasContext) driver;

    assertThat(context.getContext()).isEqualTo(FirefoxCommandContext.CONTENT);
    context.setContext(FirefoxCommandContext.CHROME);
    assertThat(context.getContext()).isEqualTo(FirefoxCommandContext.CHROME);
  }

  private static class CustomFirefoxProfile extends FirefoxProfile {

  }

}
