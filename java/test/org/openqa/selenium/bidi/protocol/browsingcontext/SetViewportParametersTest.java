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

package org.openqa.selenium.bidi.protocol.browsingcontext;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class SetViewportParametersTest {

  @Test
  void noArgConstructorProducesAnEmptyWirePayload() {
    Map<String, Object> map = new SetViewportParameters().toMap();

    assertThat(map).isEmpty();
  }

  @Test
  void untouchedFieldsAreOmittedFromTheWire() {
    Map<String, Object> map = new SetViewportParameters().setContext("ctx-1").toMap();

    assertThat(map).containsEntry("context", "ctx-1");
    assertThat(map).doesNotContainKey("viewport");
    assertThat(map).doesNotContainKey("devicePixelRatio");
    assertThat(map).doesNotContainKey("userContexts");
  }

  @Test
  void settingARealValueOnANullableFieldSendsIt() {
    Map<String, Object> map =
        new SetViewportParameters().setViewport(new Viewport(800, 600)).toMap();

    assertThat(map).containsKey("viewport");
    assertThat(map.get("viewport")).isEqualTo(Map.of("width", 800L, "height", 600L));
  }

  @Test
  void explicitlyClearingANullableFieldSendsAnExplicitNull() {
    Map<String, Object> map = new SetViewportParameters().setViewport(null).toMap();

    assertThat(map).containsKey("viewport");
    assertThat(map.get("viewport")).isNull();
  }

  @Test
  void explicitlyClearingANonNullableOptionalFieldIsIndistinguishableFromNeverSettingIt() {
    // context's schema type never declares "/ null", so there is no explicit-null wire state to
    // represent for it — passing null just clears back to "unset", same as never calling the
    // setter at all.
    Map<String, Object> map = new SetViewportParameters().setContext(null).toMap();

    assertThat(map).doesNotContainKey("context");
  }

  @Test
  void devicePixelRatioFollowsTheSameNullableRulesAsViewport() {
    Map<String, Object> untouched = new SetViewportParameters().toMap();
    Map<String, Object> cleared = new SetViewportParameters().setDevicePixelRatio(null).toMap();
    Map<String, Object> set = new SetViewportParameters().setDevicePixelRatio(2.0).toMap();

    assertThat(untouched).doesNotContainKey("devicePixelRatio");
    assertThat(cleared).containsKey("devicePixelRatio");
    assertThat(cleared.get("devicePixelRatio")).isNull();
    assertThat(set).containsEntry("devicePixelRatio", 2.0);
  }
}
