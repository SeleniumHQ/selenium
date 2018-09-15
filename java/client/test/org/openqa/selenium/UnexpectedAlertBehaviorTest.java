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

package org.openqa.selenium;

import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.UnexpectedAlertBehaviour.IGNORE;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.remote.CapabilityType.UNEXPECTED_ALERT_BEHAVIOUR;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.FIREFOX;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.SAFARI;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

@NeedsLocalEnvironment(reason = "Requires local browser launching environment")
@Ignore(value = SAFARI, reason = "Does not support alerts yet")
public class UnexpectedAlertBehaviorTest extends JUnit4TestBase {

  private WebDriver driver2;

  @After
  public void quitDriver() {
    if (driver2 != null) {
      driver2.quit();
    }
  }

  @Test
  @Ignore(value = FIREFOX, reason = "Legacy behaviour, not W3C conformant")
  @Ignore(value = CHROME, reason = "Legacy behaviour, not W3C conformant")
  @Ignore(value = HTMLUNIT, reason = "Legacy behaviour, not W3C conformant")
  public void canAcceptUnhandledAlert() {
    runScenarioWithUnhandledAlert(UnexpectedAlertBehaviour.ACCEPT_AND_NOTIFY, "This is a default value", false);
  }

  @Test
  @Ignore(value = FIREFOX, reason = "Legacy behaviour, not W3C conformant")
  @Ignore(value = CHROME, reason = "Legacy behaviour, not W3C conformant")
  @Ignore(value = HTMLUNIT, reason = "Legacy behaviour, not W3C conformant")
  public void canSilentlyAcceptUnhandledAlert() {
    runScenarioWithUnhandledAlert(UnexpectedAlertBehaviour.ACCEPT, "This is a default value", true);
  }

  @Test
  @Ignore(value = CHROME, reason = "Unstable Chrome behavior")
  @Ignore(value = HTMLUNIT, reason = "Legacy behaviour, not W3C conformant")
  public void canDismissUnhandledAlert() {
    runScenarioWithUnhandledAlert(UnexpectedAlertBehaviour.DISMISS_AND_NOTIFY, "null", false);
  }

  @Test
  @Ignore(value = FIREFOX, reason = "Legacy behaviour, not W3C conformant")
  @Ignore(value = CHROME, reason = "Legacy behaviour, not W3C conformant")
  @Ignore(value = HTMLUNIT, reason = "Legacy behaviour, not W3C conformant")
  public void canSilentlyDismissUnhandledAlert() {
    runScenarioWithUnhandledAlert(UnexpectedAlertBehaviour.DISMISS, "null", true);
  }

  @Test
  @Ignore(value = CHROME, reason = "Chrome uses IGNORE mode by default")
  public void canDismissUnhandledAlertsByDefault() {
    runScenarioWithUnhandledAlert(null, "null", false);
  }

  @Test
  @Ignore(value = CHROME, reason = "Unstable Chrome behavior")
  public void canIgnoreUnhandledAlert() {
    assertThatExceptionOfType(UnhandledAlertException.class).isThrownBy(
        () -> runScenarioWithUnhandledAlert(IGNORE, "Text ignored", true));
    driver2.switchTo().alert().dismiss();
  }

  private void runScenarioWithUnhandledAlert(
      UnexpectedAlertBehaviour behaviour,
      String expectedAlertText,
      boolean silently) {
    Capabilities caps = behaviour == null
                        ? new ImmutableCapabilities()
                        : new ImmutableCapabilities(UNEXPECTED_ALERT_BEHAVIOUR, behaviour);
    driver2 = new WebDriverBuilder().get(caps);

    driver2.get(pages.alertsPage);
    driver2.findElement(By.id("prompt-with-default")).click();

    WebDriverWait wait1 = new WebDriverWait(driver2, 10);
    if (! silently) {
      wait1.ignoring(UnhandledAlertException.class);
    }
    wait1.until(elementTextToEqual(By.id("text"), expectedAlertText));
  }

}
