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

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/**
 * Vendor-declared fields (#18184): typed optional fields on a received shared type, a closed
 * vendor-variant record for a command's params, and the shared type stays closed either way.
 */
@Tag("UnitTests")
class VendorExtensionGenerationTest {

  private static final String CONTEXT_RECORD =
      "{'kind': 'record', 'fields': [{'name': 'context', 'wire': 'context', 'required': true,"
          + " 'type': {'primitive': 'string'}}]}";

  private static final String SCOPE_FIELD =
      "{'name': 'moz:scope', 'wire': 'moz:scope', 'required': false,"
          + " 'type': {'enum': ['chrome', 'content'], 'primitive': 'string'}}";

  private static String extending(String type, String fields) {
    return "{'moz': {'extends': {'" + type + "': {'fields': [" + fields + "]}}}}";
  }

  @Test
  void vendorFieldsOnAReceivedTypeAreTypedOptionalFieldsAndNoLongerDropped() {
    Generated out =
        new Schema()
            .receives("browsingContext.Info")
            .type("browsingContext.Info", CONTEXT_RECORD)
            .vendor(
                extending(
                    "browsingContext.Info",
                    "{'name': 'moz:name', 'wire': 'moz:name', 'required': false,"
                        + " 'type': {'primitive': 'string'}}, "
                        + SCOPE_FIELD))
            .generate();

    assertThat(out.type("browsingContext.Info"))
        .contains("private final Optional<String> mozName;")
        .contains("private final Optional<MozScope> mozScope;")
        .contains("map.get(\"moz:name\")")
        .contains("map.get(\"moz:scope\")")
        .contains("Set.of(\"context\", \"moz:name\", \"moz:scope\")")
        .doesNotContain("extensions");
    assertThat(out.type("browsingContext.MozScope"))
        .contains("CHROME(\"chrome\")")
        .contains("CONTENT(\"content\")");
  }

  @Test
  void vendorFieldsOnACommandsParamsGoOnAVariantRecordSentOnlyByTheVendorModule() {
    Generated out =
        new Schema()
            .command(
                "{'domain': 'browsingContext', 'method': 'browsingContext.getTree',"
                    + " 'name': 'getTree', 'params': {'ref': 'browsingContext.GetTreeParameters'},"
                    + " 'result': null}")
            .type("browsingContext.GetTreeParameters", CONTEXT_RECORD)
            .vendor(extending("browsingContext.GetTreeParameters", SCOPE_FIELD))
            .generate();

    assertThat(out.type("browsingContext.GetTreeParameters"))
        .doesNotContain("moz")
        .doesNotContain("extensions");
    assertThat(out.type("browsingContext.MozGetTreeParameters"))
        .contains("private Optional<MozScope> scope;")
        .contains("scope.ifPresent(v -> map.put(\"moz:scope\", v.toWireValue()));")
        .doesNotContain("extensions");
    assertThat(out.module("browsingContext"))
        .contains(
            "public void getTree(org.openqa.selenium.bidi.protocol.browsingcontext"
                + ".GetTreeParameters params) {")
        .contains("public static class Moz extends BrowsingContext {")
        .contains(
            "public void getTree(org.openqa.selenium.bidi.protocol.browsingcontext"
                + ".MozGetTreeParameters params) {");
  }

  @Test
  void vendorFieldsOnAnExtensibleTypeAreLeftToItsExtensions() {
    Generated out =
        new Schema()
            .receives("session.CapabilityRequest")
            .type(
                "session.CapabilityRequest", CONTEXT_RECORD.replace("]}", "], 'extensible': true}"))
            .vendor(extending("session.CapabilityRequest", SCOPE_FIELD))
            .generate();

    assertThat(out.type("session.CapabilityRequest"))
        .doesNotContain("moz")
        .contains("private final Map<String, Object> extensions;");
  }
}
