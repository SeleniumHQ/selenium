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

import static java.lang.Thread.sleep;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.fail;
import static org.openqa.selenium.DevMode.isInDevMode;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;

import org.junit.Assert;
import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.Ignore;
import org.openqa.selenium.NeedsFreshDriver;
import org.openqa.selenium.NoDriverAfterTest;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.firefox.internal.ProfilesIni;

import java.util.Set;


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

      String seenText = textarea.getValue();
      assertThat(seenText, equalTo(expectedText));
    }

  public void testShouldBeAbleToStartMoreThanOneInstanceOfTheFirefoxDriverSimultaneously() {
    WebDriver secondDriver = new FirefoxDriver();

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
        WebDriver secondDriver = new FirefoxDriver(profile);
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
        WebDriver secondDriver = new FirefoxDriver(profile);
        String title = secondDriver.getTitle();
        secondDriver.quit();

        assertThat(title, is("We Leave From Here"));
      } catch (Exception e) {
        e.printStackTrace();
        fail("Expected driver to be created succesfully");
      }
    }

  @Ignore
  public void testShouldBeAbleToStartANamedProfile() {
    FirefoxProfile profile = new ProfilesIni().getProfile("default");

    if (profile != null) {
      WebDriver firefox = new FirefoxDriver(profile);
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

    assertThat(keyReporter.getValue(), is("ABC DEF"));
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
    assertThat(keyReporter.getValue(), is("ABC DEF"));
    
    // Key events in original window.
    driver.switchTo().window(originalWinHandle);
    sleepBecauseWindowsTakeTimeToOpen();
    driver.get(pages.javascriptPage);

    WebElement keyReporter2 = driver.findElement(By.id("keyReporter"));
    keyReporter2.sendKeys("QWERTY");
    assertThat(keyReporter2.getValue(), is("QWERTY"));
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
    assertThat(keyReporter.getValue(), is("ABC DEF"));
  }
  
  public void testCanBlockInvalidSslCertificates() {
    FirefoxProfile profile = new FirefoxProfile();
    profile.setAcceptUntrustedCertificates(false);
    String url = GlobalTestEnvironment.get().getAppServer().whereIsSecure("simpleTest.html");

    WebDriver secondDriver = null;
    try {
      secondDriver = new FirefoxDriver(profile);
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

    WebDriver driver2 = new FirefoxDriver(profile);

    try {
      assertEquals(pages.javascriptPage, driver2.getCurrentUrl());
    } finally {
      driver2.quit();
    }
  }

  public void testShouldAllowTwoInstancesOfFirefoxAtTheSameTimeInDifferentThreads()
      throws InterruptedException {
    class FirefoxRunner implements Runnable {
      private WebDriver myDriver;
      private String url;

      public FirefoxRunner(String url) {
        this.url = url;
      }

      public void run() {
        if (isInDevMode()) {
          myDriver = new FirefoxDriverTestSuite.TestFirefoxDriver();
        } else {
          myDriver = new FirefoxDriver();
        }

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
}
