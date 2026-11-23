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

package org.openqa.selenium.bidi.generator;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.bidi.generator.Fragments.STRING_ALIAS;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/** Extensible records: capturing undeclared fields on receipt and sending added ones. */
@Tag("UnitTests")
class ExtensibleRecordGenerationTest {

  @Test
  void extensibleSentAndReceivedRecordCapturesAndSendsExtensions() {
    Generated out =
        new Schema()
            .sends("script.SharedReference")
            .receives("script.SharedReference")
            .type(
                "script.SharedReference",
                "{'kind': 'record', 'fields': ["
                    + "{'name': 'sharedId', 'wire': 'sharedId', 'required': true,"
                    + " 'type': {'ref': 'script.SharedId'}},"
                    + "{'name': 'handle', 'wire': 'handle', 'required': false,"
                    + " 'type': {'ref': 'script.Handle'}}], 'extensible': true}")
            .type("script.SharedId", STRING_ALIAS)
            .type("script.Handle", STRING_ALIAS)
            .generate();

    assertThat(out.type("script.SharedReference"))
        .doesNotContain("@WarnOnUnknownFields\n")
        .doesNotContain("UnknownFieldsWarning")
        .contains("private final Map<String, Object> extensions;")
        .contains("Set.of(\"sharedId\", \"handle\");")
        .contains("this.extensions = new LinkedHashMap<>(extensions);")
        .contains("public Map<String, Object> getExtensions() {")
        .contains("extensions.forEach(map::put);")
        .contains("public Builder addExtension(String key, Object value) {")
        .contains("if (DEFINED_FIELDS.contains(key)) {")
        .contains("return new SharedReference(sharedId, Optional.ofNullable(handle), extensions);")
        .contains("if (!DEFINED_FIELDS.contains(entry.getKey())) {")
        .contains("return new SharedReference(sharedId, handle, extensions);");
  }

  @Test
  void extensibleSentOnlyRecordAddsExtensionsDirectlyWithoutABuilder() {
    Generated out =
        new Schema()
            .sends("session.CapabilityRequest")
            .type(
                "session.CapabilityRequest",
                "{'kind': 'record', 'fields': ["
                    + "{'name': 'acceptInsecureCerts', 'wire': 'acceptInsecureCerts',"
                    + " 'required': false, 'type': {'primitive': 'boolean'}},"
                    + "{'name': 'browserName', 'wire': 'browserName', 'required': false,"
                    + " 'type': {'primitive': 'string'}}], 'extensible': true}")
            .generate();

    assertThat(out.type("session.CapabilityRequest"))
        .contains("private final Map<String, Object> extensions = new LinkedHashMap<>();")
        .contains("Set.of(\"acceptInsecureCerts\", \"browserName\");")
        .contains("public CapabilityRequest addExtension(String key, Object value) {")
        .contains("if (DEFINED_FIELDS.contains(key)) {")
        .contains("extensions.forEach(map::put);")
        .doesNotContain("Builder")
        .doesNotContain("fromJson");
  }
}
