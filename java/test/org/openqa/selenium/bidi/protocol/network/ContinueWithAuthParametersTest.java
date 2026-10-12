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

package org.openqa.selenium.bidi.protocol.network;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.json.Json;

@Tag("UnitTests")
class ContinueWithAuthParametersTest {

  @SuppressWarnings("unchecked")
  private static Map<String, Object> mapOf(String raw) {
    return (Map<String, Object>) new Json().toType(raw, Json.MAP_TYPE);
  }

  @Test
  void dispatchesToCredentialsWhenActionIsProvideCredentials() {
    Map<String, Object> map =
        mapOf(
            "{\"request\": \"req-1\", \"action\": \"provideCredentials\","
                + " \"credentials\": {\"type\": \"password\", \"username\": \"u\", \"password\":"
                + " \"p\"}}");

    ContinueWithAuthParameters result = ContinueWithAuthParameters.fromMap(map);

    assertThat(result).isInstanceOf(ContinueWithAuthParameters.Credentials.class);
    ContinueWithAuthParameters.Credentials creds = (ContinueWithAuthParameters.Credentials) result;
    assertThat(creds.getRequest()).isEqualTo("req-1");
    assertThat(creds.getCredentials().getUsername()).isEqualTo("u");
    assertThat(creds.getCredentials().getPassword()).isEqualTo("p");
  }

  @Test
  void dispatchesToNoCredentialsWhenActionIsCancel() {
    Map<String, Object> map = mapOf("{\"request\": \"req-2\", \"action\": \"cancel\"}");

    ContinueWithAuthParameters result = ContinueWithAuthParameters.fromMap(map);

    assertThat(result).isInstanceOf(ContinueWithAuthParameters.NoCredentials.class);
    ContinueWithAuthParameters.NoCredentials noCreds =
        (ContinueWithAuthParameters.NoCredentials) result;
    assertThat(noCreds.getAction())
        .isEqualTo(ContinueWithAuthParameters.NoCredentials.Action.CANCEL);
  }

  @Test
  void dispatchesToNoCredentialsWhenActionIsDefault() {
    // "default" is itself a recognized NoCredentials.Action value (see
    // nestedActionEnumRoundTripsThroughItsWireValue below) — not an example of an unmodeled
    // action. network.ContinueWithAuthParameters's selector names NoCredentials as the variant
    // for any action other than "provideCredentials", so "default" dispatches here the same way
    // "cancel" does in dispatchesToNoCredentialsWhenActionIsCancel above.
    Map<String, Object> map = mapOf("{\"request\": \"req-3\", \"action\": \"default\"}");

    ContinueWithAuthParameters result = ContinueWithAuthParameters.fromMap(map);

    assertThat(result).isInstanceOf(ContinueWithAuthParameters.NoCredentials.class);
    ContinueWithAuthParameters.NoCredentials noCreds =
        (ContinueWithAuthParameters.NoCredentials) result;
    assertThat(noCreds.getAction())
        .isEqualTo(ContinueWithAuthParameters.NoCredentials.Action.DEFAULT);
  }

  @Test
  void aGenuinelyUnknownActionIsRejectedNotSilentlyAccepted() {
    // Unlike "default" above, "totally-bogus" is not one of NoCredentials.Action's two modeled
    // values (cancel, default). The top-level union selector alone would still route this to the
    // NoCredentials variant (any action other than "provideCredentials" does), but that variant's
    // own "action" field is typed as the nested Action enum, not a raw String, and decoding it
    // goes through ConverterFunctions.JSON — the same strict, case-sensitive decoder as every
    // other generated enum (see StaticInitializerCoercer/Action.fromJson) — so an unmodeled value
    // is rejected here, not silently accepted as if the union had a true catch-all fallback.
    Map<String, Object> map = mapOf("{\"request\": \"req-4\", \"action\": \"totally-bogus\"}");

    assertThatThrownBy(() -> ContinueWithAuthParameters.fromMap(map))
        .isInstanceOf(org.openqa.selenium.json.JsonException.class);
  }

  @Test
  void nestedActionEnumRoundTripsThroughItsWireValue() {
    // fromJson, not fromString: this is the method the real deserialization path
    // (StaticInitializerCoercer, via ConverterFunctions.JSON) actually calls.
    assertThat(ContinueWithAuthParameters.NoCredentials.Action.fromJson("cancel"))
        .isEqualTo(ContinueWithAuthParameters.NoCredentials.Action.CANCEL);
    assertThat(ContinueWithAuthParameters.NoCredentials.Action.CANCEL.toString())
        .isEqualTo("cancel");
    assertThat(ContinueWithAuthParameters.NoCredentials.Action.fromJson("default"))
        .isEqualTo(ContinueWithAuthParameters.NoCredentials.Action.DEFAULT);
  }

  @Test
  void credentialsVariantSerializesBackToTheExpectedWireShape() {
    ContinueWithAuthParameters.Credentials creds =
        new ContinueWithAuthParameters.Credentials(
            "req-1", "provideCredentials", new AuthCredentials("password", "u", "p"));

    Map<String, Object> map = creds.toMap();

    assertThat(map).containsEntry("request", "req-1");
    assertThat(map).containsEntry("action", "provideCredentials");
    assertThat(map.get("credentials"))
        .isEqualTo(Map.of("type", "password", "username", "u", "password", "p"));
  }
}
