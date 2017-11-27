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
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.CapabilityType.PLATFORM;
import static org.openqa.selenium.remote.CapabilityType.PLATFORM_NAME;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Ordering;
import com.google.common.collect.Sets;
import com.google.common.io.CharSource;
import com.google.common.io.CharStreams;
import com.google.common.io.FileBackedOutputStream;
import com.google.gson.reflect.TypeToken;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.session.CapabilitiesFilter;
import org.openqa.selenium.remote.session.CapabilityTransform;
import org.openqa.selenium.remote.session.ChromeFilter;
import org.openqa.selenium.remote.session.EdgeFilter;
import org.openqa.selenium.remote.session.FirefoxFilter;
import org.openqa.selenium.remote.session.InternetExplorerFilter;
import org.openqa.selenium.remote.session.OperaFilter;
import org.openqa.selenium.remote.session.ProxyTransform;
import org.openqa.selenium.remote.session.SafariFilter;
import org.openqa.selenium.remote.session.StripAnyPlatform;
import org.openqa.selenium.remote.session.W3CPlatformNameNormaliser;

import java.io.Closeable;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.StringReader;
import java.io.Writer;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Queue;
import java.util.ServiceLoader;
import java.util.Set;
import java.util.TreeMap;
import java.util.function.Predicate;
import java.util.logging.Logger;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;


public class NewSessionPayload implements Closeable {

  private static final Logger LOG = Logger.getLogger(NewSessionPayload.class.getName());

  private final Set<CapabilitiesFilter> adapters;
  private final Set<CapabilityTransform> transforms;

  private static final Dialect DEFAULT_DIALECT = Dialect.OSS;
  private final static Predicate<String> ACCEPTED_W3C_PATTERNS = Stream.of(
      "^[\\w-]+:.*$",
      "^acceptInsecureCerts$",
      "^browserName$",
      "^browserVersion$",
      "^platformName$",
      "^pageLoadStrategy$",
      "^proxy$",
      "^setWindowRect$",
      "^timeouts$",
      "^unhandledPromptBehavior$")
      .map(Pattern::compile)
      .map(Pattern::asPredicate)
      .reduce(identity -> false, Predicate::or);

  private final Json json = new Json();
  private final FileBackedOutputStream backingStore;
  private final ImmutableSet<Dialect> dialects;

  public static NewSessionPayload create(Capabilities caps) throws IOException {
    // We need to convert the capabilities into a new session payload. At this point we're dealing
    // with references, so I'm Just Sure This Will Be Fine.
    return create(ImmutableMap.of("desiredCapabilities", caps.asMap()));
  }

  public static NewSessionPayload create(Map<String, ?> source) throws IOException {
    Objects.requireNonNull(source, "Payload must be set");

    String json = new Json().toJson(source);
    return new NewSessionPayload(new StringReader(json));
  }

  public static NewSessionPayload create(Reader source) throws IOException {
    return new NewSessionPayload(source);
  }

  private NewSessionPayload(Reader source) throws IOException {
    // Dedicate up to 10% of all RAM or 20% of available RAM (whichever is smaller) to storing this
    // payload.
    int threshold = (int) Math.min(
        Integer.MAX_VALUE,
        Math.min(
            Runtime.getRuntime().freeMemory() / 5,
            Runtime.getRuntime().maxMemory() / 10));

    backingStore = new FileBackedOutputStream(threshold);
    try (Writer writer = new OutputStreamWriter(backingStore, UTF_8)) {
      CharStreams.copy(source, writer);
    }

    ImmutableSet.Builder<CapabilitiesFilter> adapters = ImmutableSet.builder();
    ServiceLoader.load(CapabilitiesFilter.class).forEach(adapters::add);
    adapters
        .add(new ChromeFilter())
        .add(new EdgeFilter())
        .add(new FirefoxFilter())
        .add(new InternetExplorerFilter())
        .add(new OperaFilter())
        .add(new SafariFilter());
    this.adapters = adapters.build();

    ImmutableSet.Builder<CapabilityTransform> transforms = ImmutableSet.builder();
    ServiceLoader.load(CapabilityTransform.class).forEach(transforms::add);
    transforms
        .add(new ProxyTransform())
        .add(new StripAnyPlatform())
        .add(new W3CPlatformNameNormaliser());
    this.transforms = transforms.build();

    ImmutableSet.Builder<Dialect> dialects = ImmutableSet.builder();
    if (getOss() != null) {
      dialects.add(Dialect.OSS);
    }
    if (getAlwaysMatch() != null || getFirstMatches() != null) {
      dialects.add(Dialect.W3C);
    }
    this.dialects = dialects.build();

    validate();
  }

  private void validate() throws IOException {
    Map<String, Object> alwaysMatch = getAlwaysMatch();
    if (alwaysMatch == null) {
      alwaysMatch = ImmutableMap.of();
    }
    Map<String, Object> always = alwaysMatch;
    Collection<Map<String, Object>> firsts = getFirstMatches();
    if (firsts == null) {
      firsts = ImmutableList.of(ImmutableMap.of());
    }

    if (firsts.isEmpty()) {
      throw new IllegalArgumentException("First match w3c capabilities is zero length");
    }

    firsts.stream()
        .peek(map -> {
          Set<String> overlap = Sets.intersection(always.keySet(), map.keySet());
          if (!overlap.isEmpty()) {
            throw new IllegalArgumentException(
                "Overlapping keys between w3c always and first match capabilities: " + overlap);
          }
        })
        .map(first -> {
          Map<String, Object> toReturn = new HashMap<>();
          toReturn.putAll(always);
          toReturn.putAll(first);
          return toReturn;
        })
        .peek(map -> {
          ImmutableSortedSet<String> nullKeys = map.entrySet().stream()
              .filter(entry -> entry.getValue() == null)
              .map(Map.Entry::getKey)
              .collect(ImmutableSortedSet.toImmutableSortedSet(Ordering.natural()));
          if (!nullKeys.isEmpty()) {
            throw new IllegalArgumentException(
                "Null values found in w3c capabilities. Keys are: " + nullKeys);
          }
        })
        .peek(map -> {
          ImmutableSortedSet<String> illegalKeys = map.entrySet().stream()
              .filter(entry -> !ACCEPTED_W3C_PATTERNS.test(entry.getKey()))
              .map(Map.Entry::getKey)
              .collect(ImmutableSortedSet.toImmutableSortedSet(Ordering.natural()));
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

      Map<String, Object> first = getOss();
      if (first == null) {
        first = stream().findFirst()
            .orElse(new ImmutableCapabilities())
            .asMap();
      }

      // Write the first capability we get as the desired capability.
      json.name("desiredCapabilities");
      json.write(first, MAP_TYPE);

      // And write the first capability for gecko13
      json.name("capabilities");
      json.beginObject();

      json.name("desiredCapabilities");
      json.write(first, MAP_TYPE);

      // Then write everything into the w3c payload. Because of the way we do this, it's easiest
      // to just populate the "firstMatch" section. The spec says it's fine to omit the
      // "alwaysMatch" field, so we do this.
      json.name("firstMatch");
      json.beginArray();
      //noinspection unchecked
      getW3C().forEach(map -> json.write(map, MAP_TYPE));
      json.endArray();

      json.endObject();  // Close "capabilities" object

      writeMetaData(json);

      json.endObject();
    }
  }

  private void writeMetaData(JsonOutput out) throws IOException {
    CharSource charSource = backingStore.asByteSource().asCharSource(UTF_8);
    try (Reader reader = charSource.openBufferedStream();
         JsonInput input = json.newInput(reader)) {
      input.beginObject();
      while (input.hasNext()) {
        String name = input.nextName();
        switch (name) {
          case "capabilities":
          case "desiredCapabilities":
          case "requiredCapabilities":
            input.skipValue();
            break;

          default:
            out.name(name);
            out.write(input.<Object>read(Object.class), Object.class);
            break;
        }
      }
    }
  }

  private void streamW3CProtocolParameters(JsonOutput out, Map<String, Object> des) {
    // Technically we should be building up a combination of "alwaysMatch" and "firstMatch" options.
    // We're going to do a little processing to figure out what we might be able to do, and assume
    // that people don't really understand the difference between required and desired (which is
    // commonly the case). Wish us luck. Looking at the current implementations, people may have
    // set options for multiple browsers, in which case a compliant W3C remote end won't start
    // a session. If we find this, then we create multiple firstMatch capabilities. Furrfu.
    // The table of options are:
    //
    // Chrome: chromeOptions
    // Firefox: moz:.*, firefox_binary, firefox_profile, marionette
    // Edge: none given
    // IEDriver: ignoreZoomSetting, initialBrowserUrl, enableElementCacheCleanup,
    //   browserAttachTimeout, enablePersistentHover, requireWindowFocus, logFile, logLevel, host,
    //   extractPath, silent, ie.*
    // Opera: operaOptions
    // SafariDriver: safari.options
    //
    // We can't use the constants defined in the classes because it would introduce circular
    // dependencies between the remote library and the implementations. Yay!
  }

  /**
   * Stream the {@link Capabilities} encoded in the payload used to create this instance. The
   * {@link Stream} will start with a {@link Capabilities} object matching the OSS capabilities, and
   * will then expand each of the "{@code firstMatch}" and "{@code alwaysMatch}" contents as defined
   * in the W3C WebDriver spec.
   * <p>
   * The OSS {@link Capabilities} are listed first because converting the OSS capabilities to the
   * equivalent W3C capabilities isn't particularly easy, so it's hoped that this approach gives us
   * the most compatible implementation.
   */
  public Stream<ImmutableCapabilities> stream() throws IOException {
    // OSS first
    Stream<Map<String, Object>> oss = Stream.of(getOss());

    // And now W3C
    Stream<Map<String, Object>> w3c = getW3C();

    return Stream.concat(oss, w3c)
        .filter(Objects::nonNull)
        .map(this::applyTransforms)
        .filter(Objects::nonNull)
        .distinct()
        .map(ImmutableCapabilities::new);
  }

  public ImmutableSet<Dialect> getDownstreamDialects() {
    return dialects.isEmpty() ? ImmutableSet.of(DEFAULT_DIALECT) : dialects;
  }

  @Override
  public void close() throws IOException {
    backingStore.reset();
  }

  private Map<String, Object> getOss() throws IOException {
    CharSource charSource = backingStore.asByteSource().asCharSource(UTF_8);
    try (Reader reader = charSource.openBufferedStream();
         JsonInput input = json.newInput(reader)) {
      input.beginObject();
      while (input.hasNext()) {
        String name = input.nextName();
        if ("desiredCapabilities".equals(name)) {
          return input.read(MAP_TYPE);
        } else {
          input.skipValue();
        }
      }
    }
    return null;
  }

  private Stream<Map<String, Object>> getW3C() throws IOException {
    // If there's an OSS value, generate a stream of capabilities from that using the transforms,
    // then add magic to generate each of the w3c capabilities. For the sake of simplicity, we're
    // going to make the (probably wrong) assumption we can hold all of the firstMatch values and
    // alwaysMatch value in memory at the same time.
    Map<String, Object> oss = convertOssToW3C(getOss());
    Stream<Map<String, Object>> fromOss;
    if (oss != null) {
      Set<String> usedKeys = new HashSet<>();

      // Are there any values we care want to pull out into a mapping of their own?
      List<Map<String, Object>> firsts = adapters.stream()
          .map(adapter -> adapter.apply(oss))
          .filter(Objects::nonNull)
          .filter(map -> !map.isEmpty())
          .map(map ->
            map.entrySet().stream()
                .filter(entry -> entry.getKey() != null)
                .filter(entry -> ACCEPTED_W3C_PATTERNS.test(entry.getKey()))
                .filter(entry -> entry.getValue() != null)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue)))
          .peek(map -> usedKeys.addAll(map.keySet()))
          .collect(ImmutableList.toImmutableList());
      if (firsts.isEmpty()) {
        firsts = ImmutableList.of(ImmutableMap.of());
      }

      // Are there any remaining unused keys?
      Map<String, Object> always = oss.entrySet().stream()
          .filter(entry -> !usedKeys.contains(entry.getKey()))
          .filter(entry -> entry.getValue() != null)
          .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));

      // Firsts contains at least one entry, always contains everything else. Let's combine them
      // into the stream to form a unified set of capabilities. Woohoo!
      fromOss = firsts.stream()
          .map(first -> ImmutableMap.<String, Object>builder().putAll(always).putAll(first).build())
          .map(this::applyTransforms)
          .map(map -> map.entrySet().stream()
              .filter(entry -> ACCEPTED_W3C_PATTERNS.test(entry.getKey()))
             .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue)))
          .map(map -> (Map<String, Object>) map);
    } else {
      fromOss = Stream.of();
    }

    Stream<Map<String, Object>> fromW3c = null;
    Map<String, Object> alwaysMatch = getAlwaysMatch();
    Collection<Map<String, Object>> firsts = getFirstMatches();

    if (alwaysMatch == null && firsts == null) {
      fromW3c = Stream.of();  // No W3C capabilities.
    } else {
      if (alwaysMatch == null) {
        alwaysMatch = ImmutableMap.of();
      }
      Map<String, Object> always = alwaysMatch; // Keep the comoiler happy.
      if (firsts == null) {
        firsts = ImmutableList.of(ImmutableMap.of());
      }

      fromW3c = firsts.stream()
          .map(first -> ImmutableMap.<String, Object>builder().putAll(always).putAll(first).build());
    }

    return Stream.concat(fromOss, fromW3c).distinct();
  }

  private Map<String, Object> convertOssToW3C(Map<String, Object> capabilities) {
    if (capabilities == null) {
      return null;
    }

    Map<String, Object> toReturn = new TreeMap<>();
    toReturn.putAll(capabilities);

    // Platform name
    if (capabilities.containsKey(PLATFORM) && !capabilities.containsKey(PLATFORM_NAME)) {
      toReturn.put(PLATFORM_NAME, String.valueOf(capabilities.get(PLATFORM)));
    }

    return toReturn;
  }

  private Map<String, Object> getAlwaysMatch() throws IOException {
    CharSource charSource = backingStore.asByteSource().asCharSource(UTF_8);
    try (Reader reader = charSource.openBufferedStream();
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
    return null;
  }

  private Collection<Map<String, Object>> getFirstMatches() throws IOException {
    CharSource charSource = backingStore.asByteSource().asCharSource(UTF_8);
    try (Reader reader = charSource.openBufferedStream();
         JsonInput input = json.newInput(reader)) {
      input.beginObject();
      while (input.hasNext()) {
        String name = input.nextName();
        if ("capabilities".equals(name)) {
          input.beginObject();
          while (input.hasNext()) {
            name = input.nextName();
            if ("firstMatch".equals(name)) {
              return input.read(new TypeToken<List<Map<String, Object>>>(){}.getType());
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
    return null;
  }

  private Map<String, Object> applyTransforms(Map<String, Object> caps) {
    Queue<Map.Entry<String, Object>> toExamine = new LinkedList<>();
    toExamine.addAll(caps.entrySet());
    Set<String> seenKeys = new HashSet<>();
    Map<String, Object> toReturn = new TreeMap<>();

    // Take each entry and apply the transforms
    while (!toExamine.isEmpty()) {
      Map.Entry<String, Object> entry = toExamine.remove();
      seenKeys.add(entry.getKey());

      if (entry.getValue() == null) {
        continue;
      }

      for (CapabilityTransform transform : transforms) {
        Collection<Map.Entry<String, Object>> result = transform.apply(entry);
        if (result == null) {
          toReturn.remove(entry.getKey());
          break;
        }

        for (Map.Entry<String, Object> newEntry : result) {
          if (!seenKeys.contains(newEntry.getKey())) {
            toExamine.add(newEntry);
          } else {
            if (newEntry.getKey().equals(entry.getKey())) {
              entry = newEntry;
            }
            toReturn.put(newEntry.getKey(), newEntry.getValue());
          }
        }
      }
    }
    return toReturn;
  }
}
