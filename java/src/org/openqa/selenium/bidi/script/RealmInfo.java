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

package org.openqa.selenium.bidi.script;

import java.util.Optional;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;

public class RealmInfo {

  private final String realmId;
  private final String origin;
  private final RealmType realmType;

  public RealmInfo(String realmId, String origin, RealmType realmType) {
    this.realmId = realmId;
    this.origin = origin;
    this.realmType = realmType;
  }

  public static RealmInfo fromJson(JsonInput input) {
    String realmId = null;
    String origin = null;
    RealmType realmType = null;
    String browsingContext = null;
    String sandbox = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "type":
          String typeString = input.readNonNull(String.class);
          realmType = RealmType.findByName(typeString);
          break;

        case "realm":
          realmId = input.read(String.class);
          break;

        case "origin":
          origin = input.read(String.class);
          break;

        case "context":
          browsingContext = input.read(String.class);
          break;

        case "sandbox":
          sandbox = input.read(String.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    if (realmType == RealmType.WINDOW) {
      // TODO fix the circular dependency: parent class should not reference its child class
      return new WindowRealmInfo(
          Require.nonNull("realmId", realmId),
          Require.nonNull("origin", origin),
          Require.nonNull("realmType", realmType),
          Require.nonNull("browsingContext", browsingContext),
          Optional.ofNullable(sandbox));
    }

    return new RealmInfo(
        Require.nonNull("realmId", realmId),
        Require.nonNull("origin", origin),
        Require.nonNull("realmType", realmType));
  }

  public String getRealmId() {
    return realmId;
  }

  public String getOrigin() {
    return origin;
  }

  public RealmType getRealmType() {
    return realmType;
  }
}
