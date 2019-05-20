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

import static java.util.Objects.requireNonNull;

import org.openqa.selenium.json.JsonInput;

public class AuthChallenge {

  /**
   * Origin of the challenger.
   */
  private String origin;
  /**
   * The realm of the challenge. May be empty.
   */
  private String realm;
  /**
   * The authentication scheme used, such as basic or digest
   */
  private String scheme;
  /**
   * Source of the authentication challenge.
   * Optional
   */
  private Source source;

  public static AuthChallenge parseRequest(JsonInput input) {
    AuthChallenge authChallenge = new AuthChallenge();
    input.beginObject();
    while (input.hasNext()){
      switch (input.nextName()) {
        case "origin" :
          authChallenge.setOrigin(input.nextString());
          break;
        case "realm" :
          authChallenge.setRealm(input.nextString());
          break;
        case "scheme" :
          authChallenge.setScheme(input.nextString());
          break;
        case "source" :
          authChallenge.setSource(Source.getSource(input.nextString()));
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return authChallenge;
  }


  public String getScheme() {
    return scheme;
  }

  private void setScheme(String scheme) {
    requireNonNull(origin, "'scheme' is mandatory for AuthChallenge");
    this.scheme = scheme;
  }

  public String getOrigin() {
    return origin;
  }

  public void setOrigin(String origin) {
    requireNonNull(origin, "'origin' is mandatory for AuthChallenge");
    this.origin = origin;
  }

  public String getRealm() {
    return realm;
  }

  private void setRealm(String realm) {
    requireNonNull(origin, "'realm' is mandatory for AuthChallenge");
    this.realm = realm;
  }

  public Source getSource() {
    return source;
  }

  public void setSource(Source source) {
    this.source = source;
  }
}
