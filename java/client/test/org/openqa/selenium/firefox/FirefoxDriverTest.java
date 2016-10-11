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

import static java.lang.Thread.sleep;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.lessThan;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.Driver.MARIONETTE;

import com.google.common.base.Throwables;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.ParallelTestRunner;
import org.openqa.selenium.ParallelTestRunner.Worker;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.firefox.internal.ProfilesIni;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.UnreachableBrowserException;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.DevMode;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.drivers.SauceDriver;
import org.openqa.selenium.testing.drivers.SynthesizedFirefoxDriver;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Set;

@NeedsLocalEnvironment(reason = "Requires local browser launching environment")
@Ignore(MARIONETTE)
public class FirefoxDriverTest extends JUnit4TestBase {
  @Test
  public void shouldContinueToWorkIfUnableToFindElementById() {
    driver.get(pages.formPage);
    try {
      driver.findElement(By.id("notThere"));
      fail("Should not be able to select element by id here");
    } catch (NoSuchElementException e) {
      // This is expected
    }
    // Is this works, then we're golden
    driver.get(pages.xhtmlTestPage);
  }

  private static class ConnectionCapturingDriver extends FirefoxDriver {
    public ExtensionConnection keptConnection;

    public ConnectionCapturingDriver() {
      super();
    }

    @Override
    protected ExtensionConnection connectTo(FirefoxBinary binary, FirefoxProfile profile, String host) {
      this.keptConnection = super.connectTo(binary, profile, host);

      return keptConnection;
    }
  }

  @Test
  public void shouldGetMeaningfulExceptionOnBrowserDeath() {
    ConnectionCapturingDriver driver2 = new ConnectionCapturingDriver();
    driver2.get(pages.formPage);

    try {
      driver2.keptConnection.quit();
      driver2.get(pages.formPage);
      fail("Should have thrown.");
    } catch (UnreachableBrowserException e) {
      assertThat("Must contain descriptive error", e.getMessage(),
          containsString("Error communicating with the remote browser"));
    }
  }


  @NeedsFreshDriver
  @Test
  public void shouldWaitUntilBrowserHasClosedProperly() throws Exception {
    driver.get(pages.simpleTestPage);
    driver.quit();
    JUnit4TestBase.removeDriver();

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
    WebDriver secondDriver = newFirefoxDriver();

    driver.get(pages.xhtmlTestPage);
    secondDriver.get(pages.formPage);

    assertThat(driver.getTitle(), is("XHTML Test Page"));
    assertThat(secondDriver.getTitle(), is("We Leave From Here"));

    // We only need to quit the second driver if the test passes
    secondDriver.quit();
  }

  @Test
  public void shouldBeAbleToStartFromAUniqueProfile() {
    FirefoxProfile profile = new FirefoxProfile();

    try {
      WebDriver secondDriver = newFirefoxDriver(profile);
      secondDriver.quit();
    } catch (Exception e) {
      e.printStackTrace();
      fail("Expected driver to be created successfully");
    }
  }

  @Test
  public void aNewProfileShouldAllowSettingAdditionalParameters() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.homepage", pages.formPage);

    try {
      WebDriver secondDriver = newFirefoxDriver(profile);
      new WebDriverWait(secondDriver, 30).until(titleIs("We Leave From Here"));
      String title = secondDriver.getTitle();
      secondDriver.quit();

      assertThat(title, is("We Leave From Here"));
    } catch (Exception e) {
      e.printStackTrace();
      fail("Expected driver to be created successfully");
    }
  }

  @Test
  public void shouldBeAbleToStartFromProfileWithLogFileSet() throws IOException {
    FirefoxProfile profile = new FirefoxProfile();
    File logFile = File.createTempFile("test", "firefox.log");
    logFile.deleteOnExit();

    profile.setPreference("webdriver.log.file", logFile.getAbsolutePath());

    try {
      WebDriver secondDriver = newFirefoxDriver(profile);
      assertTrue("log file should exist", logFile.exists());
      secondDriver.quit();
    } catch (Exception e) {
      e.printStackTrace();
      fail("Expected driver to be created successfully");
    }
  }

  @Test
  public void shouldBeAbleToStartFromProfileWithLogFileSetToStdout() throws IOException {
    FirefoxProfile profile = new FirefoxProfile();

    profile.setPreference("webdriver.log.file", "/dev/stdout");

    try {
      WebDriver secondDriver = newFirefoxDriver(profile);
      secondDriver.quit();
    } catch (Exception e) {
      e.printStackTrace();
      fail("Expected driver to be created successfully");
    }
  }

  @Test
  public void shouldBeAbleToStartANamedProfile() {
    FirefoxProfile profile = new ProfilesIni().getProfile("default");

    if (profile != null) {
      WebDriver firefox = newFirefoxDriver(profile);
      firefox.quit();
    } else {
      System.out.println("Not running start with named profile test: no default profile found");
    }
  }

  @Test(timeout = 60000)
  public void shouldBeAbleToStartANewInstanceEvenWithVerboseLogging() {
    FirefoxBinary binary = new FirefoxBinary();
    binary.setEnvironmentProperty("NSPR_LOG_MODULES", "all:5");

    // We will have an infinite hang if this driver does not start properly
    new FirefoxDriver(binary, null).quit();
  }

  @Test
  public void shouldBeAbleToPassCommandLineOptions() {
    FirefoxBinary binary = new FirefoxBinary();
    binary.addCommandLineOptions("-width", "800", "-height", "600");

    FirefoxDriver driver2 = null;
    try {
      driver2 = new FirefoxDriver(binary, null);
      Dimension size = driver2.manage().window().getSize();
      assertThat(size.width, greaterThanOrEqualTo(800));
      assertThat(size.width, lessThan(850));
      assertThat(size.height, greaterThanOrEqualTo(600));
      assertThat(size.height, lessThan(650));
    } finally {
      if (driver2 != null) {
        driver2.quit();
      }
    }
  }

  private static boolean platformHasNativeEvents() {
    return FirefoxDriver.DEFAULT_ENABLE_NATIVE_EVENTS;
  }

  private void sleepBecauseWindowsTakeTimeToOpen() {
    try {
      sleep(1000);
    } catch (InterruptedException e) {
      fail("Interrupted");
    }
  }

  @NeedsFreshDriver
  @NoDriverAfterTest
  @Test
  public void focusRemainsInOriginalWindowWhenOpeningNewWindow() {
    assumeTrue(platformHasNativeEvents());

    // Scenario: Open a new window, make sure the current window still gets
    // native events (keyboard events in this case).

    driver.get(pages.xhtmlTestPage);

    driver.findElement(By.name("windowOne")).click();

    sleepBecauseWindowsTakeTimeToOpen();

    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("ABC DEF");

    assertThat(keyReporter.getAttribute("value"), is("ABC DEF"));
  }

  @NeedsFreshDriver
  @NoDriverAfterTest
  @Test
  public void switchingWindowSwitchesFocus() {
    assumeTrue(platformHasNativeEvents());

    // Scenario: Open a new window, switch to it, make sure it gets native events.
    // Then switch back to the original window, make sure it gets native events.

    driver.get(pages.xhtmlTestPage);

    String originalWinHandle = driver.getWindowHandle();

    driver.findElement(By.name("windowOne")).click();

    sleepBecauseWindowsTakeTimeToOpen();

    Set<String> allWindowHandles = driver.getWindowHandles();

    // There should be two windows. We should also see each of the window titles at least once.
    assertEquals(2, allWindowHandles.size());

    allWindowHandles.remove(originalWinHandle);
    String newWinHandle = (String) allWindowHandles.toArray()[0];

    // Key events in new window.
    driver.switchTo().window(newWinHandle);
    sleepBecauseWindowsTakeTimeToOpen();
    driver.get(pages.javascriptPage);

    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("ABC DEF");
    assertThat(keyReporter.getAttribute("value"), is("ABC DEF"));

    // Key events in original window.
    driver.switchTo().window(originalWinHandle);
    sleepBecauseWindowsTakeTimeToOpen();
    driver.get(pages.javascriptPage);

    WebElement keyReporter2 = driver.findElement(By.id("keyReporter"));
    keyReporter2.sendKeys("QWERTY");
    assertThat(keyReporter2.getAttribute("value"), is("QWERTY"));
  }

  @NeedsFreshDriver
  @NoDriverAfterTest
  @Test
  public void closingWindowAndSwitchingToOriginalSwitchesFocus() {
    assumeTrue(platformHasNativeEvents());

    // Scenario: Open a new window, switch to it, close it, switch back to the
    // original window - make sure it gets native events.

    driver.get(pages.xhtmlTestPage);
    String originalWinHandle = driver.getWindowHandle();

    driver.findElement(By.name("windowOne")).click();

    sleepBecauseWindowsTakeTimeToOpen();

    Set<String> allWindowHandles = driver.getWindowHandles();
    // There should be two windows. We should also see each of the window titles at least once.
    assertEquals(2, allWindowHandles.size());

    allWindowHandles.remove(originalWinHandle);
    String newWinHandle = (String) allWindowHandles.toArray()[0];
    // Switch to the new window.
    driver.switchTo().window(newWinHandle);
    sleepBecauseWindowsTakeTimeToOpen();
    // Close new window.
    driver.close();

    // Switch back to old window.
    driver.switchTo().window(originalWinHandle);
    sleepBecauseWindowsTakeTimeToOpen();

    // Send events to the new window.
    driver.get(pages.javascriptPage);
    WebElement keyReporter = driver.findElement(By.id("keyReporter"));
    keyReporter.sendKeys("ABC DEF");
    assertThat(keyReporter.getAttribute("value"), is("ABC DEF"));
  }

  @Test
  public void canBlockInvalidSslCertificates() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setAcceptUntrustedCertificates(false);
    String url = GlobalTestEnvironment.get().getAppServer().whereIsSecure("simpleTest.html");

    WebDriver secondDriver = null;
    try {
      secondDriver = newFirefoxDriver(profile);
      secondDriver.get(url);
      String gotTitle = secondDriver.getTitle();
      assertFalse("Hello WebDriver".equals(gotTitle));
    } catch (Exception e) {
      e.printStackTrace();
      fail("Creating driver with untrusted certificates set to false failed.");
    } finally {
      if (secondDriver != null) {
        secondDriver.quit();
      }
    }
  }

  @Test
  public void shouldAllowUserToSuccessfullyOverrideTheHomePage() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", "1");
    profile.setPreference("browser.startup.homepage", pages.javascriptPage);

    final WebDriver driver2 = newFirefoxDriver(profile);

    try {
      new WebDriverWait(driver2, 30).until(urlToBe(pages.javascriptPage));
    } finally {
      driver2.quit();
    }
  }

  private ExpectedCondition<Boolean> urlToBe(final String expectedUrl) {
    return driver1 -> expectedUrl.equals(driver1.getCurrentUrl());
  }

  @Test
  public void canAccessUrlProtectedByBasicAuth() {
    driver.get(appServer.whereIsWithCredentials("basicAuth", "test", "test"));
    assertEquals("authorized", driver.findElement(By.tagName("h1")).getText());
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

      public void run() {
        myDriver = newFirefoxDriver();
        myDriver.get(url);
      }

      public void quit() {
        if (myDriver != null) {
          myDriver.quit();
        }
      }

      public void assertOnRightPage() {
        assertEquals(url, myDriver.getCurrentUrl());
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
      runnable1.assertOnRightPage();
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
    int numThreads;
    if (!SauceDriver.shouldUseSauce()) {
      numThreads = 6;
    } else {
      numThreads = 2;
    }
    final int numRoundsPerThread = 5;
    WebDriver[] drivers = new WebDriver[numThreads];
    List<Worker> workers = new ArrayList<>(numThreads);
    try {
      for (int i = 0; i < numThreads; ++i) {
        final WebDriver driver = (i == 0 ? super.driver : newFirefoxDriver());
        drivers[i] = driver;
        workers.add(new Worker() {
          public void run() throws Exception {
            driver.get(pages.formPage);
            WebElement inputField = driver.findElement(By.id("working"));
            for (int i = 0; i < numRoundsPerThread; ++i) {
              String s = randomString();
              inputField.clear();
              inputField.sendKeys(s);
              String value = inputField.getAttribute("value");
              assertThat(value, is(s));
            }
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
      one = newFirefoxDriver(profile);
      two = newFirefoxDriver(profile);

      // If we get this far, then both firefoxes have started. If this test
      // two browsers will start, but the second won't have a valid port and an
      // exception will be thrown. Hurrah! Test passes.
    } finally {
      if (one != null) one.quit();
      if (two != null) two.quit();
    }
  }

  // See http://code.google.com/p/selenium/issues/detail?id=1774
  @Test
  public void canStartFirefoxDriverWithSubclassOfFirefoxProfile() {
    new FirefoxDriver(new CustomFirefoxProfile()).quit();
    new FirefoxDriver(new FirefoxProfile() {}).quit();
  }

  /**
   * Tests that we do not pollute the global namespace with Sizzle in Firefox 3.
   */
  @Test
  public void searchingByCssDoesNotPolluteGlobalNamespaceWithSizzleLibrary() {
    driver.get(pages.xhtmlTestPage);
    driver.findElement(By.cssSelector("div.content"));
    assertEquals(true,
        ((JavascriptExecutor) driver).executeScript("return typeof Sizzle == 'undefined';"));
  }

  @Test
  @NeedsLocalEnvironment
  public void constructorArgsAreNullable() {
    new SynthesizedFirefoxDriver((Capabilities)null).quit();
  }
  /**
   * Tests that we do not pollute the global namespace with Sizzle in Firefox 3.
   */
  @Test
  public void searchingByCssDoesNotOverwriteExistingSizzleDefinition() {
    driver.get(pages.xhtmlTestPage);
    ((JavascriptExecutor) driver).executeScript("window.Sizzle = 'original sizzle value';");
    driver.findElement(By.cssSelector("div.content"));
    assertEquals("original sizzle value",
        ((JavascriptExecutor) driver).executeScript("return window.Sizzle + '';"));
  }

  @Test
  public void testFirefoxCanNativelyClickOverlappingElements() {
    DesiredCapabilities capabilities = new DesiredCapabilities();
    capabilities.setCapability(CapabilityType.OVERLAPPING_CHECK_DISABLED, true);
    WebDriver secondDriver = new FirefoxDriver(capabilities);
    try {
      secondDriver.get(appServer.whereIs("click_tests/overlapping_elements.html"));
      secondDriver.findElement(By.id("under")).click();
      assertEquals(secondDriver.findElement(By.id("log")).getText(),
                   "Log:\n"
                   + "mousedown in over (handled by over)\n"
                   + "mousedown in over (handled by body)\n"
                   + "mouseup in over (handled by over)\n"
                   + "mouseup in over (handled by body)\n"
                   + "click in over (handled by over)\n"
                   + "click in over (handled by body)");
    } finally {
      secondDriver.quit();
    }
  }



  private WebDriver newFirefoxDriver() {
    return newFirefoxDriver(new FirefoxProfile());
  }

  private WebDriver newFirefoxDriver(FirefoxProfile profile) {
    if (DevMode.isInDevMode()) {
      try {
        return new SynthesizedFirefoxDriver(profile);
      } catch (Exception e) {
        throw Throwables.propagate(e);
      }
    }
    return new FirefoxDriver(profile);
  }

  private static class CustomFirefoxProfile extends FirefoxProfile {}
}
