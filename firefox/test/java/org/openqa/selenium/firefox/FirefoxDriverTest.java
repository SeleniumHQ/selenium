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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;

import static org.openqa.selenium.Ignore.Driver.FIREFOX;

import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.Ignore;
import org.openqa.selenium.NeedsFreshDriver;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.internal.ProfilesIni;


public class FirefoxDriverTest extends AbstractDriverTestCase {
    public void testShouldContinueToWorkIfUnableToFindElementById() {
        driver.get(formPage);

        try {
            driver.findElement(By.id("notThere"));
            fail("Should not be able to select element by id here");
        } catch (NoSuchElementException e) {
            // This is expected
        }

        // Is this works, then we're golden
        driver.get(xhtmlTestPage);
    }

    @NeedsFreshDriver
    @Ignore(value = FIREFOX, reason = "Need to figure out how to open a new browser instance mid-test")
    public void testShouldWaitUntilBrowserHasClosedProperly() throws Exception {
      driver.get(simpleTestPage);
      driver.close();

      setUp();

      driver.get(formPage);
      WebElement textarea = driver.findElement(By.id("withText"));
      String expectedText = "I like cheese\n\nIt's really nice";
      textarea.sendKeys(expectedText);

      String seenText = textarea.getValue();
      assertThat(seenText, equalTo(expectedText));
    }

    public void testShouldBeAbleToStartMoreThanOneInstanceOfTheFirefoxDriverSimultaneously() {
      WebDriver secondDriver = new FirefoxDriver();

      driver.get(xhtmlTestPage);
      secondDriver.get(formPage);

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

    @Ignore(FIREFOX)
    public void testANewProfileShouldAllowSettingAdditionalParameters() {
      FirefoxProfile profile = new FirefoxProfile();
      profile.setPreference("browser.startup.homepage", formPage);

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

  public void testShouldBeAbleToStartANamedProfile() {
    FirefoxProfile profile = new ProfilesIni().getProfile("default");

//    if (profile != null) {
//      WebDriver firefox = new FirefoxDriver("default");
//      firefox.quit();
//    } else {
//      System.out.println("Not running start with named profile test: no default profile found");
//    }
  }

  public void testShouldBeAbleToStartANewInstanceEvenWithVerboseLogging() {
    FirefoxBinary binary = new FirefoxBinary();
    binary.setEnvironmentProperty("NSPR_LOG_MODULES", "all:5");

    // We will have an infinite hang if this driver does not start properly
    new FirefoxDriver(binary, null).quit();
  }
}
