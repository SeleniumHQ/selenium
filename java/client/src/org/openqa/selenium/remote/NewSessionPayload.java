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
import static java.nio.file.StandardOpenOption.CREATE;
import static java.nio.file.StandardOpenOption.TRUNCATE_EXISTING;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSortedMap;
import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Ordering;
import com.google.common.collect.Sets;
import com.google.common.io.CharStreams;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.io.FileHandler;
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
import org.openqa.selenium.remote.session.W3CNameTransform;
import org.openqa.selenium.remote.session.W3CPlatformNameNormaliser;

import java.io.ByteArrayInputStream;
import java.io.Closeable;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.io.Writer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Queue;
import java.util.ServiceLoader;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.logging.Logger;
import java.util.regex.Pattern;
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

  // Dedicate up to 10% of max ram to holding the payload
  private static final long THRESHOLD = Runtime.getRuntime().maxMemory() / 10;

  private final Json json = new Json();
  private final Path root;
  private final Sources sources;

  public static NewSessionPayload create(Capabilities caps) throws IOException {
    // We need to convert the capabilities into a new session payload. At this point we're dealing
    // with references, so I'm Just Sure This Will Be Fine.

    ImmutableMap.Builder<String, Object> builder = ImmutableMap.builder();

    // OSS
    builder.put("desiredCapabilities", caps.asMap());

    // W3C Spec.
    // TODO(simons): There's some serious overlap between ProtocolHandshake and this class.
    ImmutableMap.Builder<String, Object> w3cCaps = ImmutableMap.builder();
    caps.asMap().entrySet().stream()
        .filter(e -> ACCEPTED_W3C_PATTERNS.test(e.getKey()))
        .filter(e -> e.getValue() != null)
        .forEach(e -> w3cCaps.put(e.getKey(), e.getValue()));
    builder.put(
        "capabilities", ImmutableMap.of(
            "firstMatch", ImmutableList.of(w3cCaps.build())));

    return create(builder.build());
  }

  public static NewSessionPayload create(Map<String, ?> source) throws IOException {
    Objects.requireNonNull(source, "Payload must be set");

    byte[] json = new Json().toJson(source).getBytes(UTF_8);
    return new NewSessionPayload(
        json.length,
        new InputStreamReader(new ByteArrayInputStream(json), UTF_8));
  }

  public static NewSessionPayload create(long size, Reader source) throws IOException {
    return new NewSessionPayload(size, source);
  }

  private NewSessionPayload(long size, Reader source) throws IOException {
    Sources sources;
    if (size > THRESHOLD || Runtime.getRuntime().freeMemory() < size) {
      this.root = Files.createTempDirectory("new-session");
      sources = diskBackedSource(source);
    } else {
      this.root = null;
      sources = memoryBackedSource(new Json().toType(CharStreams.toString(source), Map.class));
    }

    validate(sources);
    this.sources = rewrite(sources);

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
        .add(new W3CPlatformNameNormaliser())
        .add(new W3CNameTransform());
    this.transforms = transforms.build();
  }

  public void writeTo(Appendable appendable) throws IOException {
    try (JsonOutput json = new Json().newOutput(appendable)) {
      json.beginObject();

      @SuppressWarnings("unchecked")
      Map<String, Object> first = (Map<String, Object>) stream().findFirst()
          .orElse(new ImmutableCapabilities())
          .asMap();

      // Write the first capability we get as the desired capability.
      json.name("desiredCapabilities");
      json.write(first, Json.MAP_TYPE);

      // And write the first capability for gecko13
      json.name("capabilities");
      json.beginObject();

      json.name("desiredCapabilities");
      json.write(first, Json.MAP_TYPE);

      // Then write everything into the w3c payload. Because of the way we do this, it's easiest
      // to just populate the "firstMatch" section. The spec says it's fine to omit the
      // "alwaysMatch" field, so we do this.
      json.name("firstMatch");
      json.beginArray();
      //noinspection unchecked
      stream()
          .map(Capabilities::asMap)
          .map(map -> (Map<String, Object>) map)
          .forEach(map -> streamW3CProtocolParameters(json, map));
      json.endArray();

      json.endObject();  // Close "capabilities" object
      json.endObject();
    }
  }

  private void validate(Sources sources) {
    if (!sources.getDialects().contains(Dialect.W3C)) {
      return;  // Nothing to do
    }

    // Ensure that the W3C payload looks okay
    Map<String, Object> alwaysMatch = sources.getAlwaysMatch().get();
    validateSpecCompliance(alwaysMatch);

    Set<String> duplicateKeys = sources.getFirstMatch().stream()
        .map(Supplier::get)
        .peek(this::validateSpecCompliance)
        .map(fragment -> Sets.intersection(alwaysMatch.keySet(), fragment.keySet()))
        .flatMap(Collection::stream)
        .collect(ImmutableSortedSet.toImmutableSortedSet(Ordering.natural()));

    if (!duplicateKeys.isEmpty()) {
      throw new IllegalArgumentException(
          "W3C payload contained keys duplicated between the firstMatch and alwaysMatch items: " +
          duplicateKeys);
    }
  }

  private void validateSpecCompliance(Map<String, Object> fragment) {
    ImmutableList<String> badKeys = fragment.keySet().stream()
        .filter(ACCEPTED_W3C_PATTERNS.negate())
        .collect(ImmutableList.toImmutableList());

    if (!badKeys.isEmpty()) {
      throw new IllegalArgumentException(
          "W3C payload contained keys that do not comply with the spec: " + badKeys);
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

    ImmutableList<Map<String, Object>> firstMatch = adapters.stream()
        .map(adapter -> adapter.apply(des))
        .filter(Objects::nonNull)
        .map(this::applyTransforms)
        .filter(w3cCaps -> !w3cCaps.isEmpty())
        .collect(ImmutableList.toImmutableList());

    Set<String> excludedKeys = firstMatch.stream()
        .map(Map::keySet)
        .flatMap(Collection::stream)
        .distinct()
        .collect(ImmutableSet.toImmutableSet());

    Map<String, Object> alwaysMatch = applyTransforms(des).entrySet().stream()
        .filter(entry -> !excludedKeys.contains(entry.getKey()))
        .filter(entry -> entry.getValue() != null)
        .collect(ImmutableSortedMap.toImmutableSortedMap(
            Ordering.natural(),
            Map.Entry::getKey,
            Map.Entry::getValue));

    firstMatch.stream()
        .map(first -> ImmutableSortedMap.naturalOrder().putAll(alwaysMatch).putAll(first).build())
        .forEach(map -> out.write(map, MAP_TYPE));
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

  /**
   * If the local end sent a request with a JSON Wire Protocol payload that does not have a matching
   * W3C payload, then we need to synthesize one that matches.
   */
  private Sources rewrite(Sources sources) {
    if (!sources.getDialects().contains(Dialect.OSS)) {
      // Yay! Nothing to do!
      return sources;
    }

    if (!sources.getDialects().contains(Dialect.W3C)) {
      // Yay! Also nothing to do. I mean, we have an empty payload, but that's cool.
      return sources;
    }

    Map<String, Object> ossPayload = sources.getOss().get().entrySet().stream()
        .filter(e -> !("platform".equals(e.getKey()) && "ANY".equals(e.getValue())))
        .filter(e -> !("version".equals(e.getKey()) && "".equals(e.getValue())))
        .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));
    Map<String, Object> always = sources.getAlwaysMatch().get();
    Optional<ImmutableMap<String, Object>> w3cMatch = sources.getFirstMatch().stream()
        .map(Supplier::get)
        .map(m -> ImmutableMap.<String, Object>builder().putAll(always).putAll(m).build())
        .filter(m -> m.equals(ossPayload))
        .findAny();
    if (w3cMatch.isPresent()) {
      // There's a w3c capability that matches the oss one. Nothing to do.
      LOG.fine("Found a w3c capability that matches the oss one.");
      return sources;
    }

    LOG.info("Mismatched capabilities. Creating a synthetic w3c capability.");

    ImmutableList.Builder<Supplier<Map<String, Object>>> newFirstMatches = ImmutableList.builder();
    newFirstMatches.add(sources.getOss());
    sources.getFirstMatch()
        .forEach(m -> newFirstMatches.add(() -> {
          ImmutableMap.Builder<String, Object> builder = ImmutableMap.builder();
          builder.putAll(sources.getAlwaysMatch().get());
          builder.putAll(m.get());
          return builder.build();
        }));

    return new Sources(
        sources.getOriginalPayload(),
        sources.getPayloadSize(),
        sources.getOss(),
        ImmutableMap::of,
        newFirstMatches.build(),
        sources.getDialects());
  }

  private Sources memoryBackedSource(Map<?, ?> source) {
    LOG.fine("Memory-based payload for: " + source);

    Set<Dialect> dialects = new TreeSet<>();
    Map<String, Object> oss = toMap(source.get("desiredCapabilities"));
    if (oss != null) {
      dialects.add(Dialect.OSS);
    }

    Map<String, Object> alwaysMatch = new TreeMap<>();
    List<Supplier<Map<String, Object>>> firstMatches = new LinkedList<>();

    Map<String, Object> caps = toMap(source.get("capabilities"));
    if (caps != null) {
      Map<String, Object> always = toMap(caps.get("alwaysMatch"));
      if (always != null) {
        alwaysMatch.putAll(always);
        dialects.add(Dialect.W3C);
      }
      Object raw = caps.get("firstMatch");
      if (raw instanceof Collection) {
        ((Collection<?>) raw).stream()
            .map(NewSessionPayload::toMap)
            .filter(Objects::nonNull)
            .forEach(m -> firstMatches.add(() -> m));
        dialects.add(Dialect.W3C);
      }
      if (firstMatches.isEmpty()) {
        firstMatches.add(ImmutableMap::of);
      }
    }

    byte[] json = new Json().toJson(source).getBytes(UTF_8);

    return new Sources(
        () -> new ByteArrayInputStream(json),
        json.length,
        () -> oss,
        () -> alwaysMatch,
        firstMatches,
        dialects);
  }

  private Sources diskBackedSource(Reader source) throws IOException {
    LOG.fine("Disk-based payload for " + source);

    // Copy the original payload to disk
    Path payload = root.resolve("original-payload.json");
    try (Writer out = Files.newBufferedWriter(payload, UTF_8)) {
      CharStreams.copy(source, out);
    }

    try (
        Reader in = Files.newBufferedReader(payload);
        JsonInput jin = json.newInput(in)) {
      Set<Dialect> dialects = new TreeSet<>();
      Supplier<Map<String, Object>> oss = null;
      Supplier<Map<String, Object>> always = ImmutableMap::of;
      List<Supplier<Map<String, Object>>> first = new LinkedList<>();

      jin.beginObject();

      while (jin.hasNext()) {
        switch (jin.nextName()) {
          case "capabilities":
            jin.beginObject();
            while (jin.hasNext()) {
              switch (jin.nextName()) {

                case "alwaysMatch":
                  Path a = write("always-match.json", jin);
                  always = () -> read(a);
                  dialects.add(Dialect.W3C);
                  break;

                case "firstMatch":
                  jin.beginArray();
                  int i = 0;
                  while (jin.hasNext()) {
                    Path f = write("first-match-" + i + ".json", jin);
                    first.add(() -> read(f));
                    i++;
                  }
                  jin.endArray();
                  dialects.add(Dialect.W3C);
                  break;

                default:
                  jin.skipValue();
              }
            }
            jin.endObject();
            break;

          case "desiredCapabilities":
            Path ossCaps = write("oss.json", jin);
            oss = () -> read(ossCaps);
            dialects.add(Dialect.OSS);
            break;

          default:
            jin.skipValue();
        }
      }
      jin.endObject();

      if (first.isEmpty()) {
        first.add(ImmutableMap::of);
      }

      return new Sources(
          () -> {
            try {
              return Files.newInputStream(payload);
            } catch (IOException e) {
              throw new UncheckedIOException(e);
            }
          },
          Files.size(payload),
          oss,
          always,
          first,
          dialects);
    } finally {
      source.close();
    }
  }

  private Path write(String fileName, JsonInput json) {
    Path out = root.resolve(fileName);

    try (Writer writer = Files.newBufferedWriter(out, UTF_8, TRUNCATE_EXISTING, CREATE);
         JsonOutput jsonOut = this.json.newOutput(writer)) {
      jsonOut.write(json, MAP_TYPE);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }

    return out;
  }

  private Map<String, Object> read(Path path) {
    try (Reader reader = Files.newBufferedReader(path, UTF_8);
         JsonInput jin = json.newInput(reader)) {
      return jin.read(MAP_TYPE);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private static Map<String, Object> toMap(Object obj) {
    if (!(obj instanceof Map)) {
      return null;
    }

    return ((Map<?, ?>) obj).entrySet()
        .stream()
        .filter(e -> e.getKey() != null)
        .filter(e -> e.getValue() != null)
        .collect(ImmutableMap.toImmutableMap(e -> String.valueOf(e.getKey()), Map.Entry::getValue));
  }

  public Stream<ImmutableCapabilities> stream() throws IOException {
    Stream<? extends Map<String, Object>> mapStream;

    if (getDownstreamDialects().contains(Dialect.W3C)) {
      Map<String, Object> always = sources.getAlwaysMatch().get();
      mapStream = sources.getFirstMatch().stream()
          .map(Supplier::get)
          .map(m -> ImmutableMap.<String, Object>builder().putAll(always).putAll(m).build());
    } else if (getDownstreamDialects().contains(Dialect.OSS)) {
      mapStream = Stream.of(sources.getOss().get());
    } else {
      mapStream = Stream.of(ImmutableMap.of());
    }

    return mapStream.map(ImmutableCapabilities::new);
  }

  public ImmutableSet<Dialect> getDownstreamDialects() {
    return sources.getDialects().isEmpty() ?
           ImmutableSet.of(DEFAULT_DIALECT) :
           sources.getDialects();
  }

  public Supplier<InputStream> getPayload() {
    return sources.getOriginalPayload();
  }

  public long getPayloadSize() {
    return sources.getPayloadSize();
  }

  @Override
  public void close() {
    if (root != null) {
      FileHandler.delete(root.toAbsolutePath().toFile());
    }
  }

  private static class Sources {

    private final Supplier<InputStream> originalPayload;
    private final long payloadSizeInBytes;
    private final Supplier<Map<String, Object>> oss;
    private final Supplier<Map<String, Object>> alwaysMatch;
    private final List<Supplier<Map<String, Object>>> firstMatch;
    private final ImmutableSet<Dialect> dialects;

    Sources(
        Supplier<InputStream> originalPayload,
        long payloadSizeInBytes,
        Supplier<Map<String, Object>> oss,
        Supplier<Map<String, Object>> alwaysMatch,
        List<Supplier<Map<String, Object>>> firstMatch,
        Set<Dialect> dialects) {
      this.originalPayload = originalPayload;
      this.payloadSizeInBytes = payloadSizeInBytes;
      this.oss = oss;
      this.alwaysMatch = alwaysMatch;
      this.firstMatch = firstMatch;
      this.dialects = ImmutableSet.copyOf(dialects);
    }

    Supplier<InputStream> getOriginalPayload() {
      return originalPayload;
    }

    Supplier<Map<String, Object>> getOss() {
      return oss;
    }

    Supplier<Map<String, Object>> getAlwaysMatch() {
      return alwaysMatch;
    }

    List<Supplier<Map<String, Object>>> getFirstMatch() {
      return firstMatch;
    }

    ImmutableSet<Dialect> getDialects() {
      return dialects;
    }

    public long getPayloadSize() {
      return payloadSizeInBytes;
    }
  }
}
