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

package org.openqa.selenium.remote;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.json.Json.LIST_OF_MAPS_TYPE;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import java.io.Closeable;
import java.io.IOException;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.openqa.selenium.AcceptedW3CCapabilityKeys;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.http.Contents;

public class NewSessionPayload implements Closeable {

  private static final Dialect DEFAULT_DIALECT = Dialect.W3C;
  private static final Predicate<String> ACCEPTED_W3C_PATTERNS = new AcceptedW3CCapabilityKeys();

  private final Json json = new Json();
  private final Contents.Supplier supplier;
  private final Set<Dialect> dialects;

  private NewSessionPayload(Contents.Supplier supplier) {
    this.supplier = supplier;

    Set<Dialect> dialects = new LinkedHashSet<>();
    try {
      if (isW3C()) {
        dialects.add(Dialect.W3C);
      }

      this.dialects = Set.copyOf(dialects);

      validate();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public static NewSessionPayload create(Capabilities caps) {
    Require.nonNull("Capabilities", caps);
    return create(Collections.singleton(caps));
  }

  public static NewSessionPayload create(Collection<Capabilities> caps) {
    // We need to convert the capabilities into a new session payload. At this point we're dealing
    // with references, so I'm Just Sure This Will Be Fine.
    return create(
        Map.of(
            "capabilities",
            Map.of(
                "firstMatch",
                caps.stream().map(Capabilities::asMap).collect(Collectors.toList()))));
  }

  public static NewSessionPayload create(Map<String, ?> source) {
    // It is expected that the input to this method contains a properly formed
    // "new session" request, and not just a random blob of data. Make sure
    // this precondition is met before continuing.
    Require.precondition(
        source.containsKey("capabilities"), "New session payload must contain capabilities");

    return new NewSessionPayload(Contents.asJson(Require.nonNull("Payload", source)));
  }

  public static NewSessionPayload create(Contents.Supplier supplier) {
    return new NewSessionPayload(supplier);
  }

  public Contents.Supplier getSupplier() {
    return supplier;
  }

  private void validate() throws IOException {
    Map<String, Object> alwaysMatch = getAlwaysMatch();
    if (alwaysMatch == null) {
      alwaysMatch = Map.of();
    }
    Map<String, Object> always = alwaysMatch;
    Collection<Map<String, Object>> firsts = getFirstMatches();
    if (firsts == null) {
      firsts = List.of(Map.of());
    }

    if (firsts.isEmpty()) {
      throw new IllegalArgumentException("First match w3c capabilities is zero length");
    }

    firsts.stream()
        .peek(
            map -> {
              Set<String> overlap = new HashSet<>(always.keySet());
              overlap.removeIf((e) -> !map.keySet().contains(e));
              if (!overlap.isEmpty()) {
                throw new IllegalArgumentException(
                    "Overlapping keys between w3c always and first match capabilities: " + overlap);
              }
            })
        .map(
            first -> {
              Map<String, Object> toReturn = new HashMap<>();
              toReturn.putAll(always);
              toReturn.putAll(first);
              return toReturn;
            })
        .peek(
            map -> {
              List<String> nullKeys =
                  map.entrySet().stream()
                      .filter(entry -> entry.getValue() == null)
                      .map(Map.Entry::getKey)
                      .sorted()
                      .collect(Collectors.toList());
              if (!nullKeys.isEmpty()) {
                throw new IllegalArgumentException(
                    "Null values found in w3c capabilities. Keys are: " + nullKeys);
              }
            })
        .peek(
            map -> {
              List<String> illegalKeys =
                  map.keySet().stream()
                      .filter(ACCEPTED_W3C_PATTERNS.negate())
                      .sorted()
                      .collect(Collectors.toList());
              if (!illegalKeys.isEmpty()) {
                throw new IllegalArgumentException(
                    "Illegal key values seen in w3c capabilities: " + illegalKeys);
              }
            })
        .forEach(map -> {});
  }

  public void writeTo(Appendable appendable) throws IOException {
    try (JsonOutput json = new Json().newOutput(appendable)) {
      json.beginObject();

      // Now for the w3c capabilities
      json.name("capabilities");
      json.beginObject();

      // Then write everything into the w3c payload. Because of the way we do this, it's easiest
      // to just populate the "firstMatch" section. The spec says it's fine to omit the
      // "alwaysMatch" field, so we do this.
      json.name("firstMatch");
      json.beginArray();
      getW3C().forEach(json::write);
      json.endArray();

      json.endObject(); // Close "capabilities" object

      writeMetaData(json);

      json.endObject();
    }
  }

  private void writeMetaData(JsonOutput out) throws IOException {
    try (Reader reader = Contents.reader(supplier, UTF_8);
        JsonInput input = json.newInput(reader)) {
      input.beginObject();
      while (input.hasNext()) {
        String name = input.nextName();
        switch (name) {
          case "capabilities":
            input.skipValue();
            break;

          default:
            out.name(name);
            out.write(input.read(Object.class));
            break;
        }
      }
    }
  }

  /**
   * Stream the {@link Capabilities} encoded in the payload used to create this instance. The {@link
   * Stream} will expand each of the "{@code firstMatch}" and "{@code alwaysMatch}" contents as
   * defined in the W3C WebDriver spec.
   */
  public Stream<Capabilities> stream() {
    try {
      return getW3C().filter(Objects::nonNull).distinct().map(ImmutableCapabilities::new);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public Set<Dialect> getDownstreamDialects() {
    return dialects.isEmpty() ? Set.of(DEFAULT_DIALECT) : dialects;
  }

  public Map<String, Object> getMetadata() {
    Set<String> ignoredMetadataKeys = Set.of("capabilities");

    try (Reader reader = Contents.reader(supplier, UTF_8);
        JsonInput input = json.newInput(reader)) {
      Map<String, Object> toReturn = new LinkedHashMap<>();

      input.beginObject();
      while (input.hasNext()) {
        String name = input.nextName();
        if (ignoredMetadataKeys.contains(name)) {
          input.skipValue();
          continue;
        }

        Object value = input.read(Object.class);
        if (value == null) {
          continue;
        }

        toReturn.put(name, value);
      }
      input.endObject();

      return Map.copyOf(toReturn);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  @Override
  public void close() {
    try {
      supplier.close();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private Stream<Map<String, Object>> getW3C() throws IOException {
    // For the sake of simplicity, we're going to make the (probably wrong)
    // assumption we can hold all of the firstMatch values and alwaysMatch
    // value in memory at the same time.

    Stream<Map<String, Object>> fromW3c;
    Map<String, Object> alwaysMatch = getAlwaysMatch();
    Collection<Map<String, Object>> firsts = getFirstMatches();

    if (alwaysMatch == null && firsts == null) {
      fromW3c = Stream.of(); // No W3C capabilities.
    } else {
      if (alwaysMatch == null) {
        alwaysMatch = Map.of();
      }
      Map<String, Object> always = alwaysMatch; // Keep the compiler happy.
      if (firsts == null) {
        firsts = List.of(Map.of());
      }

      fromW3c =
          firsts.stream()
              .map(
                  first -> {
                    Map<String, Object> merged = new LinkedHashMap<>(always);
                    merged.putAll(first);
                    return Map.copyOf(merged);
                  });
    }

    return fromW3c.distinct();
  }

  private boolean isW3C() throws IOException {
    try (Reader reader = Contents.reader(supplier, UTF_8);
        JsonInput input = json.newInput(reader)) {
      input.beginObject();
      while (input.hasNext()) {
        String name = input.nextName();
        if ("capabilities".equals(name)) {
          return true;
        } else {
          input.skipValue();
        }
      }
    }
    return false;
  }

  private Map<String, Object> getAlwaysMatch() throws IOException {
    try (Reader reader = Contents.reader(supplier, UTF_8);
        JsonInput input = json.newInput(reader)) {
      input.beginObject();
      while (input.hasNext()) {
        String name = input.nextName();
        if ("capabilities".equals(name)) {
          input.beginObject();
          while (input.hasNext()) {
            name = input.nextName();
            if ("alwaysMatch".equals(name)) {
              return input.read(MAP_TYPE);
            } else {
              input.skipValue();
            }
          }
          input.endObject();
        } else {
          input.skipValue();
        }
      }
    }
    return Map.of();
  }

  private Collection<Map<String, Object>> getFirstMatches() throws IOException {
    try (Reader reader = Contents.reader(supplier, UTF_8);
        JsonInput input = json.newInput(reader)) {
      input.beginObject();
      while (input.hasNext()) {
        String name = input.nextName();
        if ("capabilities".equals(name)) {
          input.beginObject();
          while (input.hasNext()) {
            name = input.nextName();
            if ("firstMatch".equals(name)) {
              return input.read(LIST_OF_MAPS_TYPE);
            } else {
              input.skipValue();
            }
          }
          input.endObject();
        } else {
          input.skipValue();
        }
      }
    }
    return List.of(Map.of());
  }

  @Override
  public String toString() {
    StringBuilder res = new StringBuilder();
    try {
      writeTo(res);
    } catch (IOException ignore) {
    }
    return res.toString();
  }
}
