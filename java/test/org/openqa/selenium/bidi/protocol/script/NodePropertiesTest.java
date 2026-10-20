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

import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.ConverterFunctions;
import org.openqa.selenium.json.JsonException;

@Tag("UnitTests")
class NodePropertiesTest {

  // script.NodeProperties.attributes is {*text => text} in the CDDL. The schema projector hoists
  // it into a field-less synthetic map record (script.NodePropertiesAttributes); the generator
  // must type it as Map<String, String> rather than an empty nested Attributes class (#18106).

  @Test
  void attributesDeserializeAsAStringMap() {
    NodeProperties props =
        ConverterFunctions.JSON.toType(
            "{\"nodeType\": 1, \"childNodeCount\": 0,"
                + " \"attributes\": {\"id\": \"main\", \"class\": \"a b\"}}",
            NodeProperties.class);

    assertThat(props.getAttributes()).hasValue(Map.of("id", "main", "class", "a b"));
  }

  @Test
  void attributesAreUnmodifiable() {
    NodeProperties props =
        ConverterFunctions.JSON.toType(
            "{\"nodeType\": 1, \"childNodeCount\": 0, \"attributes\": {\"id\": \"main\"}}",
            NodeProperties.class);

    Map<String, String> attributes = props.getAttributes().orElseThrow();
    assertThatThrownBy(() -> attributes.put("id", "other"))
        .isInstanceOf(UnsupportedOperationException.class);
  }

  @Test
  void absentAttributesAreEmpty() {
    NodeProperties props =
        ConverterFunctions.JSON.toType(
            "{\"nodeType\": 1, \"childNodeCount\": 0}", NodeProperties.class);

    assertThat(props.getAttributes()).isEmpty();
  }

  @Test
  void attributesThatAreNotAnObjectAreRejected() {
    assertThatThrownBy(
            () ->
                ConverterFunctions.JSON.toType(
                    "{\"nodeType\": 1, \"childNodeCount\": 0, \"attributes\": \"oops\"}",
                    NodeProperties.class))
        .isInstanceOf(JsonException.class);
  }

  @Test
  void attributesWithNonStringValuesAreRejected() {
    assertThatThrownBy(
            () ->
                ConverterFunctions.JSON.toType(
                    "{\"nodeType\": 1, \"childNodeCount\": 0, \"attributes\": {\"id\": 1}}",
                    NodeProperties.class))
        .isInstanceOf(JsonException.class);
  }
}
