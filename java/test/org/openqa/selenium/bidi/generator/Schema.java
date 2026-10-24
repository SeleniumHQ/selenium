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

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Enumeration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.StandardLocation;
import javax.tools.ToolProvider;
import org.openqa.selenium.bidi.BiDiGenerator;

/**
 * Builds a small schema from type nodes and runs {@link BiDiGenerator} on it through the same entry
 * point the build uses (a schema file in, a srcjar out). JSON is written with single quotes for
 * readability and converted before parsing. Every run's output is compiled, so an assertion on the
 * emitted text cannot pass for code that references a type the fixture never defined.
 *
 * <p>The commands and events added by {@link #sends} and {@link #receives} are synthetic: they only
 * make a type reachable in that direction, which decides how the generator emits it.
 */
final class Schema {
  private final List<String> commands = new ArrayList<>();
  private final List<String> events = new ArrayList<>();
  private final Map<String, String> types = new LinkedHashMap<>();
  private String vendor;

  /** Makes {@code ref} reachable as a command's params, i.e. sent by the caller. */
  Schema sends(String ref) {
    String domain = Generated.domainOf(ref);
    int n = commands.size();
    return command(
        "{'domain': '"
            + domain
            + "', 'method': '"
            + domain
            + ".send"
            + n
            + "', 'name': 'send"
            + n
            + "', 'params': {'ref': '"
            + ref
            + "'}, 'result': null}");
  }

  /** Makes {@code ref} reachable as an event's params, i.e. received by the caller. */
  Schema receives(String ref) {
    String domain = Generated.domainOf(ref);
    int n = events.size();
    return event(
        "{'domain': '"
            + domain
            + "', 'method': '"
            + domain
            + ".received"
            + n
            + "', 'name': 'received"
            + n
            + "', 'params': {'ref': '"
            + ref
            + "'}}");
  }

  Schema command(String json) {
    commands.add(json);
    return this;
  }

  Schema event(String json) {
    events.add(json);
    return this;
  }

  Schema type(String name, String json) {
    types.put(name, json);
    return this;
  }

  /** Sets the schema's vendor section, e.g. {@code {'moz': {'extends': {...}}}}. */
  Schema vendor(String json) {
    vendor = json;
    return this;
  }

  Generated generate() {
    String typesJson =
        types.entrySet().stream()
            .map(e -> "'" + e.getKey() + "': " + e.getValue())
            .collect(Collectors.joining(", "));
    String json =
        ("{'commands': ["
                + String.join(", ", commands)
                + "], 'events': ["
                + String.join(", ", events)
                + "], 'types': {"
                + typesJson
                + "}"
                + (vendor == null ? "" : ", 'vendor': " + vendor)
                + "}")
            .replace('\'', '"');
    try {
      Path dir = Files.createTempDirectory("bidi-generator-test");
      Path schemaFile = Files.write(dir.resolve("schema.json"), json.getBytes(UTF_8));
      Path srcjar = dir.resolve("out.srcjar");
      try {
        BiDiGenerator.main(new String[] {schemaFile.toString(), srcjar.toString()});
        Map<String, String> sources = readSources(srcjar);
        assertCompiles(sources);
        return new Generated(sources);
      } finally {
        Files.deleteIfExists(srcjar);
        Files.deleteIfExists(schemaFile);
        Files.deleteIfExists(dir);
      }
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private static void assertCompiles(Map<String, String> sources) throws IOException {
    JavaCompiler javac = ToolProvider.getSystemJavaCompiler();
    assertThat(javac).as("the test JVM must provide a Java compiler").isNotNull();
    List<JavaFileObject> units =
        sources.entrySet().stream()
            .map(e -> new Source(e.getKey(), e.getValue()))
            .collect(Collectors.toList());
    DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
    Path classes = Files.createTempDirectory("bidi-generated-classes");
    try (StandardJavaFileManager files = javac.getStandardFileManager(diagnostics, null, UTF_8)) {
      files.setLocation(StandardLocation.CLASS_OUTPUT, List.of(classes.toFile()));
      boolean compiled =
          javac
              .getTask(
                  null,
                  files,
                  diagnostics,
                  List.of("-classpath", System.getProperty("java.class.path"), "-proc:none"),
                  null,
                  units)
              .call();
      assertThat(compiled)
          .as("generated sources must compile: %s", diagnostics.getDiagnostics())
          .isTrue();
    } finally {
      try (Stream<Path> walk = Files.walk(classes)) {
        for (Path p : walk.sorted(Comparator.reverseOrder()).collect(Collectors.toList())) {
          Files.delete(p);
        }
      }
    }
  }

  private static Map<String, String> readSources(Path srcjar) throws IOException {
    Map<String, String> sources = new LinkedHashMap<>();
    try (JarFile jar = new JarFile(srcjar.toFile())) {
      Enumeration<JarEntry> entries = jar.entries();
      while (entries.hasMoreElements()) {
        JarEntry entry = entries.nextElement();
        if (entry.isDirectory()) continue;
        try (InputStream in = jar.getInputStream(entry)) {
          ByteArrayOutputStream bytes = new ByteArrayOutputStream();
          in.transferTo(bytes);
          sources.put(entry.getName(), new String(bytes.toByteArray(), UTF_8));
        }
      }
    }
    return sources;
  }

  private static final class Source extends SimpleJavaFileObject {
    private final String code;

    Source(String path, String code) {
      super(java.net.URI.create("string:///" + path), Kind.SOURCE);
      this.code = code;
    }

    @Override
    public CharSequence getCharContent(boolean ignoreEncodingErrors) {
      return code;
    }
  }
}
