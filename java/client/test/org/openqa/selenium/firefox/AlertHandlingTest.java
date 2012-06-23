/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.remote.CapabilityType.UNEXPECTED_ALERT_BEHAVIOUR;
import static org.junit.Assert.assertTrue;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.UnexpectedAlertBehaviour;
import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;

/**
 * Checks various options to deal with unhandled alerts.
 */
@NeedsLocalEnvironment(reason = "Requires local browser launching environment")
public class AlertHandlingTest extends JUnit4TestBase {
  private FirefoxDriver driver2;

  @After
  public void tearDown() throws Exception {
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
      assertTrue("Exception not thrown", false);
    } catch (UnhandledAlertException ex) {
      // this is expected
    }
    driver2.switchTo().alert().dismiss();
  }
  
  @Test
  public void canSpecifyUnhandledAlertBehaviourUsingCapabilities() {
    DesiredCapabilities caps = DesiredCapabilities.firefox();
    caps.setCapability(UNEXPECTED_ALERT_BEHAVIOUR, UnexpectedAlertBehaviour.ACCEPT);
    driver2 = new FirefoxDriver(caps);
    driver2.get(pages.alertsPage);
    driver2.findElement(By.id("prompt-with-default")).click();
    try {
      driver2.findElement(By.id("text")).getText();
    } catch (UnhandledAlertException ex) {
      // this is expected
    }
    waitFor(elementTextToEqual(driver2, By.id("text"), "This is a default value"));
  }

  private void runScenarioWithUnhandledAlert(UnexpectedAlertBehaviour behaviour, String text) {
    FirefoxProfile p = new FirefoxProfile();
    if (behaviour != null) {
      p.setUnexpectedAlertBehaviour(behaviour);
    }
    driver2 = new FirefoxDriver(p);
    driver2.get(pages.alertsPage);
    driver2.findElement(By.id("prompt-with-default")).click();
    try {
      driver2.findElement(By.id("text")).getText();
    } catch (UnhandledAlertException ex) {
      // this is expected
    }
    waitFor(elementTextToEqual(driver2, By.id("text"), text));
  }
}
