/*
Copyright 2012 Software Freedom Conservancy
Copyright 2007-2012 Selenium committers

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

package org.openqa.selenium;

import static org.junit.Assert.fail;
import static org.junit.Assume.assumeTrue;

import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.remote.CapabilityType.UNEXPECTED_ALERT_BEHAVIOUR;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

import org.junit.After;
import org.junit.Test;

import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

@NeedsLocalEnvironment(reason = "Requires local browser launching environment")
@Ignore(value = {ANDROID, CHROME, HTMLUNIT, IPHONE, OPERA, SAFARI, SELENESE, OPERA_MOBILE},
        issues = {3862})
public class UnexpectedAlertBehaviorTest extends JUnit4TestBase {

  private WebDriver driver2;
  private DesiredCapabilities desiredCaps = new DesiredCapabilities();

  @After
  public void quitDriver() throws Exception {
    if (driver2 != null) {
      driver2.quit();
    }
  }

  @Test
  public void canAcceptUnhandledAlert() {
    runScenarioWithUnhandledAlert(UnexpectedAlertBehaviour.ACCEPT, "This is a default value");
  }

  @Test
  public void canDismissUnhandledAlert() {
    runScenarioWithUnhandledAlert(UnexpectedAlertBehaviour.DISMISS, "null");
  }

  @Test
  public void dismissUnhandledAlertsByDefault() {
    runScenarioWithUnhandledAlert(null, "null");
  }

  @Test
  public void canIgnoreUnhandledAlert() {
    try {
      runScenarioWithUnhandledAlert(UnexpectedAlertBehaviour.IGNORE, "Text ignored");
      fail("Exception not thrown");
    } catch (UnhandledAlertException ex) {
      // this is expected
    }
    driver2.switchTo().alert().dismiss();
  }

  @Test
  public void canSpecifyUnhandledAlertBehaviourUsingCapabilities() {
    desiredCaps.setCapability(UNEXPECTED_ALERT_BEHAVIOUR, UnexpectedAlertBehaviour.ACCEPT);
    driver2 = new WebDriverBuilder().setDesiredCapabilities(desiredCaps).get();

    runScenarioWithUnhandledAlert("This is a default value");
  }
  
  @Test
  @Ignore(value = {IE}, reason = "IE: required capabilities not implemented")
  public void requiredUnhandledAlertCapabilityHasPriorityOverDesired() {
    // TODO: Resolve why this test doesn't work on the remote server
    assumeTrue(TestUtilities.isLocal());
    
    desiredCaps.setCapability(UNEXPECTED_ALERT_BEHAVIOUR, UnexpectedAlertBehaviour.DISMISS);
    DesiredCapabilities requiredCaps = new DesiredCapabilities();
    requiredCaps.setCapability(UNEXPECTED_ALERT_BEHAVIOUR, UnexpectedAlertBehaviour.ACCEPT);
    WebDriverBuilder builder = new WebDriverBuilder().setDesiredCapabilities(desiredCaps).
        setRequiredCapabilities(requiredCaps);
    driver2 = builder.get();        
    
    runScenarioWithUnhandledAlert("This is a default value");
  }

  private void runScenarioWithUnhandledAlert(UnexpectedAlertBehaviour behaviour, 
      String expectedAlertText) {
    if (behaviour != null) {
      desiredCaps.setCapability(UNEXPECTED_ALERT_BEHAVIOUR, behaviour);
    }
    driver2 = new WebDriverBuilder().setDesiredCapabilities(desiredCaps).get();
    runScenarioWithUnhandledAlert(expectedAlertText);
  }
  
  private void runScenarioWithUnhandledAlert(String expectedAlertText) {
    driver2.get(pages.alertsPage);
    driver2.findElement(By.id("prompt-with-default")).click();
    try {
      driver2.findElement(By.id("text")).getText();
    } catch (UnhandledAlertException expected) {
    }
    waitFor(elementTextToEqual(driver2, By.id("text"), expectedAlertText));
  }

}