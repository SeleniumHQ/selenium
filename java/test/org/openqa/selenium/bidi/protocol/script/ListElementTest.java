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

package org.openqa.selenium.bidi.protocol.script;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.openqa.selenium.bidi.ConverterFunctions;
import org.openqa.selenium.bidi.protocol.browsingcontext.GetTreeResult;
import org.openqa.selenium.bidi.protocol.browsingcontext.PrintParameters;
import org.openqa.selenium.bidi.protocol.network.AddInterceptParameters;
import org.openqa.selenium.bidi.protocol.session.SubscribeParameters;
import org.openqa.selenium.json.JsonException;

@Tag("UnitTests")
class ListElementTest {
  static Stream<Object> invalidRanges() {
    return Stream.of(true, 1.5, Map.of(), List.of(), null, -1L, 9007199254740992L);
  }

  @ParameterizedTest
  @MethodSource("invalidRanges")
  void invalidPrintRangeIsRejectedBeforeSerialization(Object value) {
    assertThatThrownBy(() -> new PrintParameters("ctx").setPageRanges(Arrays.asList(value)).toMap())
        .isInstanceOf(RuntimeException.class);
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "true",
        "1.5",
        "{}",
        "[]",
        "null",
        "-1",
        "9007199254740992",
        "9007199254740991.1",
        "1e10000"
      })
  void invalidPrintRangeIsRejectedOnReceipt(String value) {
    assertThatThrownBy(
            () ->
                ConverterFunctions.JSON.toType(
                    "{\"context\":\"ctx\",\"pageRanges\":[" + value + "]}", PrintParameters.class))
        .isInstanceOf(JsonException.class);
  }

  @Test
  void validPrintRangesPreserveOutboundValuesAndReadWholeNumbersAsLongs() {
    List<Object> values = List.of(0L, 5.0, "1-3", 9007199254740991L);
    assertThat(new PrintParameters("ctx").setPageRanges(values).toMap())
        .containsEntry("pageRanges", values);
    PrintParameters parsed =
        ConverterFunctions.JSON.toType(
            "{\"context\":\"ctx\",\"pageRanges\":[0,5.0,\"1-3\",9007199254740991]}",
            PrintParameters.class);
    assertThat(parsed.getPageRanges()).hasValue(List.of(0L, 5L, "1-3", 9007199254740991L));
    assertThat(new PrintParameters("ctx").setPageRanges(List.of()).toMap())
        .containsEntry("pageRanges", List.of());
  }

  @Test
  void printRangesAreRevalidatedAfterCallerMutation() {
    List<Object> values = new ArrayList<>(List.of("1-3"));
    PrintParameters parameters = new PrintParameters("ctx").setPageRanges(values);
    values.add(true);
    assertThatThrownBy(parameters::toMap).isInstanceOf(RuntimeException.class);
  }

  @Test
  void nullPrimitiveElementIsRejectedOnReceipt() {
    assertThatThrownBy(
            () -> ConverterFunctions.JSON.toType("{\"events\":[null]}", SubscribeParameters.class))
        .isInstanceOf(JsonException.class);
  }

  @Test
  void nullEnumElementIsRejectedOnReceipt() {
    assertThatThrownBy(
            () ->
                ConverterFunctions.JSON.toType("{\"phases\":[null]}", AddInterceptParameters.class))
        .isInstanceOf(JsonException.class);
  }

  @Test
  void nullRecordElementIsRejectedOnReceipt() {
    assertThatThrownBy(
            () -> ConverterFunctions.JSON.toType("{\"contexts\":[null]}", GetTreeResult.class))
        .isInstanceOf(JsonException.class);
  }

  @Test
  void nullUnionElementIsRejectedOnReceipt() {
    assertThatThrownBy(
            () ->
                ConverterFunctions.JSON.toType(
                    "{\"type\":\"set\",\"value\":[null]}", SetLocalValue.class))
        .isInstanceOf(JsonException.class);
  }

  @ParameterizedTest
  @ValueSource(strings = {"true", "1", "null", "[]", "{\"type\":\"unknown\"}"})
  void mappingUnionRejectsInvalidInboundElements(String value) {
    assertThatThrownBy(
            () ->
                ConverterFunctions.JSON.toType(
                    "{\"type\":\"map\",\"value\":[[\"k\"," + value + "]]}", MapRemoteValue.class))
        .isInstanceOf(JsonException.class);
  }

  @ParameterizedTest
  @MethodSource("invalidMappingValues")
  void mappingUnionRejectsInvalidOutboundElements(Object value) {
    assertThatThrownBy(() -> new MapLocalValue("map", List.of(Arrays.asList("k", value))).toMap())
        .isInstanceOf(RuntimeException.class);
  }

  static Stream<Object> invalidMappingValues() {
    return Stream.of(true, 1L, null, List.of(), Map.of("type", "string", "value", "v"));
  }

  @Test
  void mappingUnionSerializesTypedVariantsThroughTheirWireRepresentation() {
    SharedReference key = SharedReference.builder("id").addExtension("vendor", 1).build();
    MapLocalValue value =
        new MapLocalValue("map", List.of(List.of(key, new StringValue("string", "v"))));
    assertThat(value.toMap())
        .containsEntry(
            "value",
            List.of(
                List.of(
                    Map.of("sharedId", "id", "vendor", 1),
                    Map.of("type", "string", "value", "v"))));
  }

  @Test
  void mappingUnionReadsTypedRemoteVariants() {
    MapRemoteValue value =
        ConverterFunctions.JSON.toType(
            "{\"type\":\"map\",\"value\":[[\"k\",{\"type\":\"string\",\"value\":\"v\"}]]}",
            MapRemoteValue.class);
    assertThat(value.getValue().orElseThrow().get(0).get(1)).isInstanceOf(StringValue.class);
  }

  @Test
  void validNullProtocolValueIsAnObjectVariant() {
    MapLocalValue value = new MapLocalValue("map", List.of(List.of("k", new NullValue("null"))));
    assertThat(value.toMap()).containsEntry("value", List.of(List.of("k", Map.of("type", "null"))));
  }

  @Test
  void validPrimitiveListsAndOmittedRangesStillWork() {
    SubscribeParameters parsed =
        ConverterFunctions.JSON.toType(
            "{\"events\":[\"log.entryAdded\"]}", SubscribeParameters.class);
    assertThat(parsed.getEvents()).containsExactly("log.entryAdded");
    assertThat(new SubscribeParameters(List.of()).toMap()).containsEntry("events", List.of());
    assertThat(new PrintParameters("ctx").toMap()).doesNotContainKey("pageRanges");
  }
}
