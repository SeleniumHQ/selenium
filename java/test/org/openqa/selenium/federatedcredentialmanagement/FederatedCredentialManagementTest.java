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

package org.openqa.selenium.federatedcredentialmanagement;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assumptions.assumeThat;
import static org.assertj.core.api.InstanceOfAssertFactories.MAP;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.InvalidSelectorException;
import org.openqa.selenium.JavascriptException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.drivers.Browser;

class FederatedCredentialManagementTest extends JupiterTestBase {

  private JavascriptExecutor jsAwareDriver;
  private HasFederatedCredentialManagement fedcmDriver;

  @BeforeEach
  public void setup() {
    ChromeOptions options = (ChromeOptions) Browser.CHROME.getCapabilities();
    // options.setAcceptInsecureCerts(true);
    options.addArguments(
        String.format("host-resolver-rules=MAP localhost:443 localhost:%d", getSecurePort()));
    options.addArguments("ignore-certificate-errors");
    localDriver = seleniumExtension.createNewDriver(options);

    assumeThat(localDriver).isInstanceOf(HasFederatedCredentialManagement.class);
    jsAwareDriver = (JavascriptExecutor) localDriver;
    fedcmDriver = (HasFederatedCredentialManagement) localDriver;
    localDriver.get(appServer.whereIsSecure("/fedcm/fedcm.html"));
  }

  private Object triggerFedCm() {
    return jsAwareDriver.executeScript("triggerFedCm()");
  }

  private void waitForDialog() {
    WebDriverWait wait = new WebDriverWait(localDriver, Duration.ofSeconds(5));
    wait.until(
        driver ->
            ((HasFederatedCredentialManagement) driver).getFederatedCredentialManagementDialog()
                != null);
  }

  private int getSecurePort() {
    String urlString = appServer.whereIsSecure("/");
    try {
      return new URL(urlString).getPort();
    } catch (MalformedURLException ex) {
      // This should not happen.
      return 0;
    }
  }

  @Test
  void testDismissDialog() {
    fedcmDriver.setDelayEnabled(false);
    assertNull(fedcmDriver.getFederatedCredentialManagementDialog());

    Object response = triggerFedCm();

    waitForDialog();

    FederatedCredentialManagementDialog dialog =
        fedcmDriver.getFederatedCredentialManagementDialog();

    assertEquals("Sign in to localhost with localhost", dialog.getTitle());
    assertEquals("AccountChooser", dialog.getDialogType());

    dialog.cancelDialog();

    // Check that the dialog was indeed closed (i.e. the promise now resolves).
    assertThrows(
        JavascriptException.class,
        () -> {
          try {
            jsAwareDriver.executeScript("await promise");
          } catch (InvalidSelectorException ex) {
            // Due to a bug in Chromedriver (https://crbug.com/1454586), we may
            // get an invalid selector exception here instead of a JavascriptException.
            // Turn it into a JavascriptException to make the test pass for now.
            throw new JavascriptException(ex.getMessage(), ex);
          }
        });
  }

  @Test
  void testSelectAccount() {
    fedcmDriver.setDelayEnabled(false);
    assertNull(fedcmDriver.getFederatedCredentialManagementDialog());

    Object response = triggerFedCm();

    waitForDialog();

    FederatedCredentialManagementDialog dialog =
        fedcmDriver.getFederatedCredentialManagementDialog();

    assertEquals("Sign in to localhost with localhost", dialog.getTitle());
    assertEquals("AccountChooser", dialog.getDialogType());

    dialog.selectAccount(0);

    response = jsAwareDriver.executeScript("return await promise");
    assertThat(response).asInstanceOf(MAP).containsEntry("token", "a token");
  }
}
