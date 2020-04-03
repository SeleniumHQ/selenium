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
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.CHROMIUMEDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.Test;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.NoDriverBeforeTest;

import java.time.Duration;

@NeedsLocalEnvironment(reason = "Requires local browser launching environment")
@Ignore(value = SAFARI, reason = "Does not support alerts yet")
public class UnexpectedAlertBehaviorTest extends JUnit4TestBase {

  @Test
  @Ignore(value = FIREFOX, reason = "Legacy behaviour, not W3C conformant")
  @Ignore(value = CHROME, reason = "Legacy behaviour, not W3C conformant")
  @Ignore(value = CHROMIUMEDGE, reason = "Legacy behaviour, not W3C conformant")
  @Ignore(value = HTMLUNIT, reason = "Legacy behaviour, not W3C conformant")
  @NoDriverBeforeTest
  public void canAcceptUnhandledAlert() {
    runScenarioWithUnhandledAlert(UnexpectedAlertBehaviour.ACCEPT_AND_NOTIFY, "This is a default value", false);
  }

  @Test
  @Ignore(value = FIREFOX, reason = "Legacy behaviour, not W3C conformant")
  @Ignore(value = CHROME, reason = "Legacy behaviour, not W3C conformant")
  @Ignore(value = CHROMIUMEDGE, reason = "Legacy behaviour, not W3C conformant")
  @Ignore(value = HTMLUNIT, reason = "Legacy behaviour, not W3C conformant")
  @NoDriverBeforeTest
  public void canSilentlyAcceptUnhandledAlert() {
    runScenarioWithUnhandledAlert(UnexpectedAlertBehaviour.ACCEPT, "This is a default value", true);
  }

  @Test
  @Ignore(value = CHROME, reason = "Unstable Chrome behavior")
  @Ignore(value = CHROMIUMEDGE, reason = "Unstable Chrome behavior")
  @Ignore(value = HTMLUNIT, reason = "Legacy behaviour, not W3C conformant")
  @NoDriverBeforeTest
  public void canDismissUnhandledAlert() {
    runScenarioWithUnhandledAlert(UnexpectedAlertBehaviour.DISMISS_AND_NOTIFY, "null", false);
  }

  @Test
  @Ignore(value = FIREFOX, reason = "Legacy behaviour, not W3C conformant")
  @Ignore(value = CHROME, reason = "Legacy behaviour, not W3C conformant")
  @Ignore(value = CHROMIUMEDGE, reason = "Legacy behaviour, not W3C conformant")
  @Ignore(value = HTMLUNIT, reason = "Legacy behaviour, not W3C conformant")
  @NoDriverBeforeTest
  public void canSilentlyDismissUnhandledAlert() {
    runScenarioWithUnhandledAlert(UnexpectedAlertBehaviour.DISMISS, "null", true);
  }

  @Test
  @Ignore(value = CHROME, reason = "Chrome uses IGNORE mode by default")
  @Ignore(value = CHROMIUMEDGE, reason = "Edge uses IGNORE mode by default")
  @NoDriverBeforeTest
  public void canDismissUnhandledAlertsByDefault() {
    runScenarioWithUnhandledAlert(null, "null", false);
  }

  @Test
  @Ignore(value = CHROME, reason = "Unstable Chrome behavior")
  @Ignore(value = CHROMIUMEDGE, reason = "Unstable Chrome behavior")
  @NoDriverBeforeTest
  public void canIgnoreUnhandledAlert() {
    assertThatExceptionOfType(UnhandledAlertException.class).isThrownBy(
        () -> runScenarioWithUnhandledAlert(IGNORE, "Text ignored", true));
    driver.switchTo().alert().dismiss();
  }

  private void runScenarioWithUnhandledAlert(
      UnexpectedAlertBehaviour behaviour,
      String expectedAlertText,
      boolean silently) {
    Capabilities caps = behaviour == null
                        ? new ImmutableCapabilities()
                        : new ImmutableCapabilities(UNEXPECTED_ALERT_BEHAVIOUR, behaviour);
    createNewDriver(caps);

    driver.get(pages.alertsPage);
    driver.findElement(By.id("prompt-with-default")).click();

    Wait<WebDriver> wait1
        = silently
        ? wait
        : new WebDriverWait(driver, Duration.ofSeconds(10))
              .ignoring(UnhandledAlertException.class);
    wait1.until(elementTextToEqual(By.id("text"), expectedAlertText));
  }

}
