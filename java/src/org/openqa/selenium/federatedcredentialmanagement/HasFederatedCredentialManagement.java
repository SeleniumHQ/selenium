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

import org.openqa.selenium.Beta;

/** Used by classes to indicate that they can interact with FedCM dialogs. */
@Beta
public interface HasFederatedCredentialManagement {
  /**
   * Disables the promise rejection delay.
   *
   * <p>FedCM by default delays promise resolution in failure cases for privacy reasons
   * (https://fedidcg.github.io/FedCM/#ref-for-setdelayenabled); this function allows turning it off
   * to let tests run faster where this is not relevant.
   */
  void setDelayEnabled(boolean enabled);

  /**
   * Resets the FedCM dialog cooldown.
   *
   * <p>If a user agent triggers a cooldown when the account chooser is dismissed, this function
   * resets that cooldown so that the dialog can be triggered again immediately.
   */
  void resetCooldown();

  /**
   * Gets the currently open FedCM dialog, or null if there is no dialog.
   *
   * <p>Can be used with WebDriverWait like: wait.until(driver ->
   * ((HasFederatedCredentialManagement) driver). getFederatedCredentialManagementDialog() != null);
   */
  FederatedCredentialManagementDialog getFederatedCredentialManagementDialog();
}
