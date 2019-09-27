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

package org.openqa.selenium.devtools.network.model;

import java.util.Objects;

/**
 * Response to an AuthChallenge
 */
public class AuthChallengeResponse {

  /**
   * The decision on what to do in response to the authorization challenge. Default means deferring to the default behavior of the net stack,
   * which will likely either the Cancel authentication or display a popup dialog box
   */
  private final String response;

  /**
   * The username to provide, possibly empty. Should only be set if response is ProvideCredentials
   */
  private final String username;

  /**
   * The password to provide, possibly empty. Should only be set if response is ProvideCredentials
   */
  private final String password;

  public AuthChallengeResponse(String response, String username, String password) {
    this.response = Objects.requireNonNull(response, "response must be set.");
    this.username = username;
    this.password = password;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    AuthChallengeResponse that = (AuthChallengeResponse) o;
    return Objects.equals(response, that.response) &&
           Objects.equals(username, that.username) &&
           Objects.equals(password, that.password);
  }

  @Override
  public int hashCode() {

    return Objects.hash(response, username, password);
  }

  @Override
  public String toString() {
    return "AuthChallengeResponse{" +
           "response='" + response + '\'' +
           ", username='" + username + '\'' +
           ", password='" + password + '\'' +
           '}';
  }

}
