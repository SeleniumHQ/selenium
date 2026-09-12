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

package org.openqa.selenium.bidi.protocol.emulation;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.json.Json;

@Tag("UnitTests")
class SetTouchOverrideParametersTest {

  @Test
  void requiredNullablePrimitiveFieldAcceptsNullAtConstructionTime() {
    SetTouchOverrideParameters params = new SetTouchOverrideParameters(null);

    assertThat(params.getMaxTouchPoints()).isNull();
  }

  @Test
  void nullValueIsSentAsAnExplicitKeyNotOmitted() {
    Map<String, Object> map = new SetTouchOverrideParameters(null).toMap();

    assertThat(map).containsKey("maxTouchPoints");
    assertThat(map.get("maxTouchPoints")).isNull();
  }

  @Test
  void deserializingAnExplicitNullDoesNotThrow() {
    String raw = "{\"maxTouchPoints\": null}";

    SetTouchOverrideParameters params = new Json().toType(raw, SetTouchOverrideParameters.class);

    assertThat(params.getMaxTouchPoints()).isNull();
  }

  @Test
  void deserializingARealValueWorks() {
    String raw = "{\"maxTouchPoints\": 5}";

    SetTouchOverrideParameters params = new Json().toType(raw, SetTouchOverrideParameters.class);

    assertThat(params.getMaxTouchPoints()).isEqualTo(5L);
  }
}
