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

import java.util.List;

/**
 * Represents an open dialog of the Federated Credential Management API.
 *
 * @see <a href="https://fedidcg.github.io/FedCM/">https://fedidcg.github.io/FedCM/</a>
 */
public interface FederatedCredentialManagementDialog {

  String DIALOG_TYPE_ACCOUNT_LIST = "AccountChooser";
  String DIALOG_TYPE_AUTO_REAUTH = "AutoReauthn";

  /** Closes the dialog as if the user had clicked X. */
  void cancelDialog();

  /**
   * Selects an account as if the user had clicked on it.
   *
   * @param index The index of the account to select from the list returned by getAccounts().
   */
  void selectAccount(int index);

  /**
   * Returns the type of the open dialog.
   *
   * <p>One of DIALOG_TYPE_ACCOUNT_LIST and DIALOG_TYPE_AUTO_REAUTH.
   */
  String getDialogType();

  /** Returns the title of the dialog. */
  String getTitle();

  /** Returns the subtitle of the dialog or null if none. */
  String getSubtitle();

  /**
   * Returns the accounts shown in the account chooser.
   *
   * <p>If this is an auto reauth dialog, returns the single account that is being signed in.
   */
  List<FederatedCredentialManagementAccount> getAccounts();
}
