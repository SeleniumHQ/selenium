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

package org.openqa.selenium.remote;

import com.google.common.collect.ImmutableMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.openqa.selenium.federatedcredentialmanagement.FederatedCredentialManagementAccount;
import org.openqa.selenium.federatedcredentialmanagement.FederatedCredentialManagementDialog;

class FedCmDialogImpl implements FederatedCredentialManagementDialog {
  private final ExecuteMethod executeMethod;

  FedCmDialogImpl(ExecuteMethod executeMethod) {
    this.executeMethod = executeMethod;
  }

  @Override
  public void cancelDialog() {
    executeMethod.execute(DriverCommand.CANCEL_DIALOG, null);
  }

  @Override
  public void selectAccount(int index) {
    executeMethod.execute(DriverCommand.SELECT_ACCOUNT, ImmutableMap.of("accountIndex", index));
  }

  @Override
  public String getDialogType() {
    return (String) executeMethod.execute(DriverCommand.GET_FEDCM_DIALOG_TYPE, null);
  }

  @Override
  public String getTitle() {
    Map<String, Object> result =
        (Map<String, Object>) executeMethod.execute(DriverCommand.GET_FEDCM_TITLE, null);
    return (String) result.getOrDefault("title", null);
  }

  @Override
  public String getSubtitle() {
    Map<String, Object> result =
        (Map<String, Object>) executeMethod.execute(DriverCommand.GET_FEDCM_TITLE, null);
    return (String) result.getOrDefault("subtitle", null);
  }

  @Override
  public List<FederatedCredentialManagementAccount> getAccounts() {
    List<Map<String, String>> list =
        (List<Map<String, String>>) executeMethod.execute(DriverCommand.GET_ACCOUNTS, null);
    ArrayList<FederatedCredentialManagementAccount> accounts =
        new ArrayList<FederatedCredentialManagementAccount>();
    for (Map<String, String> map : list) {
      accounts.add(new FederatedCredentialManagementAccount(map));
    }
    return accounts;
  }
}
