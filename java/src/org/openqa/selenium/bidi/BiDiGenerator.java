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

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.jar.JarEntry;
import java.util.jar.JarOutputStream;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.openqa.selenium.json.Json;

/**
 * Generates Java BiDi module classes and their supporting POJOs from the flat binding-neutral
 * {@code bidi_schema.json} produced by {@code project_bidi_schema.mjs}.
 *
 * <p>Usage: {@code BiDiGenerator <schema.json> <output.srcjar>}
 */
public class BiDiGenerator {

  private static final String BASE_PKG = "org.openqa.selenium.bidi";

  // Java reserved words that cannot appear as method names; append "_" to escape.
  private static final Set<String> JAVA_RESERVED =
      new java.util.HashSet<>(
          java.util.Arrays.asList(
              "abstract",
              "assert",
              "boolean",
              "break",
              "byte",
              "case",
              "catch",
              "char",
              "class",
              "const",
              "continue",
              "default",
              "do",
              "double",
              "else",
              "enum",
              "extends",
              "final",
              "finally",
              "float",
              "for",
              "goto",
              "if",
              "implements",
              "import",
              "instanceof",
              "int",
              "interface",
              "long",
              "native",
              "new",
              "package",
              "private",
              "protected",
              "public",
              "return",
              "short",
              "static",
              "strictfp",
              "super",
              "switch",
              "synchronized",
              "this",
              "throw",
              "throws",
              "transient",
              "try",
              "void",
              "volatile",
              "while"));

  private static final String API_JAVADOC =
      "/**\n"
          + " * This is an unsupported API. No compatibility guarantees are provided.\n"
          + " * It tracks the W3C WebDriver BiDi specification directly. As the specification\n"
          + " * evolves, this API will change or be removed without prior notice.\n"
          + " */\n";

  private static final String LICENSE =
      "// Licensed to the Software Freedom Conservancy (SFC) under one\n"
          + "// or more contributor license agreements.  See the NOTICE file\n"
          + "// distributed with this work for additional information\n"
          + "// regarding copyright ownership.  The SFC licenses this file\n"
          + "// to you under the Apache License, Version 2.0 (the\n"
          + "// \"License\"); you may not use this file except in compliance\n"
          + "// with the License.  You may obtain a copy of the License at\n"
          + "//\n"
          + "//   http://www.apache.org/licenses/LICENSE-2.0\n"
          + "//\n"
          + "// Unless required by applicable law or agreed to in writing,\n"
          + "// software distributed under the License is distributed on an\n"
          + "// \"AS IS\" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY\n"
          + "// KIND, either express or implied.  See the License for the\n"
          + "// specific language governing permissions and limitations\n"
          + "// under the License.\n\n"
          + "// This file is generated. Do not edit — regenerate via BiDiGenerator.\n\n";

  public static void main(String[] args) throws IOException {
    if (args.length != 2) {
      System.err.println("Usage: BiDiGenerator <schema.json> <output.srcjar>");
      System.exit(1);
    }

    Path schemaFile = Paths.get(args[0]);
    Path outputJar = Paths.get(args[1]).toAbsolutePath();

    String schemaText = new String(Files.readAllBytes(schemaFile), UTF_8);
    @SuppressWarnings("unchecked")
    Map<String, Object> schema = (Map<String, Object>) new Json().toType(schemaText, Json.MAP_TYPE);

    Path tempDir = Files.createTempDirectory("bidi-generated");
    try {
      new Generator(schema).generateAll(tempDir);
      packToJar(tempDir, outputJar);
    } finally {
      deleteRecursive(tempDir);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Generator
  // ═══════════════════════════════════════════════════════════════

  private static class Generator {

    private final Map<String, Object> schema;
    private final Map<String, Map<String, Object>> types = new LinkedHashMap<>();

    /** Types reachable from command/event params and results — the only ones that get generated. */
    private final Set<String> reachable;

    /** Types reachable from command params — the only ones that need toMap(). */
    private final Set<String> senderTypes;

    /**
     * Types reachable from command results or event params — i.e. types a caller can receive. A
     * type in both this set and {@code senderTypes} is used bidirectionally (e.g.
     * script.SharedReference: built to send as a script argument, and also received inside a remote
     * value) and is the only case that needs an immutable value class plus a separate Builder — see
     * {@link #appendBuilder}.
     */
    private final Set<String> receivableTypes;

    /**
     * Maps a variant record/union name to every parent union it belongs to. A type can genuinely
     * belong to more than one union at once (e.g. PrimitiveProtocolValue is a member of both
     * RemoteValue and LocalValue) — unions are generated as interfaces specifically so this is a
     * real "implements/extends more than one" relationship, not something that has to be dropped.
     */
    private final Map<String, List<String>> variantParent;

    /**
     * Synthetic types (anonymous CDDL constructs hoisted by the normalizer) keyed by their owner
     * type name. They are emitted as nested static classes instead of top-level files.
     */
    private final Map<String, List<String>> syntheticChildren;

    @SuppressWarnings("unchecked")
    Generator(Map<String, Object> schema) {
      this.schema = schema;
      Map<String, Object> rawTypes = (Map<String, Object>) schema.get("types");
      if (rawTypes != null) {
        for (Map.Entry<String, Object> entry : rawTypes.entrySet()) {
          types.put(entry.getKey(), (Map<String, Object>) entry.getValue());
        }
      }
      List<Map<String, Object>> commands =
          Optional.ofNullable((List<Map<String, Object>>) schema.get("commands"))
              .orElse(Collections.emptyList());
      List<Map<String, Object>> events =
          Optional.ofNullable((List<Map<String, Object>>) schema.get("events"))
              .orElse(Collections.emptyList());
      this.reachable = computeReachable(commands, events);
      this.senderTypes = computeSenderTypes();
      this.receivableTypes = computeReceivableTypes();
      this.variantParent = computeVariantParent();
      this.syntheticChildren = computeSyntheticChildren();
    }

    @SuppressWarnings("unchecked")
    private Map<String, List<String>> computeSyntheticChildren() {
      Map<String, List<String>> result = new LinkedHashMap<>();
      for (Map.Entry<String, Map<String, Object>> e : types.entrySet()) {
        Map<String, Object> node = e.getValue();
        if (!Boolean.TRUE.equals(node.get("synthetic"))) continue;
        String owner = str(node, "owner");
        if (owner != null) {
          result.computeIfAbsent(owner, k -> new ArrayList<>()).add(e.getKey());
        }
      }
      return result;
    }

    @SuppressWarnings("unchecked")
    private Set<String> computeSenderTypes() {
      List<Map<String, Object>> commands =
          Optional.ofNullable((List<Map<String, Object>>) schema.get("commands"))
              .orElse(Collections.emptyList());
      Set<String> result = new LinkedHashSet<>();
      java.util.ArrayDeque<String> queue = new java.util.ArrayDeque<>();
      for (Map<String, Object> cmd : commands) {
        seedRef(mapField(cmd, "params"), queue, result);
      }
      while (!queue.isEmpty()) {
        String name = queue.poll();
        Map<String, Object> node = types.get(name);
        if (node == null) continue;
        collectRefs(node, queue, result);
        if (Boolean.TRUE.equals(node.get("synthetic"))) {
          String owner = str(node, "owner");
          if (owner != null && result.add(owner)) queue.add(owner);
        }
        // Union variants that extend a senderType union must also implement toMap().
        // Include them so appendRecordBody generates the override.
        if ("union".equals(str(node, "kind"))) {
          List<String> variants = (List<String>) node.get("variants");
          if (variants != null) {
            for (String v : variants) {
              if (result.add(v)) queue.add(v);
            }
          }
          Map<String, Object> sel = mapField(node, "selector");
          if (sel != null) {
            List<Map<String, Object>> svs = (List<Map<String, Object>>) sel.get("variants");
            if (svs != null) {
              for (Map<String, Object> sv : svs) {
                String ref = str(sv, "ref");
                if (ref != null && result.add(ref)) queue.add(ref);
              }
            }
            String def = str(sel, "default");
            if (def != null && result.add(def)) queue.add(def);
          }
        }
      }
      return result;
    }

    @SuppressWarnings("unchecked")
    private Set<String> computeReceivableTypes() {
      List<Map<String, Object>> commands =
          Optional.ofNullable((List<Map<String, Object>>) schema.get("commands"))
              .orElse(Collections.emptyList());
      List<Map<String, Object>> events =
          Optional.ofNullable((List<Map<String, Object>>) schema.get("events"))
              .orElse(Collections.emptyList());
      Set<String> result = new LinkedHashSet<>();
      java.util.ArrayDeque<String> queue = new java.util.ArrayDeque<>();
      for (Map<String, Object> cmd : commands) {
        seedRef(mapField(cmd, "result"), queue, result);
      }
      for (Map<String, Object> evt : events) {
        seedRef(mapField(evt, "params"), queue, result);
      }
      while (!queue.isEmpty()) {
        String name = queue.poll();
        Map<String, Object> node = types.get(name);
        if (node == null) continue;
        collectRefs(node, queue, result);
        if (Boolean.TRUE.equals(node.get("synthetic"))) {
          String owner = str(node, "owner");
          if (owner != null && result.add(owner)) queue.add(owner);
        }
        if ("union".equals(str(node, "kind"))) {
          List<String> variants = (List<String>) node.get("variants");
          if (variants != null) {
            for (String v : variants) {
              if (result.add(v)) queue.add(v);
            }
          }
          Map<String, Object> sel = mapField(node, "selector");
          if (sel != null) {
            List<Map<String, Object>> svs = (List<Map<String, Object>>) sel.get("variants");
            if (svs != null) {
              for (Map<String, Object> sv : svs) {
                String ref = str(sv, "ref");
                if (ref != null && result.add(ref)) queue.add(ref);
              }
            }
            String def = str(sel, "default");
            if (def != null && result.add(def)) queue.add(def);
          }
        }
      }
      return result;
    }

    @SuppressWarnings("unchecked")
    private Map<String, List<String>> computeVariantParent() {
      Map<String, List<String>> result = new LinkedHashMap<>();
      for (Map.Entry<String, Map<String, Object>> e : types.entrySet()) {
        String unionName = e.getKey();
        Map<String, Object> node = e.getValue();
        if (!"union".equals(str(node, "kind"))) continue;
        List<String> variants = (List<String>) node.get("variants");
        if (variants == null) continue;
        for (String variant : variants) {
          result.computeIfAbsent(variant, k -> new ArrayList<>()).add(unionName);
        }
      }
      return result;
    }

    /** Reachable parent unions for {@code typeName}, in declaration order. */
    private List<String> reachableParents(String typeName) {
      return variantParent.getOrDefault(typeName, Collections.emptyList()).stream()
          .filter(reachable::contains)
          .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    void generateAll(Path outDir) throws IOException {
      List<Map<String, Object>> commands =
          Optional.ofNullable((List<Map<String, Object>>) schema.get("commands"))
              .orElse(Collections.emptyList());
      List<Map<String, Object>> events =
          Optional.ofNullable((List<Map<String, Object>>) schema.get("events"))
              .orElse(Collections.emptyList());

      Map<String, List<Map<String, Object>>> cmdByDomain = groupByDomain(commands);
      Map<String, List<Map<String, Object>>> evtByDomain = groupByDomain(events);

      Set<String> domains = new LinkedHashSet<>();
      domains.addAll(cmdByDomain.keySet());
      domains.addAll(evtByDomain.keySet());

      for (String domain : domains) {
        generateModule(
            domain,
            cmdByDomain.getOrDefault(domain, Collections.emptyList()),
            evtByDomain.getOrDefault(domain, Collections.emptyList()),
            outDir);
      }

      for (Map.Entry<String, Map<String, Object>> entry : types.entrySet()) {
        String name = entry.getKey();
        if (!reachable.contains(name)) continue;

        Map<String, Object> node = entry.getValue();
        // Synthetic types are emitted as nested static classes inside their owner's file.
        if (Boolean.TRUE.equals(node.get("synthetic"))) continue;

        String kind = str(node, "kind");

        if ("record".equals(kind)) {
          generateRecord(name, node, outDir);
        } else if ("enum".equals(kind)) {
          generateEnum(name, node, outDir);
        } else if ("union".equals(kind)) {
          Map<String, Object> selector = mapField(node, "selector");
          if (selector == null || !Boolean.TRUE.equals(selector.get("correlated"))) {
            generateUnion(name, node, outDir);
          }
          // correlated unions are protocol-internal; skip code generation
        }
        // "alias" → resolved inline, no class generated
      }
    }

    /** BFS over the type graph seeded by direct params/result refs from commands and events. */
    @SuppressWarnings("unchecked")
    private Set<String> computeReachable(
        List<Map<String, Object>> commands, List<Map<String, Object>> events) {
      Set<String> reachable = new LinkedHashSet<>();
      java.util.ArrayDeque<String> queue = new java.util.ArrayDeque<>();

      for (Map<String, Object> cmd : commands) {
        seedRef(mapField(cmd, "params"), queue, reachable);
        seedRef(mapField(cmd, "result"), queue, reachable);
      }
      for (Map<String, Object> evt : events) {
        seedRef(mapField(evt, "params"), queue, reachable);
      }

      while (!queue.isEmpty()) {
        String name = queue.poll();
        Map<String, Object> node = types.get(name);
        if (node == null) continue;
        collectRefs(node, queue, reachable);
        // Synthetic types are nested inside their owner — the owner must also be generated.
        if (Boolean.TRUE.equals(node.get("synthetic"))) {
          String owner = str(node, "owner");
          if (owner != null && reachable.add(owner)) queue.add(owner);
        }
        // Union variant strings are not covered by collectRefs (which only follows {ref:...} maps).
        // Add them explicitly so discriminated-dispatch targets are generated.
        if ("union".equals(str(node, "kind"))) {
          @SuppressWarnings("unchecked")
          List<String> variants = (List<String>) node.get("variants");
          if (variants != null) {
            for (String v : variants) {
              if (reachable.add(v)) queue.add(v);
            }
          }
          @SuppressWarnings("unchecked")
          Map<String, Object> sel = (Map<String, Object>) node.get("selector");
          if (sel != null) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> svs = (List<Map<String, Object>>) sel.get("variants");
            if (svs != null) {
              for (Map<String, Object> sv : svs) {
                String ref = str(sv, "ref");
                if (ref != null && reachable.add(ref)) queue.add(ref);
              }
            }
            String def = str(sel, "default");
            if (def != null && reachable.add(def)) queue.add(def);
          }
        }
      }
      return reachable;
    }

    // A command/event's params or result is not always a direct {"ref": ...} — it can be a
    // container wrapping one, e.g. {"list": {"ref": "test.Item"}} for a command whose result is
    // directly a list of records (see resolveCommandResultArg). Delegating to collectRefs, which
    // already recurses through arbitrarily nested Map/List structures looking for "ref" keys,
    // seeds those nested types too instead of only ever finding a ref at the very top level.
    private static void seedRef(
        Map<String, Object> typeRef, java.util.ArrayDeque<String> queue, Set<String> reachable) {
      if (typeRef == null) return;
      collectRefs(typeRef, queue, reachable);
    }

    @SuppressWarnings("unchecked")
    private static void collectRefs(
        Object node, java.util.ArrayDeque<String> queue, Set<String> reachable) {
      if (node instanceof Map) {
        Map<String, Object> m = (Map<String, Object>) node;
        String ref = str(m, "ref");
        if (ref != null && reachable.add(ref)) queue.add(ref);
        for (Object v : m.values()) collectRefs(v, queue, reachable);
      } else if (node instanceof List) {
        for (Object item : (List<?>) node) collectRefs(item, queue, reachable);
      }
    }

    // ─── Module class ─────────────────────────────────────────────

    private void generateModule(
        String domain,
        List<Map<String, Object>> commands,
        List<Map<String, Object>> events,
        Path outDir)
        throws IOException {

      // Module classes live in bidi.protocol.module (not bidi.protocol.{domain}), deliberately
      // kept separate from the hand-written bidi.module package so generated and hand-written
      // facades never collide on package or class name during the migration.
      String pkg = "org.openqa.selenium.bidi.protocol.module";
      // Use "" as context domain so all POJO type refs in the module class are fully
      // qualified (they live in bidi.{domain}, which never matches "").
      String moduleDomain = "";
      String cls = capitalize(domain);

      StringBuilder sb = new StringBuilder();
      sb.append(LICENSE);
      sb.append("package ").append(pkg).append(";\n\n");
      sb.append("import org.openqa.selenium.Beta;\n");
      sb.append("import org.openqa.selenium.WebDriver;\n");
      sb.append("import org.openqa.selenium.bidi.Command;\n");
      sb.append("import org.openqa.selenium.bidi.ConverterFunctions;\n");
      sb.append("import org.openqa.selenium.bidi.Event;\n");
      sb.append("import org.openqa.selenium.bidi.Module;\n");
      sb.append("\n");
      sb.append(API_JAVADOC);
      sb.append("@Beta\n");
      sb.append("@SuppressWarnings(\"unchecked\")\n");
      sb.append("public class ").append(cls).append(" extends Module {\n\n");

      // Static Event constants
      for (Map<String, Object> evt : events) {
        String method = str(evt, "method");
        String evtName = str(evt, "name");
        Map<String, Object> paramsRef = mapField(evt, "params");
        String evtConstant = toConstantName(evtName);

        if (paramsRef != null) {
          String javaType = resolveJavaType(paramsRef, moduleDomain, true);
          String mapper = resolveEventMapper(paramsRef, moduleDomain);
          sb.append("  public static final Event<")
              .append(javaType)
              .append("> ")
              .append(evtConstant)
              .append(" =\n")
              .append("      new Event<>(\"")
              .append(method)
              .append("\", ")
              .append(mapper)
              .append(");\n\n");
        } else {
          sb.append("  public static final Event<Void> ")
              .append(evtConstant)
              .append(" =\n")
              .append("      new Event<>(\"")
              .append(method)
              .append("\", map -> null);\n\n");
        }
      }

      sb.append("  public ").append(cls).append("(WebDriver driver) {\n");
      sb.append("    super(driver);\n");
      sb.append("  }\n\n");

      // Command methods
      for (Map<String, Object> cmd : commands) {
        String method = str(cmd, "method");
        String cmdName = escapeReserved(str(cmd, "name"));
        Map<String, Object> paramsRef = mapField(cmd, "params");
        Map<String, Object> resultRef = mapField(cmd, "result");

        String returnType;
        String resultArg;
        if (resultRef == null) {
          returnType = "void";
          resultArg = null;
        } else {
          returnType = resolveJavaType(resultRef, moduleDomain, true);
          resultArg = resolveCommandResultArg(resultRef, moduleDomain);
        }

        String paramsArgDecl = "";
        String paramsMapExpr = "java.util.Collections.emptyMap()";
        if (paramsRef != null) {
          String paramsType = resolveJavaType(paramsRef, moduleDomain, true);
          paramsArgDecl = paramsType + " params";
          paramsMapExpr = "params.toMap()";
        }

        sb.append("  public ")
            .append(returnType)
            .append(" ")
            .append(cmdName)
            .append("(")
            .append(paramsArgDecl)
            .append(") {\n");

        if ("void".equals(returnType)) {
          sb.append("    send(new Command<>(\"")
              .append(method)
              .append("\", ")
              .append(paramsMapExpr)
              .append("));\n");
        } else if (resultArg != null) {
          sb.append("    return send(new Command<>(\"")
              .append(method)
              .append("\", ")
              .append(paramsMapExpr)
              .append(", ")
              .append(resultArg)
              .append("));\n");
        } else {
          sb.append("    return send(new Command<>(\"")
              .append(method)
              .append("\", ")
              .append(paramsMapExpr)
              .append("));\n");
        }
        sb.append("  }\n\n");
      }

      sb.append("}\n");

      writeFile(outDir, pkg.replace('.', '/') + "/" + cls + ".java", sb.toString());
    }

    // ─── Record POJO ──────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private void generateRecord(String typeName, Map<String, Object> node, Path outDir)
        throws IOException {

      String domain = domainOf(typeName);
      String pkg = domainPackage(domain);
      String cls = simpleNameOf(typeName);
      boolean needsToMap = senderTypes.contains(typeName);

      StringBuilder sb = new StringBuilder();
      sb.append(LICENSE);
      sb.append("package ").append(pkg).append(";\n\n");
      if (needsToMap) {
        sb.append("import java.util.Collections;\n");
        sb.append("import java.util.LinkedHashMap;\n");
      }
      // Always imported: needed by fromJson() (see appendFromJson) whenever this class, or any
      // nested synthetic class in this file, has an escaped-reserved-word field.
      sb.append("import java.util.Map;\n");
      sb.append("import java.util.Objects;\n");
      sb.append("import java.util.Optional;\n");
      sb.append("import org.jspecify.annotations.Nullable;\n");
      sb.append("import org.openqa.selenium.Beta;\n");
      // BiDiException is needed by nested enum fromString() methods and union fromMap() methods.
      sb.append("import org.openqa.selenium.bidi.BiDiException;\n");
      sb.append("import org.openqa.selenium.json.Json;\n");
      sb.append("import org.openqa.selenium.json.TypeToken;\n\n");
      sb.append(API_JAVADOC);
      sb.append("@Beta\n");
      // Unions are generated as interfaces, so a type belonging to more than one union (e.g.
      // PrimitiveProtocolValue in both RemoteValue and LocalValue) genuinely implements all of
      // them — no single-inheritance conflict to work around.
      List<String> parentUnionRefs = reachableParents(typeName);
      String implementsClause =
          parentUnionRefs.isEmpty()
              ? ""
              : " implements "
                  + parentUnionRefs.stream()
                      .map(r -> resolveRefToJavaClass(r, domain))
                      .collect(Collectors.joining(", "));
      sb.append("public class ").append(cls).append(implementsClause).append(" {\n\n");

      appendRecordBody(sb, typeName, node, domain, "  ");
      appendNestedSynthetics(sb, typeName, domain, "  ");

      sb.append("}\n");
      writeFile(outDir, pkg.replace('.', '/') + "/" + cls + ".java", sb.toString());
    }

    @SuppressWarnings("unchecked")
    private void appendRecordBody(
        StringBuilder sb, String typeName, Map<String, Object> node, String domain, String m) {

      String cls =
          Boolean.TRUE.equals(node.get("synthetic")) ? str(node, "label") : simpleNameOf(typeName);
      List<Map<String, Object>> rawFields =
          (List<Map<String, Object>>)
              Optional.ofNullable(node.get("fields")).orElse(Collections.emptyList());
      List<FieldInfo> fields =
          rawFields.stream().map(this::parseField).collect(Collectors.toList());
      List<FieldInfo> required =
          fields.stream().filter(f -> f.required).collect(Collectors.toList());
      List<FieldInfo> optional =
          fields.stream().filter(f -> !f.required).collect(Collectors.toList());
      boolean hasOptionals = !optional.isEmpty();
      boolean needsToMap = senderTypes.contains(typeName);
      List<String> parentUnionRefs = reachableParents(typeName);

      // A type reachable only from outbound command params (senderTypes) is caller-owned start
      // to finish, so it keeps a single mutable class with fluent setters (the "else" branch
      // below, unchanged from before). A type reachable only from inbound results/events is
      // simplified the other way: since the caller never builds one, it gets no setters and no
      // public constructor at all — only the deserializer's. A type reachable from *both* is the
      // only case that must not expose mutation on a received instance (BiDi low-level
      // behavioral contract, item 12): it becomes a fully immutable value class, with a separate
      // nested Builder (see appendBuilder) as the only way to construct an outbound instance.
      boolean isReceivable = receivableTypes.contains(typeName);
      boolean immutable = hasOptionals && isReceivable;
      boolean needsBuilder = immutable && needsToMap;

      // Nullable optional fields need a <field>Set presence flag (see below); a type with a
      // Builder needs a way for build() to state that flag explicitly rather than have it
      // re-derived from Optional.isPresent() (which cannot tell "explicitly set to null" apart
      // from "never set" — see appendConstructorAssignment).
      List<FieldInfo> nullableOptional =
          optional.stream().filter(f -> isNullable(f.typeRef)).collect(Collectors.toList());

      // Fields — an immutable type's fields (including their xSet presence flags) are final:
      // assigned once, in the single deserialization constructor, never mutated afterward.
      for (FieldInfo f : fields) {
        String jt = fieldJavaType(f, domain);
        sb.append(m)
            .append("private ")
            .append(f.required || immutable ? "final " : "")
            .append(jt)
            .append(" ")
            .append(f.name)
            .append(";\n");
        if (!f.required && isNullable(f.typeRef)) {
          // Tracks whether the field was ever explicitly set, independent of the value —
          // Optional<T> alone cannot distinguish "never set" from "explicitly set to null",
          // and toMap() needs that distinction to send an explicit null on the wire (R2/R7).
          // Only needed for fields the schema actually declares nullable; an optional field
          // whose type is never null-able has no legal "explicit null" wire state to represent.
          sb.append(m)
              .append("private ")
              .append(immutable ? "final " : "")
              .append("boolean ")
              .append(f.name)
              .append("Set;\n");
        }
      }
      if (!fields.isEmpty()) sb.append("\n");

      // User-facing constructor (required fields only) — sender-only types alone; an immutable
      // type has no way to be constructed except its Builder (if it has one) or the deserializer.
      if (hasOptionals && !immutable) {
        sb.append(m).append("public ").append(cls).append("(");
        sb.append(
            required.stream().map(f -> paramDecl(f, domain)).collect(Collectors.joining(", ")));
        sb.append(") {\n");
        for (FieldInfo f : required) {
          appendConstructorAssignment(sb, f, domain, m + "  ");
        }
        for (FieldInfo f : optional) {
          sb.append(m).append("  this.").append(f.name).append(" = Optional.empty();\n");
        }
        sb.append(m).append("}\n\n");
      }

      // Package-private constructor for ConstructorCoercer deserialization (not public API).
      // When there is a user-facing constructor (any record with optional fields gets one, even
      // if it ends up no-arg), this one is intentionally hidden.
      String deserCtorAccess = hasOptionals ? "" : "public ";
      sb.append(m).append(deserCtorAccess).append(cls).append("(");
      if (fields.isEmpty()) {
        sb.append(") {}\n\n");
      } else {
        List<String> ctorParams =
            fields.stream()
                .map(f -> paramDecl(f, domain))
                .collect(Collectors.toCollection(ArrayList::new));
        if (needsBuilder) {
          for (FieldInfo f : nullableOptional) {
            ctorParams.add("Optional<Boolean> " + f.name + "SetOverride");
          }
        }
        sb.append(String.join(", ", ctorParams));
        sb.append(") {\n");
        for (FieldInfo f : fields) {
          appendConstructorAssignment(sb, f, domain, m + "  ", needsBuilder);
        }
        sb.append(m).append("}\n\n");
      }

      // Fluent setters for optional fields — sender-only types only. An immutable/receivable
      // type never exposes these; use its Builder to construct one instead.
      if (!immutable) {
        for (FieldInfo f : optional) {
          String baseType = resolveJavaType(f.typeRef, domain, true);
          sb.append(m)
              .append("public ")
              .append(cls)
              .append(" set")
              .append(capitalize(f.name))
              .append("(")
              .append(baseType)
              .append(" ")
              .append(f.name)
              .append(") {\n");
          sb.append(m)
              .append("  this.")
              .append(f.name)
              .append(" = Optional.ofNullable(")
              .append(f.name)
              .append(");\n");
          if (isNullable(f.typeRef)) {
            sb.append(m).append("  this.").append(f.name).append("Set = true;\n");
          }
          sb.append(m).append("  return this;\n");
          sb.append(m).append("}\n\n");
        }
      }

      // Getters
      for (FieldInfo f : fields) {
        String jt = fieldJavaType(f, domain);
        sb.append(m)
            .append("public ")
            .append(jt)
            .append(" get")
            .append(capitalize(f.name))
            .append("() {\n");
        sb.append(m).append("  return ").append(f.name).append(";\n");
        sb.append(m).append("}\n\n");
      }

      // toMap() only for types sent as command params
      if (needsToMap) {
        boolean overrides = parentUnionRefs.stream().anyMatch(senderTypes::contains);
        if (overrides) sb.append(m).append("@Override\n");
        sb.append(m).append("public Map<String, Object> toMap() {\n");
        if (fields.isEmpty()) {
          sb.append(m).append("  return Collections.emptyMap();\n");
        } else {
          sb.append(m).append("  Map<String, Object> map = new LinkedHashMap<>();\n");
          for (FieldInfo f : required) {
            String serExpr = serializeExpr(f.name, f.typeRef, domain);
            sb.append(m)
                .append("  map.put(\"")
                .append(f.wire)
                .append("\", ")
                .append(serExpr)
                .append(");\n");
          }
          for (FieldInfo f : optional) {
            if (isNullable(f.typeRef)) {
              // A field that was never set is omitted from the wire entirely; a field that was
              // explicitly set to null must serialize as an explicit null (R2/R7) rather than
              // also being omitted, so presence (xSet) and value-nullability are checked
              // separately. Only fields the schema declares nullable get this treatment — an
              // optional field whose type is never null-able has no legal null wire state.
              String serExpr = serializeExpr(f.name + ".get()", f.typeRef, domain);
              sb.append(m).append("  if (").append(f.name).append("Set) {\n");
              sb.append(m)
                  .append("    map.put(\"")
                  .append(f.wire)
                  .append("\", ")
                  .append(f.name)
                  .append(".isPresent() ? ")
                  .append(serExpr)
                  .append(" : null);\n");
              sb.append(m).append("  }\n");
            } else {
              String serExpr = serializeExpr("v", f.typeRef, domain);
              sb.append(m)
                  .append("  ")
                  .append(f.name)
                  .append(".ifPresent(v -> map.put(\"")
                  .append(f.wire)
                  .append("\", ")
                  .append(serExpr)
                  .append("));\n");
            }
          }
          sb.append(m).append("  return Collections.unmodifiableMap(map);\n");
        }
        sb.append(m).append("}\n\n");
      }

      if (needsBuilder) {
        appendBuilder(sb, cls, fields, required, optional, domain, m);
      }

      // A field whose spec name collides with a Java reserved word (e.g.
      // script.CallFunctionParameters'
      // "this", session.UserPromptHandler's "default") gets its Java identifier escaped
      // (escapeReserved) but keeps its original wire key. ConstructorCoercer matches JSON
      // properties to constructor parameters by exact name, so it can never find the wire key
      // "this" for a parameter named "this_" — that field would silently deserialize as absent.
      // fromJson reads every field by its wire key directly and calls the all-fields constructor,
      // bypassing that name-matching entirely; StaticInitializerCoercer picks up a class's own
      // "fromJson" ahead of ConstructorCoercer whenever one is present.
      boolean needsFromJson = fields.stream().anyMatch(f -> !f.name.equals(f.wire));
      if (needsFromJson) {
        appendFromJson(sb, cls, fields, domain, m);
      }
    }

    private void appendFromJson(
        StringBuilder sb, String cls, List<FieldInfo> fields, String domain, String m) {
      sb.append("\n")
          .append(m)
          .append("private static ")
          .append(cls)
          .append(" fromJson(Map<String, Object> map) {\n");
      sb.append(m).append("  Json json = new Json();\n");
      for (FieldInfo f : fields) {
        String decodeType =
            f.required ? resolveJavaType(f.typeRef, domain, true) : fieldJavaType(f, domain);
        sb.append(m)
            .append("  ")
            .append(decodeType)
            .append(" ")
            .append(f.name)
            .append(" = json.toType(json.toJson(map.get(\"")
            .append(f.wire)
            .append("\")), new TypeToken<")
            .append(decodeType)
            .append(">() {}.getType());\n");
      }
      sb.append(m)
          .append("  return new ")
          .append(cls)
          .append("(")
          .append(fields.stream().map(f -> f.name).collect(Collectors.joining(", ")))
          .append(");\n");
      sb.append(m).append("}\n");
    }

    // Generates a nested public Builder for a type used both to send command params and to
    // receive results/events (senderTypes ∩ receivableTypes) — the only case where a caller
    // needs a mutable way to construct an instance, while a received instance itself stays fully
    // immutable (BiDi low-level behavioral contract, item 12). All validation (required-field
    // presence, const-value checks) lives in the outer class's single constructor, which build()
    // delegates to — so a Builder-constructed instance is validated exactly like a deserialized
    // one, through the same code path.
    private void appendBuilder(
        StringBuilder sb,
        String cls,
        List<FieldInfo> fields,
        List<FieldInfo> required,
        List<FieldInfo> optional,
        String domain,
        String m) {
      sb.append(m)
          .append("public static Builder builder(")
          .append(
              required.stream().map(f -> paramDecl(f, domain)).collect(Collectors.joining(", ")))
          .append(") {\n");
      sb.append(m)
          .append("  return new Builder(")
          .append(required.stream().map(f -> f.name).collect(Collectors.joining(", ")))
          .append(");\n");
      sb.append(m).append("}\n\n");

      sb.append(m).append("public static final class Builder {\n\n");
      String bm = m + "  ";
      for (FieldInfo f : required) {
        sb.append(bm)
            .append("private final ")
            .append(fieldJavaType(f, domain))
            .append(" ")
            .append(f.name)
            .append(";\n");
      }
      for (FieldInfo f : optional) {
        String baseType = resolveJavaType(f.typeRef, domain, true);
        sb.append(bm).append("private ").append(baseType).append(" ").append(f.name).append(";\n");
        if (isNullable(f.typeRef)) {
          // Tracks whether setX was ever called, independent of the value passed — build() needs
          // this to tell the outer class's constructor that a null was explicit, not "never set"
          // (Optional.ofNullable(null) alone is indistinguishable from an untouched field).
          sb.append(bm).append("private boolean ").append(f.name).append("Set;\n");
        }
      }
      sb.append("\n");

      sb.append(bm)
          .append("private Builder(")
          .append(
              required.stream().map(f -> paramDecl(f, domain)).collect(Collectors.joining(", ")))
          .append(") {\n");
      for (FieldInfo f : required) {
        sb.append(bm).append("  this.").append(f.name).append(" = ").append(f.name).append(";\n");
      }
      sb.append(bm).append("}\n\n");

      for (FieldInfo f : optional) {
        String baseType = resolveJavaType(f.typeRef, domain, true);
        sb.append(bm)
            .append("public Builder set")
            .append(capitalize(f.name))
            .append("(")
            .append(baseType)
            .append(" ")
            .append(f.name)
            .append(") {\n");
        sb.append(bm).append("  this.").append(f.name).append(" = ").append(f.name).append(";\n");
        if (isNullable(f.typeRef)) {
          sb.append(bm).append("  this.").append(f.name).append("Set = true;\n");
        }
        sb.append(bm).append("  return this;\n");
        sb.append(bm).append("}\n\n");
      }

      List<FieldInfo> nullableOptional =
          optional.stream().filter(f -> isNullable(f.typeRef)).collect(Collectors.toList());
      sb.append(bm).append("public ").append(cls).append(" build() {\n");
      sb.append(bm).append("  return new ").append(cls).append("(");
      List<String> buildArgs =
          fields.stream()
              .map(f -> f.required ? f.name : "Optional.ofNullable(" + f.name + ")")
              .collect(Collectors.toCollection(ArrayList::new));
      for (FieldInfo f : nullableOptional) {
        buildArgs.add("Optional.of(" + f.name + "Set)");
      }
      sb.append(String.join(", ", buildArgs));
      sb.append(");\n");
      sb.append(bm).append("}\n");
      sb.append(m).append("}\n");
    }

    /**
     * Recursively appends synthetic children of {@code ownerTypeName} as nested static classes.
     * {@code m} is the member-level indent (e.g. {@code " "} for a top-level class body).
     */
    @SuppressWarnings("unchecked")
    private void appendNestedSynthetics(
        StringBuilder sb, String ownerTypeName, String domain, String m) {
      List<String> children = syntheticChildren.get(ownerTypeName);
      if (children == null) return;

      for (String childName : children) {
        Map<String, Object> childNode = types.get(childName);
        if (childNode == null) continue;
        String label = str(childNode, "label");
        String kind = str(childNode, "kind");

        if ("record".equals(kind)) {
          List<String> parentRefs = reachableParents(childName);
          String implementsClause =
              parentRefs.isEmpty()
                  ? ""
                  : " implements "
                      + parentRefs.stream()
                          .map(r -> resolveRefToJavaClass(r, domain))
                          .collect(Collectors.joining(", "));
          sb.append("\n")
              .append(m)
              .append("public static class ")
              .append(label)
              .append(implementsClause)
              .append(" {\n\n");
          appendRecordBody(sb, childName, childNode, domain, m + "  ");
          appendNestedSynthetics(sb, childName, domain, m + "  ");
          sb.append(m).append("}\n");

        } else if ("enum".equals(kind)) {
          List<String> values = (List<String>) Objects.requireNonNull(childNode.get("values"));
          sb.append("\n").append(m).append("public enum ").append(label).append(" {\n\n");
          appendEnumBody(sb, label, values, m + "  ");
          sb.append(m).append("}\n");
        }
      }
    }

    private void appendConstructorAssignment(
        StringBuilder sb, FieldInfo f, String domain, String bodyIndent) {
      appendConstructorAssignment(sb, f, domain, bodyIndent, false);
    }

    // supportsSetOverride is true only for the all-fields constructor of a type that has a
    // Builder (immutable + sendable). That constructor is called from two places: the shared
    // JSON deserializer (which can never distinguish an explicit wire "null" from an absent key
    // once the value has collapsed to Optional.empty() — a separate, pre-existing limitation, out
    // of scope here) and Builder.build() (which knows for certain whether its setter was called,
    // independent of the value passed). The extra <field>SetOverride parameter lets build() state
    // that fact explicitly; it is Optional-typed so ConstructorCoercer's reflection-based matching
    // — which only requires non-Optional parameters to correspond to a real wire key — leaves it
    // untouched (defaulting to empty) when the constructor is invoked from deserialization.
    private void appendConstructorAssignment(
        StringBuilder sb,
        FieldInfo f,
        String domain,
        String bodyIndent,
        boolean supportsSetOverride) {
      if (f.required) {
        boolean nullable = f.typeRef != null && Boolean.TRUE.equals(f.typeRef.get("nullable"));
        appendConstValidation(sb, f, nullable, bodyIndent);
        if (isPrimitive(f.typeRef) || nullable) {
          sb.append(bodyIndent)
              .append("this.")
              .append(f.name)
              .append(" = ")
              .append(f.name)
              .append(";\n");
        } else {
          sb.append(bodyIndent)
              .append("this.")
              .append(f.name)
              .append(" = Objects.requireNonNull(")
              .append(f.name)
              .append(", \"")
              .append(f.wire)
              .append(" is required\");\n");
        }
      } else {
        sb.append(bodyIndent)
            .append("this.")
            .append(f.name)
            .append(" = ")
            .append(f.name)
            .append(" != null ? ")
            .append(f.name)
            .append(" : Optional.empty();\n");
        if (isNullable(f.typeRef)) {
          sb.append(bodyIndent).append("this.").append(f.name).append("Set = ");
          if (supportsSetOverride) {
            sb.append(f.name)
                .append("SetOverride != null && ")
                .append(f.name)
                .append("SetOverride.isPresent() ? ")
                .append(f.name)
                .append("SetOverride.get() : this.")
                .append(f.name)
                .append(".isPresent();\n");
          } else {
            sb.append("this.").append(f.name).append(".isPresent();\n");
          }
        }
      }
    }

    // A const field's value is fixed by the spec; a caller-supplied (or, on deserialization,
    // remote-supplied) value that isn't the literal — or null, when the const is also nullable —
    // must be rejected locally rather than silently accepted. This is what lets a nullable const
    // (browsingContext.SetBypassCSPParameters.bypass,
    // emulation.SetScriptingEnabledParameters.enabled)
    // actually behave as "the literal or null" instead of any value of that type going unchecked.
    private void appendConstValidation(
        StringBuilder sb, FieldInfo f, boolean nullable, String bodyIndent) {
      if (f.typeRef == null || !f.typeRef.containsKey("const")) return;
      Object constValue = f.typeRef.get("const");
      String literal =
          constValue instanceof Boolean ? constValue.toString() : "\"" + constValue + "\"";
      String condition =
          nullable
              ? f.name + " != null && !Objects.equals(" + f.name + ", " + literal + ")"
              : "!Objects.equals(" + f.name + ", " + literal + ")";
      String suffix = nullable ? " or null, got: " : ", got: ";
      sb.append(bodyIndent).append("if (").append(condition).append(") {\n");
      sb.append(bodyIndent)
          .append(
              String.format(
                  "  throw new BiDiException(\"%s must be \" + %s + \"%s\" + %s);%n",
                  f.wire, literal, suffix, f.name));
      sb.append(bodyIndent).append("}\n");
    }

    // ─── Enum ─────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private void generateEnum(String typeName, Map<String, Object> node, Path outDir)
        throws IOException {

      String domain = domainOf(typeName);
      String pkg = domainPackage(domain);
      String cls = simpleNameOf(typeName);
      List<String> values = (List<String>) Objects.requireNonNull(node.get("values"));

      StringBuilder sb = new StringBuilder();
      sb.append(LICENSE);
      sb.append("package ").append(pkg).append(";\n\n");
      sb.append("import org.openqa.selenium.Beta;\n");
      sb.append("import org.openqa.selenium.bidi.BiDiException;\n\n");
      sb.append(API_JAVADOC);
      sb.append("@Beta\n");
      sb.append("public enum ").append(cls).append(" {\n\n");
      appendEnumBody(sb, cls, values, "  ");
      sb.append("}\n");

      writeFile(outDir, pkg.replace('.', '/') + "/" + cls + ".java", sb.toString());
    }

    private void appendEnumBody(StringBuilder sb, String cls, List<String> values, String m) {
      for (int i = 0; i < values.size(); i++) {
        String v = values.get(i);
        sb.append(m)
            .append(toEnumConstant(v))
            .append("(\"")
            .append(v)
            .append("\")")
            .append(i < values.size() - 1 ? "," : ";")
            .append("\n");
      }
      sb.append("\n").append(m).append("private final String value;\n\n");
      sb.append(m).append(cls).append("(String value) {\n");
      sb.append(m).append("  this.value = value;\n");
      sb.append(m).append("}\n\n");
      sb.append(m).append("public static ").append(cls).append(" fromString(String s) {\n");
      sb.append(m).append("  for (").append(cls).append(" e : values()) {\n");
      sb.append(m).append("    if (e.value.equalsIgnoreCase(s)) return e;\n");
      sb.append(m).append("  }\n");
      sb.append(m)
          .append("  throw new BiDiException(\"Unknown ")
          .append(cls)
          .append(" value: \" + s);\n");
      sb.append(m).append("}\n\n");
      sb.append(m).append("@Override\n");
      sb.append(m).append("public String toString() {\n");
      sb.append(m).append("  return value;\n");
      sb.append(m).append("}\n");
    }

    // ─── Union ────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private void generateUnion(String typeName, Map<String, Object> node, Path outDir)
        throws IOException {

      String domain = domainOf(typeName);
      String pkg = domainPackage(domain);
      String cls = simpleNameOf(typeName);
      List<String> variants = (List<String>) Objects.requireNonNull(node.get("variants"));
      Map<String, Object> selector = mapField(node, "selector");

      StringBuilder sb = new StringBuilder();
      sb.append(LICENSE);
      sb.append("package ").append(pkg).append(";\n\n");
      // Always import all utilities that inner static classes (nested synthetics) may use.
      sb.append("import java.util.Collections;\n");
      sb.append("import java.util.LinkedHashMap;\n");
      sb.append("import java.util.Map;\n");
      sb.append("import java.util.Objects;\n");
      sb.append("import java.util.Optional;\n");
      sb.append("import org.jspecify.annotations.Nullable;\n");
      sb.append("import org.openqa.selenium.Beta;\n");
      sb.append("import org.openqa.selenium.bidi.BiDiException;\n");
      sb.append("import org.openqa.selenium.bidi.ConverterFunctions;\n\n");
      sb.append(API_JAVADOC);
      sb.append("@Beta\n");
      // Unions are interfaces, not abstract classes: a union can itself be a variant of more
      // than one other union (e.g. PrimitiveProtocolValue is a member of both RemoteValue and
      // LocalValue), which only interface-to-interface "extends" can express — a class can only
      // ever have one superclass.
      List<String> parentUnionRefs = reachableParents(typeName);
      String extendsClause =
          parentUnionRefs.isEmpty()
              ? ""
              : " extends "
                  + parentUnionRefs.stream()
                      .map(r -> resolveRefToJavaClass(r, domain))
                      .collect(Collectors.joining(", "));
      sb.append("public interface ").append(cls).append(extendsClause).append(" {\n\n");
      if (senderTypes.contains(typeName)) {
        sb.append("  Map<String, Object> toMap();\n\n");
      }

      sb.append("  @SuppressWarnings(\"unchecked\")\n");
      sb.append("  public static ").append(cls).append(" fromMap(Map<String, Object> map) {\n");

      if (selector != null && selector.containsKey("by")) {
        // Discriminated union — dispatch on a shared field value
        String byField = str(selector, "by");
        List<Map<String, Object>> selectorVariants =
            (List<Map<String, Object>>) selector.get("variants");
        String defaultRef = str(selector, "default");

        sb.append("    Object discriminator = map.get(\"").append(byField).append("\");\n");

        if (selectorVariants != null) {
          for (Map<String, Object> sv : selectorVariants) {
            Object value = sv.get("value");
            String variantRef = str(sv, "ref");
            String variantClass = resolveRefToJavaClass(variantRef, domain);
            // A discriminator value isn't always a string (e.g.
            // bluetooth.HandleRequestDevicePromptParameters dispatches on a boolean "accept"
            // field) — the deserialized map value is a real Boolean there, so comparing it
            // against a quoted string literal via String#equals would never match. Emit a literal
            // of the value's own type instead of always quoting it. A numeric discriminator is
            // the same story: Selenium's JSON parser (see JsonInput#nextNumber, also used to read
            // this very schema) materializes an integer wire value as Long and a decimal one as
            // Double — never String — so it needs a real numeric literal (with the matching L/d
            // suffix) rather than a quoted comparison too.
            String test;
            if (value == null) {
              test = "discriminator == null";
            } else if (value instanceof Boolean) {
              test = "Objects.equals(discriminator, " + value + ")";
            } else if (value instanceof Long) {
              test = "Objects.equals(discriminator, " + value + "L)";
            } else if (value instanceof Double) {
              test = "Objects.equals(discriminator, " + value + "d)";
            } else {
              test = "\"" + value + "\".equals(discriminator)";
            }
            sb.append("    if (").append(test).append(")\n");
            appendFromMapReturn(sb, cls, variantRef, variantClass, domain, "      ");
          }
        }
        if (defaultRef != null) {
          String defaultClass = resolveRefToJavaClass(defaultRef, domain);
          appendFromMapReturn(sb, cls, defaultRef, defaultClass, domain, "    ");
        } else {
          sb.append("    throw new BiDiException(\"Unknown ")
              .append(cls)
              .append(" discriminator '\" + discriminator + \"'\");\n");
        }

      } else if (selector != null && selector.containsKey("ordered")) {
        // Structural union — dispatch on required field presence (schema-specified order)
        List<Map<String, Object>> ordered = (List<Map<String, Object>>) selector.get("ordered");
        for (Map<String, Object> arm : ordered) {
          String armRef = str(arm, "ref");
          List<String> requires = (List<String>) arm.get("requires");
          String armClass = resolveRefToJavaClass(armRef, domain);
          if (requires != null && !requires.isEmpty()) {
            String condition =
                requires.stream()
                    .map(k -> "map.containsKey(\"" + k + "\")")
                    .collect(Collectors.joining(" && "));
            sb.append("    if (").append(condition).append(")\n");
            appendFromMapReturn(sb, cls, armRef, armClass, domain, "      ");
          }
        }
        sb.append("    throw new BiDiException(\"Cannot determine ")
            .append(cls)
            .append(" variant from fields: \" + map.keySet());\n");

      } else {
        sb.append("    throw new BiDiException(\"Cannot deserialize ").append(cls).append("\");\n");
      }

      sb.append("  }\n\n");

      // The shared JSON deserializer (org.openqa.selenium.json.StaticInitializerCoercer) only
      // recognizes a static factory method named exactly "fromJson", not "fromMap" — without
      // this, a union type nested as a field inside another generated class (e.g. Initiator
      // inside network.BeforeRequestSentParameters) falls through to a generic reflection-based
      // coercer that tries to call the implicit no-arg constructor every class gets, including
      // this abstract one, and always throws InstantiationException. fromMap stays the public,
      // toMap-symmetric API; this just gives the shared infra a hook it can actually find.
      sb.append("  private static ").append(cls).append(" fromJson(Map<String, Object> map) {\n");
      sb.append("    return fromMap(map);\n");
      sb.append("  }\n");

      // Synthetic variant records/enums as nested static classes
      appendNestedSynthetics(sb, typeName, domain, "  ");

      sb.append("}\n");
      writeFile(outDir, pkg.replace('.', '/') + "/" + cls + ".java", sb.toString());
    }

    // Emits a `return ConverterFunctions.fromMap(...).apply(map);` line inside a union's fromMap().
    // Always casts through Object: some dispatch targets (multi-parent variants or indirect
    // subtypes) do not statically extend the union class, but are valid protocol representations.
    // The @SuppressWarnings("unchecked") on the enclosing fromMap() covers the cast.
    private void appendFromMapReturn(
        StringBuilder sb,
        String unionCls,
        String variantRef,
        String variantClass,
        String domain,
        String indent) {
      sb.append(indent)
          .append("return (")
          .append(unionCls)
          .append(")(Object) ConverterFunctions.fromMap(")
          .append(variantClass)
          .append(".class).apply(map);\n");
    }

    // ═══════════════════════════════════════════════════════════════
    // Type resolution
    // ═══════════════════════════════════════════════════════════════

    private String resolveJavaType(Map<String, Object> typeRef, String contextDomain, boolean box) {
      if (typeRef == null) return "Object";
      if (typeRef.containsKey("primitive")) {
        return primitiveToJava(str(typeRef, "primitive"), box);
      }
      if (typeRef.containsKey("const")) {
        // A const's Java type must reflect its actual wire type (e.g. the boolean literal in
        // browsingContext.SetBypassCSPParameters.bypass), not always String — most consts are
        // fixed discriminator strings, but a nullable const can be a caller-settable boolean.
        Object constValue = typeRef.get("const");
        if (constValue instanceof Boolean) {
          return primitiveToJava("boolean", box);
        }
        return "String";
      }
      if (typeRef.containsKey("ref")) {
        return resolveRefType(str(typeRef, "ref"), contextDomain, box);
      }
      if (typeRef.containsKey("list")) {
        @SuppressWarnings("unchecked")
        Map<String, Object> elem = (Map<String, Object>) typeRef.get("list");
        return "java.util.List<" + resolveJavaType(elem, contextDomain, true) + ">";
      }
      if (typeRef.containsKey("map")) {
        @SuppressWarnings("unchecked")
        Map<String, Object> val = (Map<String, Object>) typeRef.get("map");
        return "java.util.Map<String, " + resolveJavaType(val, contextDomain, true) + ">";
      }
      return "Object"; // inline union or unhandled shape
    }

    private String resolveRefType(String ref, String contextDomain, boolean box) {
      Map<String, Object> node = types.get(ref);
      if (node == null) return resolveRefToJavaClass(ref, contextDomain);
      String kind = str(node, "kind");
      if ("alias".equals(kind)) {
        @SuppressWarnings("unchecked")
        Map<String, Object> aliasType = (Map<String, Object>) node.get("type");
        return aliasType != null ? resolveJavaType(aliasType, contextDomain, box) : "Object";
      }
      return resolveRefToJavaClass(ref, contextDomain);
    }

    private String resolveRefToJavaClass(String ref, String contextDomain) {
      Map<String, Object> node = types.get(ref);
      if (node != null && Boolean.TRUE.equals(node.get("synthetic"))) {
        // Synthetic types are nested inside their owner — e.g. DownloadEndParams.CanceledParams
        String ownerRef = str(node, "owner");
        String label = str(node, "label");
        if (ownerRef != null && label != null) {
          return resolveRefToJavaClass(ownerRef, contextDomain) + "." + label;
        }
      }
      String refDomain = domainOf(ref);
      String simpleName = simpleNameOf(ref);
      if (refDomain.equals(contextDomain)) {
        return simpleName;
      }
      return domainPackage(refDomain) + "." + simpleName;
    }

    private String fieldJavaType(FieldInfo f, String domain) {
      if (!f.required) {
        return "Optional<" + resolveJavaType(f.typeRef, domain, true) + ">";
      }
      // A required field that is also nullable (schema T / null) must be boxed even though it's
      // required: null has no representation in a primitive, so a required+nullable primitive
      // field (e.g. a nullable long) has to become its wrapper type (Long) or callers could never
      // actually pass null despite @Nullable saying they can, and ConstructorCoercer would crash
      // trying to pass null to a primitive constructor parameter during deserialization.
      return resolveJavaType(f.typeRef, domain, isNullable(f.typeRef));
    }

    // A required field whose value may still legitimately be null (schema T / null) needs
    // @Nullable on its constructor parameter: ConstructorCoercer's null-value check
    // (org.openqa.selenium.json.ConstructorCoercer#isNullable) reads it off the parameter's
    // annotated type to allow a present key with a null value through, distinct from the
    // key-presence check that "required" already governs (R4).
    private String paramDecl(FieldInfo f, String domain) {
      String jt = fieldJavaType(f, domain);
      return f.required && isNullable(f.typeRef)
          ? annotateNullable(jt) + " " + f.name
          : jt + " " + f.name;
    }

    // @Nullable is TYPE_USE-only, so on a qualified/generic type it must sit directly before the
    // simple name (java.util.@Nullable List<Info>), not before the whole reference — javac
    // rejects the latter placement.
    private String annotateNullable(String javaType) {
      int generic = javaType.indexOf('<');
      String head = generic >= 0 ? javaType.substring(0, generic) : javaType;
      String tail = generic >= 0 ? javaType.substring(generic) : "";
      int dot = head.lastIndexOf('.');
      if (dot >= 0) {
        return head.substring(0, dot + 1) + "@Nullable " + head.substring(dot + 1) + tail;
      }
      return "@Nullable " + head + tail;
    }

    /** True when the type ref maps to a Java value type (long, boolean) that cannot be null. */
    private boolean isPrimitive(Map<String, Object> typeRef) {
      if (typeRef == null) return false;
      String prim = str(typeRef, "primitive");
      if ("boolean".equals(prim) || "integer".equals(prim)) return true;
      // A non-nullable boolean const (e.g. bluetooth.HandleRequestDevicePromptParameters.accept)
      // resolves to the unboxed "boolean" Java type, same as a plain boolean primitive field —
      // it must be treated the same way here so the constructor doesn't null-check a value that
      // can never be null.
      if (typeRef.get("const") instanceof Boolean) return true;
      // Follow aliases (e.g. js-uint → { primitive: "integer" })
      String ref = str(typeRef, "ref");
      if (ref != null) {
        Map<String, Object> node = types.get(ref);
        if (node != null && "alias".equals(str(node, "kind"))) {
          @SuppressWarnings("unchecked")
          Map<String, Object> inner = (Map<String, Object>) node.get("type");
          return isPrimitive(inner);
        }
      }
      return false;
    }

    /** True when the schema declares this type ref's value as nullable ({@code T / null}). */
    private boolean isNullable(Map<String, Object> typeRef) {
      if (typeRef == null) return false;
      if (Boolean.TRUE.equals(typeRef.get("nullable"))) return true;
      // Follow aliases, same as isPrimitive.
      String ref = str(typeRef, "ref");
      if (ref != null) {
        Map<String, Object> node = types.get(ref);
        if (node != null && "alias".equals(str(node, "kind"))) {
          @SuppressWarnings("unchecked")
          Map<String, Object> inner = (Map<String, Object>) node.get("type");
          return isNullable(inner);
        }
      }
      return false;
    }

    private String serializeExpr(String varName, Map<String, Object> typeRef, String domain) {
      if (typeRef == null) return varName;
      if (typeRef.containsKey("primitive") || typeRef.containsKey("const")) return varName;
      if (typeRef.containsKey("ref")) {
        String resolvedKind = resolvedKindOf(str(typeRef, "ref"));
        if ("enum".equals(resolvedKind)) return varName + ".toString()";
        if ("record".equals(resolvedKind) || "union".equals(resolvedKind)) {
          return varName + ".toMap()";
        }
        // alias: recurse through
        Map<String, Object> aliasNode = types.get(str(typeRef, "ref"));
        if (aliasNode != null && "alias".equals(str(aliasNode, "kind"))) {
          @SuppressWarnings("unchecked")
          Map<String, Object> inner = (Map<String, Object>) aliasNode.get("type");
          return serializeExpr(varName, inner, domain);
        }
        return varName;
      }
      if (typeRef.containsKey("list")) {
        @SuppressWarnings("unchecked")
        Map<String, Object> elem = (Map<String, Object>) typeRef.get("list");
        String elemKind = resolvedKindFromTypeRef(elem);
        if ("enum".equals(elemKind)) {
          return varName
              + ".stream().map(Object::toString)"
              + ".collect(java.util.stream.Collectors.toList())";
        }
        if ("record".equals(elemKind) || "union".equals(elemKind)) {
          return varName
              + ".stream().map(e -> e.toMap())"
              + ".collect(java.util.stream.Collectors.toList())";
        }
        return varName;
      }
      if (typeRef.containsKey("map")) {
        // resolveJavaType already resolves a "map" typeRef to java.util.Map<String, V> (see
        // above) — without this branch, a Map<String, SomeRecord/SomeUnion/SomeEnum> field would
        // be put on the wire as raw Java objects instead of their wire-compatible shape.
        @SuppressWarnings("unchecked")
        Map<String, Object> val = (Map<String, Object>) typeRef.get("map");
        String valKind = resolvedKindFromTypeRef(val);
        if ("enum".equals(valKind)) {
          return varName
              + ".entrySet().stream().collect(java.util.stream.Collectors.toMap("
              + "java.util.Map.Entry::getKey, e -> e.getValue().toString(), (a, b) -> b, "
              + "java.util.LinkedHashMap::new))";
        }
        if ("record".equals(valKind) || "union".equals(valKind)) {
          return varName
              + ".entrySet().stream().collect(java.util.stream.Collectors.toMap("
              + "java.util.Map.Entry::getKey, e -> e.getValue().toMap(), (a, b) -> b, "
              + "java.util.LinkedHashMap::new))";
        }
        return varName;
      }
      return varName;
    }

    private String resolvedKindOf(String ref) {
      Map<String, Object> node = types.get(ref);
      if (node == null) return "unknown";
      String kind = str(node, "kind");
      if ("alias".equals(kind)) {
        @SuppressWarnings("unchecked")
        Map<String, Object> inner = (Map<String, Object>) node.get("type");
        return inner != null ? resolvedKindFromTypeRef(inner) : "unknown";
      }
      return kind;
    }

    private String resolvedKindFromTypeRef(Map<String, Object> typeRef) {
      if (typeRef == null) return "unknown";
      if (typeRef.containsKey("ref")) return resolvedKindOf(str(typeRef, "ref"));
      if (typeRef.containsKey("primitive") || typeRef.containsKey("const")) return "primitive";
      if (typeRef.containsKey("list")) return "list";
      if (typeRef.containsKey("map")) return "map";
      return "unknown";
    }

    private String resolveEventMapper(Map<String, Object> paramsRef, String contextDomain) {
      String javaType = resolveJavaType(paramsRef, contextDomain, true);
      if (paramsRef.containsKey("ref")) {
        String resolvedKind = resolvedKindOf(str(paramsRef, "ref"));
        if ("union".equals(resolvedKind)) {
          return javaType + "::fromMap";
        }
      }
      return "ConverterFunctions.fromMap(" + javaType + ".class)";
    }

    private String resolveCommandResultArg(Map<String, Object> resultRef, String contextDomain) {
      if (resultRef == null) return null;
      if (resultRef.containsKey("list") || resultRef.containsKey("map")) {
        // A raw Class token (e.g. List.class) erases the element/value type at runtime, so the
        // shared JSON coercer (which resolves List<Foo>/Map<String, Foo> generically off a real
        // java.lang.reflect.Type — see CollectionCoercer/MapCoercer) would have no way to know
        // what to coerce each element/value into. TypeToken captures that generic signature as an
        // actual Type, matching the same resolveJavaType string already used for this method's
        // declared return type, so the two can never drift out of sync.
        String containerType = resolveJavaType(resultRef, contextDomain, true);
        return "new org.openqa.selenium.json.TypeToken<" + containerType + ">() {}.getType()";
      }
      String javaType = resolveJavaType(resultRef, contextDomain, true);
      if (resultRef.containsKey("ref")) {
        String resolvedKind = resolvedKindOf(str(resultRef, "ref"));
        if ("union".equals(resolvedKind)) {
          return "input -> {\n"
              + "      @SuppressWarnings(\"unchecked\")\n"
              + "      java.util.Map<String, Object> m ="
              + " input.readNonNull(java.util.Map.class);\n"
              + "      return "
              + javaType
              + ".fromMap(m);\n"
              + "    }";
        }
      }
      if (resultRef.containsKey("primitive") || resultRef.containsKey("const")) {
        String prim = str(resultRef, "primitive");
        if ("boolean".equals(prim)) return "Boolean.class";
        if ("integer".equals(prim)) return "Long.class";
        if ("number".equals(prim)) return "Number.class";
        return "String.class";
      }
      return javaType + ".class";
    }

    // ═══════════════════════════════════════════════════════════════
    // Parsing helpers
    // ═══════════════════════════════════════════════════════════════

    private FieldInfo parseField(Map<String, Object> raw) {
      String rawName = str(raw, "name");
      String wire = str(raw, "wire");
      // Escape Java reserved words used as field names in the spec (e.g. "this").
      String name = escapeReserved(rawName);
      boolean required = Boolean.TRUE.equals(raw.get("required"));
      @SuppressWarnings("unchecked")
      Map<String, Object> type = (Map<String, Object>) raw.get("type");
      // wire key stays as the original spec name for JSON serialization
      return new FieldInfo(name, wire != null ? wire : rawName, required, type);
    }

    private static Map<String, List<Map<String, Object>>> groupByDomain(
        List<Map<String, Object>> entries) {
      Map<String, List<Map<String, Object>>> result = new LinkedHashMap<>();
      for (Map<String, Object> e : entries) {
        String domain = (String) e.get("domain");
        result.computeIfAbsent(domain, k -> new ArrayList<>()).add(e);
      }
      return result;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> mapField(Map<String, Object> parent, String key) {
      Object v = parent == null ? null : parent.get(key);
      return v instanceof Map ? (Map<String, Object>) v : null;
    }

    private static String str(Map<String, Object> map, String key) {
      Object v = map == null ? null : map.get(key);
      return v instanceof String ? (String) v : null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Static utilities (package-private for tests)
  // ═══════════════════════════════════════════════════════════════

  static String escapeReserved(String name) {
    return JAVA_RESERVED.contains(name) ? name + "_" : name;
  }

  static String domainPackage(String domain) {
    return BASE_PKG + ".protocol." + domain.toLowerCase(Locale.ROOT);
  }

  static String domainOf(String typeName) {
    int dot = typeName.indexOf('.');
    return dot >= 0 ? typeName.substring(0, dot) : typeName;
  }

  static String simpleNameOf(String typeName) {
    int dot = typeName.indexOf('.');
    return dot >= 0 ? typeName.substring(dot + 1) : typeName;
  }

  static String capitalize(String s) {
    if (s == null || s.isEmpty()) return s;
    return Character.toUpperCase(s.charAt(0)) + s.substring(1);
  }

  static String toConstantName(String camel) {
    // Insert underscore before each uppercase letter, then upper-case the whole string.
    // Locale.ROOT avoids locale-sensitive case conversion (e.g. Turkish "i" -> "İ") producing a
    // non-ASCII constant name depending on the JVM's default locale.
    return camel.replaceAll("([A-Z])", "_$1").toUpperCase(Locale.ROOT);
  }

  static String toEnumConstant(String wireValue) {
    return wireValue.toUpperCase(Locale.ROOT).replace('-', '_').replace('.', '_').replace(' ', '_');
  }

  static String primitiveToJava(String primitive, boolean box) {
    if (primitive == null) return "Object";
    switch (primitive) {
      case "string":
        return "String";
      case "integer":
        return box ? "Long" : "long";
      case "number":
        return "Number";
      case "boolean":
        return box ? "Boolean" : "boolean";
      case "any":
        return "Object";
      case "null":
        return "Void";
      default:
        return "Object";
    }
  }

  // ─── File I/O ─────────────────────────────────────────────────

  private static void writeFile(Path tempDir, String relativePath, String content)
      throws IOException {
    Path file = tempDir.resolve(relativePath);
    Files.createDirectories(file.getParent());
    Files.write(file, content.getBytes(UTF_8));
  }

  // Files.walkFileTree does not guarantee a stable traversal order, and an unset JarEntry
  // timestamp defaults to the moment it's written — either would make bidi-generated.srcjar
  // differ byte-for-byte between builds of the exact same schema, which breaks Bazel's
  // action-cache reuse for everything downstream. Sorting entries by their normalized jar path
  // and zeroing every entry's timestamp makes the output a pure function of the generated
  // content.
  private static void packToJar(Path tempDir, Path outputJar) throws IOException {
    Files.createDirectories(outputJar.getParent());
    List<Path> paths;
    try (Stream<Path> walk = Files.walk(tempDir)) {
      paths =
          walk.filter(p -> !p.equals(tempDir))
              .sorted(Comparator.comparing(p -> relativeJarPath(tempDir, p)))
              .collect(Collectors.toList());
    }
    try (OutputStream os = Files.newOutputStream(outputJar);
        JarOutputStream jos = new JarOutputStream(os)) {
      for (Path path : paths) {
        boolean isDirectory = Files.isDirectory(path);
        String rel = relativeJarPath(tempDir, path);
        JarEntry entry = new JarEntry(isDirectory ? rel + "/" : rel);
        entry.setTime(0L);
        jos.putNextEntry(entry);
        if (!isDirectory) {
          try (InputStream is = Files.newInputStream(path)) {
            is.transferTo(jos);
          }
        }
        jos.closeEntry();
      }
    }
  }

  private static String relativeJarPath(Path root, Path path) {
    return root.relativize(path).toString().replace('\\', '/');
  }

  private static void deleteRecursive(Path dir) throws IOException {
    Files.walkFileTree(
        dir,
        new SimpleFileVisitor<Path>() {
          @Override
          public FileVisitResult visitFile(Path file, BasicFileAttributes attrs)
              throws IOException {
            Files.delete(file);
            return FileVisitResult.CONTINUE;
          }

          @Override
          public FileVisitResult postVisitDirectory(Path d, IOException e) throws IOException {
            if (e != null) throw e;
            Files.delete(d);
            return FileVisitResult.CONTINUE;
          }
        });
  }

  // ─── Inner data class ─────────────────────────────────────────

  private static class FieldInfo {
    final String name;
    final String wire;
    final boolean required;
    final Map<String, Object> typeRef;

    FieldInfo(String name, String wire, boolean required, Map<String, Object> typeRef) {
      this.name = name;
      this.wire = wire;
      this.required = required;
      this.typeRef = typeRef;
    }
  }
}
