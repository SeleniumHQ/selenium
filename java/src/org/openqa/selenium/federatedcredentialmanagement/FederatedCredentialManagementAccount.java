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

import java.util.Map;

/**
 * Represents an account displayed in a FedCM account list.
 *
 * @see <a href="https://fedidcg.github.io/FedCM/#dictdef-identityprovideraccount">
 *     https://fedidcg.github.io/FedCM/#dictdef-identityprovideraccount</a>
 * @see <a href="https://fedidcg.github.io/FedCM/#webdriver-accountlist">
 *     https://fedidcg.github.io/FedCM/#webdriver-accountlist</a>
 */
public class FederatedCredentialManagementAccount {
  private final String accountId;
  private final String email;
  private final String name;
  private final String givenName;
  private final String pictureUrl;

  /**
   * The config URL of the identity provider that provided this account.
   *
   * <p>This allows identifying the IDP in multi-IDP cases.
   */
  private final String idpConfigUrl;

  /**
   * The login state for this account.
   *
   * <p>One of LOGIN_STATE_SIGNIN and LOGIN_STATE_SIGNUP.
   */
  private final String loginState;

  private final String termsOfServiceUrl;
  private final String privacyPolicyUrl;

  public static final String LOGIN_STATE_SIGNIN = "SignIn";
  public static final String LOGIN_STATE_SIGNUP = "SignUp";

  public FederatedCredentialManagementAccount(Map<String, String> dict) {
    accountId = (String) dict.getOrDefault("accountId", null);
    email = (String) dict.getOrDefault("email", null);
    name = (String) dict.getOrDefault("name", null);
    givenName = (String) dict.getOrDefault("givenName", null);
    pictureUrl = (String) dict.getOrDefault("pictureUrl", null);
    idpConfigUrl = (String) dict.getOrDefault("idpConfigUrl", null);
    loginState = (String) dict.getOrDefault("loginState", null);
    termsOfServiceUrl = (String) dict.getOrDefault("termsOfServiceUrl", null);
    privacyPolicyUrl = (String) dict.getOrDefault("privacyPolicyUrl", null);
  }

  public String getAccountid() {
    return accountId;
  }

  public String getEmail() {
    return email;
  }

  public String getName() {
    return name;
  }

  public String getGivenName() {
    return givenName;
  }

  public String getPictureUrl() {
    return pictureUrl;
  }

  public String getIdpConfigUrl() {
    return idpConfigUrl;
  }

  public String getLoginState() {
    return loginState;
  }

  public String getTermsOfServiceUrl() {
    return termsOfServiceUrl;
  }

  public String getPrivacyPolicyUrl() {
    return privacyPolicyUrl;
  }
}
