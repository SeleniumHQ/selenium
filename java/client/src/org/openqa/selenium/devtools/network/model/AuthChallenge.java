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

  private AuthChallenge(String origin, String realm, String scheme,
                        Source source) {
    this.origin = requireNonNull(origin, "'origin' is mandatory for AuthChallenge");
    this.realm = requireNonNull(realm, "'realm' is mandatory for AuthChallenge");
    this.scheme = requireNonNull(scheme, "'scheme' is mandatory for AuthChallenge");
    this.source = source;
  }

  private static AuthChallenge fromJson(JsonInput input) {

    String origin = null;
    String realm = null;
    String scheme = null;
    Source source = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "origin":
          origin = input.nextString();
          break;
        case "realm":
          realm = input.nextString();
          break;
        case "scheme":
          scheme = input.nextString();
          break;
        case "source":
          source = Source.getSource(input.nextString());
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();
    return new AuthChallenge(origin, realm, scheme, source);
  }


  public String getScheme() {
    return scheme;
  }

  public String getOrigin() {
    return origin;
  }

  public String getRealm() {
    return realm;
  }

  public Source getSource() {
    return source;
  }

}
