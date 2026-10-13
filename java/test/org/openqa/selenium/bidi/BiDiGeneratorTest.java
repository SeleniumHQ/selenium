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

package org.openqa.selenium.bidi;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.openqa.selenium.json.Json;

@Tag("UnitTests")
class BiDiGeneratorTest {

  private static Map<String, Map<String, Object>> protocolTypes;

  @TempDir Path output;

  @BeforeAll
  @SuppressWarnings("unchecked")
  static void readProtocolSchema() throws IOException {
    try (InputStream input =
        BiDiGeneratorTest.class.getResourceAsStream("/common/bidi/schema.json")) {
      assertThat(input).as("Bazel-packaged BiDi schema").isNotNull();
      Map<String, Object> schema =
          new Json().toType(new String(input.readAllBytes(), UTF_8), Json.MAP_TYPE);
      protocolTypes = (Map<String, Map<String, Object>>) schema.get("types");
    }
  }

  @Test
  void integerValuedSyntheticEnumsKeepNumericWireValues() throws IOException {
    String source =
        generate("emulation.MediaFeatures", true, false, "grid").source("emulation.MediaFeatures");
    assertThat(source)
        .contains("public enum Grid", "private final Long value", "fromJson(Long s)")
        .doesNotContain("private final String value", "fromJson(String s)");
    assertThat(source).contains("(0L)", "(1L)", "return value;");
  }

  @Test
  void stringEnumsUseExactWireVocabulary() throws IOException {
    String source = generate("script.SpecialNumber", false, true).source("script.SpecialNumber");
    assertThat(source)
        .contains(
            "public enum SpecialNumber",
            "private final String value",
            "fromJson(String s)",
            "e.value.equals(s)",
            "Unknown SpecialNumber value:");
    assertThat(source)
        .contains("(\"NaN\")", "(\"-0\")", "(\"Infinity\")", "(\"-Infinity\")")
        .doesNotContain("equalsIgnoreCase");
  }

  @Test
  void inlineUnionsValidateBothPrimitiveAndReferenceArms() throws IOException {
    String source = generate("script.NumberValue", true, true).source("script.NumberValue");
    assertThat(source)
        .contains(
            "private final Object value",
            "value instanceof Number || value instanceof SpecialNumber",
            "value must be one of its declared union types");
  }

  @Test
  void scalarListSerializationRejectsNullElements() throws IOException {
    String source =
        generate("script.DisownParameters", true, false, "handles")
            .source("script.DisownParameters");
    assertThat(source)
        .contains(
            "java.util.List<String> handles",
            "java.util.Objects.requireNonNull(e, \"handles element must not be null\")");
  }

  @Test
  void scalarUnionAliasesEmitLiteralAndObjectDispatch() throws IOException {
    Generation generated = generate("input.Origin", true, false);
    assertThat(generated.source("input.Origin"))
        .contains(
            "public interface Origin",
            "Object toWireValue()",
            "if (raw instanceof String)",
            "Literal.fromJson((String) raw)",
            "if (raw instanceof Map)",
            "ConverterFunctions.fromMap(ElementOrigin.class)",
            "enum Literal implements Origin",
            "(\"viewport\")",
            "(\"pointer\")");
  }

  @Test
  void scalarUnionObjectArmImplementsWireSerialization() throws IOException {
    String source = generate("input.Origin", true, false).source("input.ElementOrigin");
    assertThat(source)
        .contains(
            "public class ElementOrigin implements Origin",
            "public Object toWireValue() { return toMap(); }");
  }

  @Test
  void fieldlessSyntheticMapsAreInlinedInsteadOfEmittingEmptyClasses() throws IOException {
    Generation generated = generate("script.NodeProperties", false, true, "attributes");
    assertThat(generated.source("script.NodeProperties"))
        .contains("Optional<java.util.Map<String, String>> attributes")
        .doesNotContain("class Attributes", "NodeProperties.Attributes");
    assertThat(generated.files)
        .doesNotContainKey(
            "org/openqa/selenium/bidi/protocol/script/NodePropertiesAttributes.java");
  }

  @Test
  void incomingMapFieldsAreCopiedIntoUnmodifiableMaps() throws IOException {
    String source =
        generate("script.NodeProperties", false, true, "attributes")
            .source("script.NodeProperties");
    assertThat(source)
        .contains("java.util.Collections.unmodifiableMap(new java.util.LinkedHashMap<>(v))");
  }

  @Test
  void mapSerializationChecksValuesAndPreservesStringKeys() throws IOException {
    String source =
        generate("script.NodeProperties", true, false, "attributes")
            .source("script.NodeProperties");
    assertThat(source)
        .contains(
            "java.util.Map.Entry::getKey",
            "java.util.Objects.requireNonNull(e.getValue(), \"attributes value must not be null\")",
            "java.util.LinkedHashMap::new");
  }

  @Test
  void senderOnlyOptionalRecordsHaveFluentSetters() throws IOException {
    String source =
        generate("emulation.SetLocaleOverrideParameters", true, false)
            .source("emulation.SetLocaleOverrideParameters");
    assertThat(source)
        .contains(
            "public SetLocaleOverrideParameters setContexts(",
            "Optional.ofNullable(contexts)",
            "contexts.ifPresent(v -> map.put(\"contexts\",")
        .doesNotContain("static class Builder", "SetOverride");
  }

  @Test
  void receiverOnlyOptionalRecordsAreImmutable() throws IOException {
    String source =
        generate("script.NodeProperties", false, true, "localName").source("script.NodeProperties");
    assertThat(source)
        .contains(
            "private final Optional<String> localName", "public Optional<String> getLocalName()")
        .doesNotContain(
            "setLocalName(", "static class Builder", "public Map<String, Object> toMap()");
  }

  @Test
  void bidirectionalOptionalRecordsUseSeparateBuilders() throws IOException {
    String source = generate("script.SharedReference", true, true).source("script.SharedReference");
    assertThat(source)
        .contains(
            "public static final class Builder",
            "public static Builder builder(String sharedId)",
            "public Builder setHandle(String handle)",
            "public SharedReference build()")
        .doesNotContain("public SharedReference setHandle(");
  }

  @Test
  void allRequiredRecordsUseDirectConstructors() throws IOException {
    String source = generate("script.StringValue", true, true).source("script.StringValue");
    assertThat(source)
        .contains(
            "public StringValue(String type, String value)",
            "Objects.requireNonNull(value, \"value is required\")")
        .doesNotContain("static class Builder");
  }

  @Test
  void emptyRecordsSerializeAsEmptyMaps() throws IOException {
    String source =
        generate("userAgentClientHints.SetClientHintsOverrideResult", true, false)
            .source("userAgentClientHints.SetClientHintsOverrideResult");
    assertThat(source)
        .contains("public SetClientHintsOverrideResult() {}", "return Collections.emptyMap();");
  }

  @Test
  void requiredNullableReferencesHaveTypeUseAnnotations() throws IOException {
    String source =
        generate("browsingContext.Info", false, true, "children", "originalOpener")
            .source("browsingContext.Info");
    assertThat(source)
        .contains("java.util.@Nullable List<Info> children", "@Nullable String originalOpener")
        .doesNotContain(
            "Objects.requireNonNull(children",
            "Objects.requireNonNull(originalOpener",
            "@Nullable java.util.List");
  }

  @Test
  void nullableBooleanConstantsAreBoxedAndValidated() throws IOException {
    String source =
        generate("browsingContext.SetBypassCSPParameters", true, false, "bypass")
            .source("browsingContext.SetBypassCSPParameters");
    assertThat(source)
        .contains(
            "@Nullable Boolean bypass",
            "bypass != null",
            "!Objects.equals(bypass, true)",
            "map.put(\"bypass\", bypass)")
        .doesNotContain("@Nullable boolean bypass");
  }

  @Test
  void optionalNullableFieldsTrackExplicitNullSeparatelyFromAbsence() throws IOException {
    String source =
        generate("emulation.MediaFeatures", true, false, "grid").source("emulation.MediaFeatures");
    assertThat(source)
        .contains(
            "boolean gridSet",
            "this.gridSet = true",
            "if (gridSet)",
            "grid.isPresent() ? grid.get().toWireValue() : null");
  }

  @Test
  void nullableReferencesAreGuardedBeforeSerialization() throws IOException {
    String source =
        generate("browser.SetDownloadBehaviorParameters", true, false, "downloadBehavior")
            .source("browser.SetDownloadBehaviorParameters");
    assertThat(source).contains("downloadBehavior == null ? null : downloadBehavior.toMap()");
  }

  @Test
  void scalarAliasesResolveInlineWithoutWrapperClasses() throws IOException {
    Generation generated = generate("script.SharedReference", true, true);
    assertThat(generated.source("script.SharedReference"))
        .contains("String sharedId", "Optional<String> handle");
    assertThat(generated.files)
        .doesNotContainKeys(
            "org/openqa/selenium/bidi/protocol/script/Handle.java",
            "org/openqa/selenium/bidi/protocol/script/SharedId.java");
  }

  @Test
  void listAliasesResolveTheirElementsAndSerializationRecursively() throws IOException {
    Generation generated = generate("script.ArrayLocalValue", true, false, "value");
    assertThat(generated.source("script.ArrayLocalValue"))
        .contains(
            "java.util.List<LocalValue> value",
            "java.util.Objects.requireNonNull(e, \"value element must not be null\").toMap()");
    assertThat(generated.files)
        .doesNotContainKey("org/openqa/selenium/bidi/protocol/script/ListLocalValue.java");
  }

  @Test
  void incomingListFieldsAreCopiedIntoUnmodifiableLists() throws IOException {
    String source =
        generate("script.NodeProperties", false, true, "children").source("script.NodeProperties");
    assertThat(source)
        .contains("java.util.Collections.unmodifiableList(new java.util.ArrayList<>(v))");
  }

  @Test
  void stringConstantsAreValidatedAndWrittenUnderTheirWireKey() throws IOException {
    String source = generate("script.StringValue", true, false).source("script.StringValue");
    assertThat(source)
        .contains(
            "!Objects.equals(type, \"string\")",
            "type must be \" + \"string\"",
            "map.put(\"type\", type)");
  }

  @Test
  void orderedUnionsDispatchByRequiredKeysInOrder() throws IOException {
    String source =
        generate("script.RemoteReference", false, true).source("script.RemoteReference");
    assertThat(source)
        .contains(
            "public interface RemoteReference",
            "if (map.containsKey(\"sharedId\"))",
            "ConverterFunctions.fromMap(SharedReference.class)",
            "if (map.containsKey(\"handle\"))",
            "ConverterFunctions.fromMap(RemoteObjectReference.class)");
    assertThat(source.indexOf("map.containsKey(\"sharedId\")"))
        .isLessThan(source.indexOf("map.containsKey(\"handle\")"));
  }

  @Test
  void discriminatedUnionsDispatchByExactStringValues() throws IOException {
    String source = generate("network.BytesValue", true, true).source("network.BytesValue");
    assertThat(source)
        .contains(
            "map.get(\"type\")",
            "\"string\".equals(discriminator)",
            "\"base64\".equals(discriminator)",
            "ConverterFunctions.fromMap(StringValue.class)",
            "ConverterFunctions.fromMap(Base64Value.class)",
            "private static BytesValue fromJson(");
  }

  @Test
  void booleanUnionDiscriminatorsStayBoolean() throws IOException {
    String source =
        generate("bluetooth.HandleRequestDevicePromptParameters", true, false)
            .source("bluetooth.HandleRequestDevicePromptParameters");
    assertThat(source)
        .contains("Objects.equals(discriminator, true)", "Objects.equals(discriminator, false)")
        .doesNotContain("\"true\".equals(discriminator)", "\"false\".equals(discriminator)");
  }

  @Test
  void unionDefaultArmsAreUsedAfterKnownVariants() throws IOException {
    String source =
        generate("network.ContinueWithAuthParameters", true, false)
            .source("network.ContinueWithAuthParameters");
    assertThat(source)
        .contains(
            "\"provideCredentials\".equals(discriminator)",
            "ConverterFunctions.fromMap(ContinueWithAuthParameters.NoCredentials.class)");
    assertThat(source.indexOf("\"provideCredentials\".equals(discriminator)"))
        .isLessThan(
            source.indexOf(
                "ConverterFunctions.fromMap(ContinueWithAuthParameters.NoCredentials.class)"));
  }

  @Test
  void extensibleRecordsFlattenExtensionsAndRejectDeclaredKeyCollisions() throws IOException {
    String source = generate("script.SharedReference", true, true).source("script.SharedReference");
    assertThat(source)
        .contains(
            "DEFINED_FIELDS.contains(key)",
            "Cannot add an extension for a declared field",
            "extensions.forEach(map::put)",
            "this.extensions = new LinkedHashMap<>(extensions)",
            "if (!DEFINED_FIELDS.contains(entry.getKey()))",
            "extensions.put(entry.getKey(), entry.getValue())")
        .doesNotContain("map.put(\"extensions\"");
  }

  @Test
  void reservedFieldNamesKeepTheirOriginalWireNamesInDecoders() throws IOException {
    String source =
        generate("session.UserPromptHandler", true, true, "default")
            .source("session.UserPromptHandler");
    assertThat(source)
        .contains(
            "Optional<UserPromptHandlerType> default_",
            "map.get(\"default\")",
            "default_.ifPresent(v -> map.put(\"default\", v.toWireValue()))")
        .doesNotContain("map.get(\"default_\")", "map.put(\"default_\"");
  }

  @Test
  void unsignedIntegerAliasesEnforceTheJavaScriptSafeRange() throws IOException {
    String source =
        generate("script.NodeProperties", false, true, "nodeType").source("script.NodeProperties");
    assertThat(source)
        .contains(
            "long nodeType",
            "nodeType < 0L",
            "nodeType > 9007199254740991L",
            "nodeType must be between 0 and 9007199254740991");
  }

  @Test
  void closedIncomingRecordsWarnOnUnknownFields() throws IOException {
    String source =
        generate("script.NodeProperties", false, true, "localName").source("script.NodeProperties");
    assertThat(source)
        .containsPattern("@WarnOnUnknownFields|UnknownFieldsWarning\\.warnOnUnknownFields")
        .doesNotContain("Map<String, Object> extensions");
  }

  @Test
  void nestedListAliasesUseDistinctLambdaVariablesAndCheckEachLevel() throws IOException {
    String source =
        generate("script.MapLocalValue", true, false, "value").source("script.MapLocalValue");
    assertThat(source)
        .contains(
            "java.util.List<java.util.List<Object>> value",
            ".map(e ->",
            ".map(e1 ->",
            "java.util.Objects.requireNonNull(e, \"value element must not be null\")",
            "java.util.Objects.requireNonNull(e1, \"value element must not be null\")");
  }

  @Test
  void recordListElementsAreSerializedThroughTheirOwnMaps() throws IOException {
    String source =
        generate("network.ContinueRequestParameters", true, false, "headers")
            .source("network.ContinueRequestParameters");
    assertThat(source)
        .contains(
            "Optional<java.util.List<Header>> headers",
            "java.util.Objects.requireNonNull(e, \"headers element must not be null\").toMap()");
  }

  @Test
  void nullableBuildersPassExplicitPresenceIntoTheirConstructors() throws IOException {
    String source =
        generate("emulation.MediaFeatures", true, true, "grid").source("emulation.MediaFeatures");
    assertThat(source)
        .contains(
            "Optional<Boolean> gridSetOverride",
            "gridSetOverride.get()",
            "this.gridSet = true",
            "Optional.of(gridSet)");
  }

  @Test
  void reservedFieldDecodersStillWarnForClosedIncomingRecords() throws IOException {
    String source =
        generate("session.UserPromptHandler", false, true, "default")
            .source("session.UserPromptHandler");
    assertThat(source)
        .contains(
            "UnknownFieldsWarning.warnOnUnknownFields(",
            "UserPromptHandler.class",
            "Set.of(\"default\")",
            "map.get(\"default\")");
  }

  @Test
  void signedIntegerAliasesAllowTheNegativeSafeRange() throws IOException {
    String source =
        generate("browsingContext.TraverseHistoryParameters", true, false, "delta")
            .source("browsingContext.TraverseHistoryParameters");
    assertThat(source)
        .contains("long delta", "delta < -9007199254740991L", "delta > 9007199254740991L");
  }

  // The field nodes are taken directly from the projected protocol schema. The single command
  // only supplies reachability and send/receive direction; it is not an assertion oracle.
  @SuppressWarnings("unchecked")
  private Generation generate(String typeName, boolean outbound, boolean inbound, String... fields)
      throws IOException {
    Map<String, Object> root = new LinkedHashMap<>(protocolTypes.get(typeName));
    if (fields.length != 0) {
      Set<String> names = Set.of(fields);
      List<Map<String, Object>> selected =
          ((List<Map<String, Object>>) root.get("fields"))
              .stream().filter(f -> names.contains(f.get("name"))).collect(Collectors.toList());
      assertThat(selected).as("schema fields for %s", typeName).hasSize(names.size());
      root.put("fields", selected);
    }
    Map<String, Map<String, Object>> types = new LinkedHashMap<>();
    types.put(typeName, root);
    includeReferencedTypes(root, types);
    Map<String, Object> command = new LinkedHashMap<>();
    command.put("domain", "test");
    command.put("method", "test.use");
    command.put("name", "use");
    if (outbound) command.put("params", Map.of("ref", typeName));
    if (inbound) command.put("result", Map.of("ref", typeName));
    Path directory = Files.createTempDirectory(output, "fragment-");
    new BiDiGenerator.Generator(Map.of("types", types, "commands", List.of(command)))
        .generateAll(directory);
    Map<String, String> files = new LinkedHashMap<>();
    try (java.util.stream.Stream<Path> paths = Files.walk(directory)) {
      for (Path path : paths.filter(Files::isRegularFile).collect(Collectors.toList())) {
        files.put(
            directory.relativize(path).toString(),
            Files.readString(path, UTF_8).replaceAll("\\s+", " "));
      }
    }
    return new Generation(files);
  }

  private static void includeReferencedTypes(Object node, Map<String, Map<String, Object>> types) {
    if (node instanceof Map) {
      ((Map<?, ?>) node).values().forEach(v -> includeReferencedTypes(v, types));
    } else if (node instanceof List) {
      ((List<?>) node).forEach(v -> includeReferencedTypes(v, types));
    } else if (node instanceof String
        && protocolTypes.containsKey(node)
        && !types.containsKey(node)) {
      String name = (String) node;
      Map<String, Object> definition = protocolTypes.get(name);
      types.put(name, definition);
      includeReferencedTypes(definition, types);
    }
  }

  private static class Generation {
    private final Map<String, String> files;

    Generation(Map<String, String> files) {
      this.files = files;
    }

    String source(String typeName) {
      int separator = typeName.lastIndexOf('.');
      String path =
          "org/openqa/selenium/bidi/protocol/"
              + typeName.substring(0, separator).toLowerCase(Locale.ROOT)
              + "/"
              + typeName.substring(separator + 1)
              + ".java";
      assertThat(files).as("generated files").containsKey(path);
      return files.get(path);
    }
  }
}
