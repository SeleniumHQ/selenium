/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

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

package org.openqa.selenium.firefox;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.Callable;
import java.io.File;

import com.google.common.base.Throwables;
import org.junit.Assert;
import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.DevMode;
import org.openqa.selenium.Ignore;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NeedsFreshDriver;
import org.openqa.selenium.NoDriverAfterTest;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.ParallelTestRunner;
import org.openqa.selenium.ParallelTestRunner.Worker;
import org.openqa.selenium.Platform;
import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.firefox.internal.ProfilesIni;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.RemoteWebDriver;

import static java.lang.Thread.sleep;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.pageTitleToBe;


public class FirefoxDriverTest extends AbstractDriverTestCase {
  public void testShouldContinueToWorkIfUnableToFindElementById() {
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

  @NeedsFreshDriver
  @Ignore(value = FIREFOX, reason = "Need to figure out how to open a new browser instance mid-test")
  public void testShouldWaitUntilBrowserHasClosedProperly() throws Exception {
    driver.get(pages.simpleTestPage);
    driver.close();
    setUp();

    driver.get(pages.formPage);
    WebElement textarea = driver.findElement(By.id("withText"));
    String expectedText = "I like cheese\n\nIt's really nice";
    textarea.sendKeys(expectedText);
    String seenText = textarea.getAttribute("value");
    assertThat(seenText, equalTo(expectedText));
  }

  public void testShouldBeAbleToStartMoreThanOneInstanceOfTheFirefoxDriverSimultaneously() {
    WebDriver secondDriver = newFirefoxDriver();

    driver.get(pages.xhtmlTestPage);
    secondDriver.get(pages.formPage);

    assertThat(driver.getTitle(), is("XHTML Test Page"));
    assertThat(secondDriver.getTitle(), is("We Leave From Here"));

    // We only need to quit the second driver if the test passes
    secondDriver.quit();
  }

  public void testShouldBeAbleToStartFromAUniqueProfile() {
    FirefoxProfile profile = new FirefoxProfile();

    try {
      WebDriver secondDriver = newFirefoxDriver(profile);
      secondDriver.quit();
    } catch (Exception e) {
      e.printStackTrace();
      fail("Expected driver to be created succesfully");
    }
  }

  public void testANewProfileShouldAllowSettingAdditionalParameters() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.homepage", pages.formPage);

    try {
      WebDriver secondDriver = newFirefoxDriver(profile);
      waitFor(pageTitleToBe(secondDriver, "We Leave From Here"));
      String title = secondDriver.getTitle();
      secondDriver.quit();

      assertThat(title, is("We Leave From Here"));
    } catch (Exception e) {
      e.printStackTrace();
      fail("Expected driver to be created succesfully");
    }
  }

  public void testShouldBeAbleToStartFromProfileWithLogFileSet() {
    FirefoxProfile profile = new FirefoxProfile();
    File destDir = TemporaryFilesystem.getDefaultTmpFS().createTempDir("webdriver", "logging-profile");
    File logFile = new File(destDir, "firefox.log");

    profile.setPreference("webdriver.log.file", logFile.getAbsolutePath());

    try {
      WebDriver secondDriver = newFirefoxDriver(profile);
      assertTrue("log file should exist", logFile.exists());
      secondDriver.quit();
    } catch (Exception e) {
      e.printStackTrace();
      fail("Expected driver to be created succesfully");
    }
  }

  @Ignore
  public void testShouldBeAbleToStartANamedProfile() {
    FirefoxProfile profile = new ProfilesIni().getProfile("default");

    if (profile != null) {
      WebDriver firefox = newFirefoxDriver(profile);
      firefox.quit();
    } else {
      System.out.println("Not running start with named profile test: no default profile found");
    }
  }

  public void testShouldBeAbleToStartANewInstanceEvenWithVerboseLogging() {
    FirefoxBinary binary = new FirefoxBinary();
    binary.setEnvironmentProperty("NSPR_LOG_MODULES", "all:5");

    // We will have an infinite hang if this driver does not start properly
    new FirefoxDriver(binary, null).quit();
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
  public void testFocusRemainsInOriginalWindowWhenOpeningNewWindow() {
    if (platformHasNativeEvents() == false) {
      return;
    }
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
  public void testSwitchingWindowSwitchesFocus() {
    if (platformHasNativeEvents() == false) {
      return;
    }
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
  public void testClosingWindowAndSwitchingToOriginalSwitchesFocus() {
    if (platformHasNativeEvents() == false) {
      return;
    }
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

  public void testCanBlockInvalidSslCertificates() {
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

  public void testShouldAllowUserToSuccessfullyOverrideTheHomePage() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.page", "1");
    profile.setPreference("browser.startup.homepage", pages.javascriptPage);

    WebDriver driver2 = newFirefoxDriver(profile);

    try {
      assertEquals(pages.javascriptPage, driver2.getCurrentUrl());
    } finally {
      driver2.quit();
    }
  }

  @Ignore(value = FIREFOX,
      reason = "Reworking alert handling. First step: removing existing broken alert support")
  public void testShouldThrowWhenAlertNotHandled() {
    WebDriver firefox = newFirefoxDriver();
    firefox.get(pages.alertsPage);

    try {
      WebElement alert = firefox.findElement(By.id("alert"));
      alert.click();

      Boolean exceptionThrown = waitFor(
          unhandledAlertExceptionToBeThrown(firefox));

      assertTrue("Should have thrown an UnhandledAlertException", exceptionThrown);
    } finally {
      firefox.quit();
    }
  }

  private Callable<Boolean> unhandledAlertExceptionToBeThrown(final WebDriver driver) {
    return new Callable<Boolean>() {

      public Boolean call() throws Exception {
        try {
          driver.getTitle();
          return false;
        } catch (UnhandledAlertException e) {
          return true;
        }
      }
    };
  }

  public void testShouldAllowTwoInstancesOfFirefoxAtTheSameTimeInDifferentThreads()
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
        Assert.assertEquals(url, myDriver.getCurrentUrl());
      }
    }

    FirefoxRunner runnable1 = new FirefoxRunner(pages.formPage);
    Thread thread1 = new Thread(runnable1);
    FirefoxRunner runnable2 = new FirefoxRunner(pages.xhtmlTestPage);
    Thread thread2 = new Thread(runnable2);

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

  private static char[] CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!\"§$%&/()+*~#',.-_:;\\".toCharArray();
  private static Random RANDOM = new Random();

  private static String randomString() {
    int n = 20 + RANDOM.nextInt(80);
    StringBuilder sb = new StringBuilder(n);
    for (int i = 0; i < n; ++i) {
      sb.append(CHARS[RANDOM.nextInt(CHARS.length)]);
    }
    return sb.toString();
  }

  public void testMultipleFirefoxDriversRunningConcurrently() throws Exception {
    // Unfortunately native events on linux mean mucking around with the
    // window's focus. this breaks multiple drivers.
    boolean nativeEventsEnabled =
        (Boolean) ((RemoteWebDriver) driver).getCapabilities().getCapability("nativeEvents");

    if (nativeEventsEnabled && Platform.getCurrent().is(Platform.LINUX)) {
      return;
    }

    int numThreads = 10;
    final int numRoundsPerThread = 50;
    WebDriver[] drivers = new WebDriver[numThreads];
    List<Worker> workers = new ArrayList<Worker>(numThreads);
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
          } catch (RuntimeException ignored) {}
        }
      }
    }
  }

  public void testShouldBeAbleToUseTheSameProfileMoreThanOnce() {
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

  public void testCanCallQuitTwiceWithoutThrowingAnException() {
    WebDriver instance = newFirefoxDriver();

    instance.quit();
    instance.quit();
  }

  public void testAnExceptionThrownIfUsingAQuittedInstance() {
    WebDriver instance = newFirefoxDriver();

    instance.quit();
    try {
      instance.get(pages.xhtmlTestPage);
      fail("Expected an exception to be thrown because the instance is dead.");
    } catch (WebDriverException e) {
      assertTrue(e.getMessage().contains("cannot be used after quit"));
    }

  }

  // See http://code.google.com/p/selenium/issues/detail?id=1774
  public void testCanStartFirefoxDriverWithSubclassOfFirefoxProfile() {
    new FirefoxDriver(new CustomFirefoxProfile()).quit();
    new FirefoxDriver(new FirefoxProfile(){}).quit();
  }

  /**
   * Tests that we do not pollute the global namespace with Sizzle in Firefox 3.
   */
  public void testSearchingByCssDoesNotPolluteGlobalNamespaceWithSizzleLibrary() {
    driver.get(pages.xhtmlTestPage);
    driver.findElement(By.cssSelector("div.content"));
    assertEquals(true,
        ((JavascriptExecutor) driver).executeScript("return typeof Sizzle == 'undefined';"));
  }

  /**
   * Tests that we do not pollute the global namespace with Sizzle in Firefox 3.
   */
  public void testSearchingByCssDoesNotOverwriteExistingSizzleDefinition() {
    driver.get(pages.xhtmlTestPage);
    ((JavascriptExecutor) driver).executeScript("window.Sizzle = 'original sizzle value';");
    driver.findElement(By.cssSelector("div.content"));
    assertEquals("original sizzle value",
        ((JavascriptExecutor) driver).executeScript("return window.Sizzle + '';"));
  }

  private WebDriver newFirefoxDriver() {
    return newFirefoxDriver(new FirefoxProfile());
  }

  private WebDriver newFirefoxDriver(FirefoxProfile profile) {
    if (DevMode.isInDevMode()) {
      try {
        return new FirefoxDriverTestSuite.TestFirefoxDriver(profile);
      } catch (Exception e) {
        throw Throwables.propagate(e);
      }
    }
    return new FirefoxDriver(profile);
  }

  private static class CustomFirefoxProfile extends FirefoxProfile {}
}
