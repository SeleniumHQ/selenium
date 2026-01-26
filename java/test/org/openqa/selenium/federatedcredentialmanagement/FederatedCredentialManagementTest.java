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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chromium.ChromiumOptions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsSecureServer;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

@NeedsSecureServer
@Ignore(value = FIREFOX, reason = "FedCM not yet supported")
@Ignore(value = IE, reason = "FedCM not supported")
@Ignore(value = SAFARI, reason = "FedCM not supported")
final class FederatedCredentialManagementTest extends JupiterTestBase {
  private HasFederatedCredentialManagement fedcmDriver;

  private void setup() throws MalformedURLException {
    int securePort = new URL(appServer.whereIsSecure("/")).getPort();
    Capabilities caps =
        ((ChromiumOptions<?>) Browser.detect().getCapabilities())
            .addArguments("--enable-fedcm-without-well-known-enforcement")
            .addArguments(
                String.format("host-resolver-rules=MAP localhost:443 localhost:%d", securePort));
    localDriver = new WebDriverBuilder().get(caps);
    localDriver.get(appServer.whereIsSecure("/fedcm/fedcm_async.html"));
    fedcmDriver = (HasFederatedCredentialManagement) localDriver;
    assertThat(fedcmDriver.getFederatedCredentialManagementDialog()).isNull();
  }

  private void waitForDialog() {
    WebDriverWait wait = new WebDriverWait(localDriver, Duration.ofSeconds(20));
    wait.until(
        driver ->
            ((HasFederatedCredentialManagement) driver).getFederatedCredentialManagementDialog()
                != null);
  }

  @Test
  @NoDriverBeforeTest
  void testDismissDialog() throws MalformedURLException {
    setup();
    fedcmDriver.setDelayEnabled(false);

    WebElement triggerButton = localDriver.findElement(By.id("triggerButton"));
    triggerButton.click();

    waitForDialog();

    FederatedCredentialManagementDialog dialog =
        fedcmDriver.getFederatedCredentialManagementDialog();

    assertThat(dialog.getTitle()).contains("Sign in to");
    assertThat(dialog.getSubtitle()).isNull();
    assertThat(dialog.getDialogType()).isEqualTo("AccountChooser");
    dialog.cancelDialog();

    // Check that the dialog was indeed closed
    assertThatThrownBy(dialog::getDialogType)
        .as("Unable to get the dialog type since the dialog was closed")
        .isInstanceOf(NoAlertPresentException.class)
        .hasMessageStartingWith("no such alert");
  }

  @Test
  @NoDriverBeforeTest
  void testSelectAccount() throws MalformedURLException {
    setup();

    WebElement triggerButton = localDriver.findElement(By.id("triggerButton"));
    triggerButton.click();
    waitForDialog();

    FederatedCredentialManagementDialog dialog =
        fedcmDriver.getFederatedCredentialManagementDialog();

    assertThat(dialog.getTitle()).contains("Sign in to");
    assertThat(dialog.getSubtitle()).isNull();
    assertThat(dialog.getDialogType()).isEqualTo("AccountChooser");

    List<FederatedCredentialManagementAccount> accountList = dialog.getAccounts();
    assertThat(accountList).hasSize(2);
    dialog.selectAccount(1);
  }

  @Test
  @NoDriverBeforeTest
  void testGetAccounts() throws MalformedURLException {
    setup();
    WebElement triggerButton = localDriver.findElement(By.id("triggerButton"));
    triggerButton.click();

    waitForDialog();

    FederatedCredentialManagementDialog dialog =
        fedcmDriver.getFederatedCredentialManagementDialog();

    assertThat(dialog.getTitle()).contains("Sign in to");
    assertThat(dialog.getSubtitle()).isNull();
    assertThat(dialog.getDialogType()).isEqualTo("AccountChooser");

    List<FederatedCredentialManagementAccount> accountList = dialog.getAccounts();
    assertThat(accountList).hasSize(2);

    FederatedCredentialManagementAccount account1 = accountList.get(0);

    assertThat(account1.getName()).isEqualTo("John Doe");
    assertThat(account1.getEmail()).isEqualTo("john_doe@idp.example");
    assertThat(account1.getAccountid()).isEqualTo("1234");
    assertThat(account1.getGivenName()).isEqualTo("John");
    assertThat(account1.getIdpConfigUrl()).contains("/fedcm/config.json");
    assertThat(account1.getPictureUrl()).isEqualTo("https://idp.example/profile/123");
    assertThat(account1.getLoginState()).isEqualTo("SignUp");
    assertThat(account1.getTermsOfServiceUrl())
        .isEqualTo("https://rp.example/terms_of_service.html");
    assertThat(account1.getPrivacyPolicyUrl()).isEqualTo("https://rp.example/privacy_policy.html");

    FederatedCredentialManagementAccount account2 = accountList.get(1);

    assertThat(account2.getName()).isEqualTo("Aisha Ahmad");
    assertThat(account2.getEmail()).isEqualTo("aisha@idp.example");
    assertThat(account2.getAccountid()).isEqualTo("5678");
    assertThat(account2.getGivenName()).isEqualTo("Aisha");
    assertThat(account2.getIdpConfigUrl()).contains("/fedcm/config.json");
    assertThat(account2.getPictureUrl()).isEqualTo("https://idp.example/profile/567");
    assertThat(account2.getLoginState()).isEqualTo("SignUp");
    assertThat(account2.getTermsOfServiceUrl())
        .isEqualTo("https://rp.example/terms_of_service.html");
    assertThat(account2.getPrivacyPolicyUrl()).isEqualTo("https://rp.example/privacy_policy.html");
  }
}
