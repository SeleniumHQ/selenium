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
import static org.openqa.selenium.bidi.generator.Fragments.WINDOW_REALM_INFO;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/** Union emission: discriminated, structural, correlated and scalar unions. */
@Tag("UnitTests")
class UnionGenerationTest {

  @Test
  void discriminatedUnionDispatchesOnTheSelectorField() {
    Generated out =
        new Schema()
            .event(
                "{'domain': 'script', 'method': 'script.realmCreated', 'name': 'realmCreated',"
                    + " 'params': {'ref': 'script.RealmInfo'}}")
            .type(
                "script.RealmInfo",
                "{'kind': 'union', 'variants': ['script.WindowRealmInfo',"
                    + " 'script.DedicatedWorkerRealmInfo'], 'selector': {'by': 'type', 'variants':"
                    + " [{'value': 'window', 'ref': 'script.WindowRealmInfo'},{'value':"
                    + " 'dedicated-worker', 'ref': 'script.DedicatedWorkerRealmInfo'}]}}")
            .type("script.WindowRealmInfo", WINDOW_REALM_INFO)
            .type("script.Realm", STRING_ALIAS)
            .type("browsingContext.BrowsingContext", STRING_ALIAS)
            .generate();

    assertThat(out.type("script.RealmInfo"))
        .contains("public interface RealmInfo {")
        .doesNotContain("Map<String, Object> toMap();")
        .contains("Object discriminator = map.get(\"type\");")
        .contains("if (\"window\".equals(discriminator))")
        .contains(
            "return (RealmInfo)(Object) ConverterFunctions.fromMap(WindowRealmInfo.class)"
                + ".apply(map);")
        .contains("if (\"dedicated-worker\".equals(discriminator))")
        .contains(
            "throw new BiDiException(\"Unknown RealmInfo discriminator '\" + discriminator +"
                + " \"'\");")
        .contains("private static RealmInfo fromJson(Map<String, Object> map) {");
    assertThat(out.type("script.WindowRealmInfo"))
        .contains("public class WindowRealmInfo implements RealmInfo {");
  }

  @Test
  void nestedSyntheticVariantIsEmittedInsideItsUnionAndWarnsOnUnknownFields() {
    Generated out =
        new Schema()
            .event(
                "{'domain': 'browsingContext', 'method': 'browsingContext.downloadEnd', 'name':"
                    + " 'downloadEnd', 'params': {'ref': 'browsingContext.DownloadEndParams'}}")
            .type(
                "browsingContext.DownloadEndParams",
                "{'kind': 'union', 'variants':"
                    + " ['browsingContext.DownloadEndParams_CanceledParams'], 'selector': {'by':"
                    + " 'status', 'variants': [{'value': 'canceled', 'ref':"
                    + " 'browsingContext.DownloadEndParams_CanceledParams'}]}}")
            .type(
                "browsingContext.DownloadEndParams_CanceledParams",
                "{'kind': 'record', 'fields': ["
                    + "{'name': 'status', 'wire': 'status', 'required': true,"
                    + " 'type': {'const': 'canceled'}},"
                    + "{'name': 'url', 'wire': 'url', 'required': true,"
                    + " 'type': {'primitive': 'string'}}],"
                    + " 'synthetic': true, 'owner': 'browsingContext.DownloadEndParams',"
                    + " 'label': 'CanceledParams'}")
            .generate();

    assertThat(out.has("browsingContext.DownloadEndParams_CanceledParams")).isFalse();
    assertThat(out.type("browsingContext.DownloadEndParams"))
        .contains(
            "@WarnOnUnknownFields\n  public static class CanceledParams implements"
                + " DownloadEndParams {")
        .contains(
            "return (DownloadEndParams)(Object) ConverterFunctions.fromMap("
                + "DownloadEndParams.CanceledParams.class).apply(map);");
  }

  @Test
  void discriminatedUnionWithADefaultFallsBackInsteadOfThrowing() {
    Generated out =
        new Schema()
            .receives("log.Entry")
            .type(
                "log.Entry",
                "{'kind': 'union', 'variants': ['log.GenericLogEntry', 'log.ConsoleLogEntry'],"
                    + " 'selector': {'by': 'type', 'variants': ["
                    + "{'value': 'console', 'ref': 'log.ConsoleLogEntry'}],"
                    + " 'default': 'log.GenericLogEntry'}}")
            .generate();

    assertThat(out.type("log.Entry"))
        .contains("if (\"console\".equals(discriminator))")
        .contains(
            "    return (Entry)(Object) ConverterFunctions.fromMap(GenericLogEntry.class)"
                + ".apply(map);\n  }")
        .doesNotContain("Unknown Entry discriminator");
  }

  @Test
  void booleanDiscriminatorIsComparedAsABooleanLiteral() {
    Generated out =
        new Schema()
            .sends("bluetooth.HandleRequestDevicePromptParameters")
            .type(
                "bluetooth.HandleRequestDevicePromptParameters",
                "{'kind': 'union', 'variants': ["
                    + "'bluetooth.HandleRequestDevicePromptParameters_AcceptParameters',"
                    + " 'bluetooth.HandleRequestDevicePromptParameters_CancelParameters'],"
                    + " 'selector': {'by': 'accept', 'variants': [{'value': true, 'ref':"
                    + " 'bluetooth.HandleRequestDevicePromptParameters_AcceptParameters'},"
                    + " {'value': false, 'ref':"
                    + " 'bluetooth.HandleRequestDevicePromptParameters_CancelParameters'}]}}")
            .generate();

    assertThat(out.type("bluetooth.HandleRequestDevicePromptParameters"))
        .contains("Map<String, Object> toMap();")
        .contains("if (Objects.equals(discriminator, true))")
        .contains("if (Objects.equals(discriminator, false))")
        .doesNotContain("\"true\".equals");
  }

  @Test
  void structuralUnionDispatchesOnRequiredFieldPresenceInOrder() {
    Generated out =
        new Schema()
            .sends("script.Target")
            .type(
                "script.Target",
                "{'kind': 'union', 'variants': ['script.ContextTarget', 'script.RealmTarget'],"
                    + " 'selector': {'ordered': ["
                    + "{'ref': 'script.ContextTarget', 'requires': ['context']},"
                    + "{'ref': 'script.RealmTarget', 'requires': ['realm']}]}}")
            .type(
                "script.ContextTarget",
                "{'kind': 'record', 'fields': ["
                    + "{'name': 'context', 'wire': 'context', 'required': true,"
                    + " 'type': {'ref': 'browsingContext.BrowsingContext'}},"
                    + "{'name': 'sandbox', 'wire': 'sandbox', 'required': false,"
                    + " 'type': {'primitive': 'string'}}]}")
            .type(
                "script.RealmTarget",
                "{'kind': 'record', 'fields': [{'name': 'realm', 'wire': 'realm',"
                    + " 'required': true, 'type': {'ref': 'script.Realm'}}]}")
            .type("browsingContext.BrowsingContext", STRING_ALIAS)
            .type("script.Realm", STRING_ALIAS)
            .generate();

    String target = out.type("script.Target");
    assertThat(target)
        .contains("Map<String, Object> toMap();")
        .contains("if (map.containsKey(\"context\"))")
        .contains("if (map.containsKey(\"realm\"))")
        .contains(
            "throw new BiDiException(\"Cannot determine Target variant from fields: \" +"
                + " map.keySet());");
    assertThat(target.indexOf("\"context\"")).isLessThan(target.indexOf("\"realm\""));
    assertThat(out.type("script.ContextTarget"))
        .contains("public class ContextTarget implements Target {")
        .contains("@Override\n  public Map<String, Object> toMap() {");
  }

  @Test
  void correlatedUnionIsNotGenerated() {
    Generated out =
        new Schema()
            .receives("BrowserResult")
            .type(
                "BrowserResult",
                "{'kind': 'union', 'variants': ['browser.CloseResult'],"
                    + " 'selector': {'correlated': true}}")
            .generate();

    assertThat(out.has("BrowserResult")).isFalse();
  }

  @Test
  void scalarUnionAliasEmitsAnInterfaceWithALiteralEnumAndAnObjectArm() {
    Generated out =
        new Schema()
            .sends("input.PointerMoveAction")
            .type(
                "input.PointerMoveAction",
                "{'kind': 'record', 'fields': ["
                    + "{'name': 'type', 'wire': 'type', 'required': true,"
                    + " 'type': {'const': 'pointerMove'}},"
                    + "{'name': 'origin', 'wire': 'origin', 'required': false,"
                    + " 'type': {'ref': 'input.Origin'}}]}")
            .type(
                "input.Origin",
                "{'kind': 'alias', 'type': {'union': [{'const': 'viewport'}, {'const': 'pointer'},"
                    + " {'ref': 'input.ElementOrigin'}], 'scalar': 'string',"
                    + " 'scalarValues': ['viewport', 'pointer']}}")
            .type(
                "input.ElementOrigin",
                "{'kind': 'record', 'fields': ["
                    + "{'name': 'type', 'wire': 'type', 'required': true,"
                    + " 'type': {'const': 'element'}},"
                    + "{'name': 'element', 'wire': 'element', 'required': true,"
                    + " 'type': {'ref': 'script.SharedReference'}}]}")
            .type(
                "script.SharedReference",
                "{'kind': 'record', 'fields': [{'name': 'sharedId', 'wire': 'sharedId',"
                    + " 'required': true, 'type': {'primitive': 'string'}}]}")
            .generate();

    assertThat(out.type("input.Origin"))
        .contains("public interface Origin {")
        .contains("Object toWireValue();")
        .contains("return Literal.fromJson((String) raw);")
        .contains(
            "return (Origin) (Object) ConverterFunctions.fromMap(ElementOrigin.class)"
                + ".apply((Map<String, Object>) raw);")
        .contains("enum Literal implements Origin {")
        .contains("VIEWPORT(\"viewport\"),")
        .contains("POINTER(\"pointer\");")
        .contains(
            "throw new BiDiException(\"Expected a string or an object for Origin, got: \" +"
                + " raw);");

    // input.Origin is a scalar-union alias, so it declares toWireValue() rather than toMap() —
    // an @Override on the object arm's toMap() would not compile.
    assertThat(out.type("input.ElementOrigin"))
        .contains("public class ElementOrigin implements Origin {")
        .doesNotContain("@Override\n  public Map<String, Object> toMap()")
        .contains("@Override\n  public Object toWireValue() {\n    return toMap();\n  }")
        .contains("map.put(\"element\", element.toMap());")
        .contains("org.openqa.selenium.bidi.protocol.script.SharedReference element");

    assertThat(out.type("input.PointerMoveAction"))
        .contains("private Optional<Origin> origin;")
        .contains("origin.ifPresent(v -> map.put(\"origin\", v.toWireValue()));");
  }
}
