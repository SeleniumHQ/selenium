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

package org.openqa.selenium.bidi.protocol.input;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.BiDiException;
import org.openqa.selenium.bidi.ConverterFunctions;
import org.openqa.selenium.bidi.protocol.browsingcontext.SetViewportParameters;
import org.openqa.selenium.bidi.protocol.emulation.GeolocationCoordinates;
import org.openqa.selenium.bidi.protocol.network.ResponseData;
import org.openqa.selenium.json.JsonException;

/** Numbers held to the bounds the schema declares on the field itself, not only on js-int/uint. */
@Tag("UnitTests")
class DeclaredRangeTest {

  @Test
  void exclusiveMinimumRejectsTheBoundItself() {
    assertThatThrownBy(() -> new SetViewportParameters().setDevicePixelRatio(0))
        .isInstanceOf(BiDiException.class)
        .hasMessageContaining("devicePixelRatio must be > 0");
  }

  @Test
  void exclusiveMinimumAcceptsAValueJustAboveIt() {
    assertThat(new SetViewportParameters().setDevicePixelRatio(0.5).getDevicePixelRatio())
        .contains(0.5);
  }

  @Test
  void notANumberIsOutOfEveryRange() {
    assertThatThrownBy(() -> new SetViewportParameters().setDevicePixelRatio(Double.NaN))
        .isInstanceOf(BiDiException.class);
  }

  @Test
  void explicitNullIsStillAllowedForANullableBoundedField() {
    assertThat(new SetViewportParameters().setDevicePixelRatio(null).toMap())
        .containsEntry("devicePixelRatio", null);
  }

  @Test
  void exclusiveMaximumRejectsTheBoundItself() {
    assertThatThrownBy(() -> new GeolocationCoordinates(0, 0).setHeading(360))
        .isInstanceOf(BiDiException.class)
        .hasMessageContaining("heading must be >= 0 and < 360");
  }

  @Test
  void exclusiveMaximumAcceptsAValueJustBelowIt() {
    assertThat(new GeolocationCoordinates(0, 0).setHeading(359.9).getHeading()).contains(359.9);
  }

  @Test
  void requiredNumberIsCheckedAtConstruction() {
    assertThatThrownBy(() -> new GeolocationCoordinates(90.0001, 0))
        .isInstanceOf(BiDiException.class)
        .hasMessageContaining("latitude");
  }

  @Test
  void negativeStatusIsRejectedOnReceipt() {
    String raw =
        "{\"url\":\"u\",\"protocol\":\"http/1.1\",\"status\":-1,\"statusText\":\"\","
            + "\"fromCache\":false,\"headers\":[],\"mimeType\":\"\",\"bytesReceived\":0,"
            + "\"headersSize\":null,\"bodySize\":null,\"content\":{\"size\":0}}";

    assertThatThrownBy(() -> ConverterFunctions.JSON.toType(raw, ResponseData.class))
        .isInstanceOf(JsonException.class)
        .hasStackTraceContaining("status must be");
  }
}
