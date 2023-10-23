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

package org.openqa.selenium.bidi.network;

import org.openqa.selenium.json.JsonInput;

public class AuthChallenge {

  private final String scheme;
  private final String realm;

  private AuthChallenge(String scheme, String realm) {
    this.scheme = scheme;
    this.realm = realm;
  }

  public static AuthChallenge fromJson(JsonInput input) {
    String scheme = null;
    String realm = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "scheme":
          scheme = input.read(String.class);
          break;
        case "realm":
          realm = input.read(String.class);
          break;
        default:
          input.skipValue();
      }
    }

    input.endObject();

    return new AuthChallenge(scheme, realm);
  }

  public String getScheme() {
    return scheme;
  }

  public String getRealm() {
    return realm;
  }
}
