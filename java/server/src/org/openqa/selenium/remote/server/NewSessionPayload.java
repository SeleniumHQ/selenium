package org.openqa.selenium.remote.server;

import static java.nio.charset.StandardCharsets.UTF_8;
import static java.nio.file.StandardOpenOption.CREATE;
import static java.nio.file.StandardOpenOption.TRUNCATE_EXISTING;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Ordering;
import com.google.common.collect.Sets;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.google.gson.stream.JsonReader;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.Dialect;

import java.io.Closeable;
import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.io.UncheckedIOException;
import java.io.Writer;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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

  private static final Gson GSON = new GsonBuilder().setLenient().serializeNulls().create();
  private static final Type MAP_TYPE = new TypeToken<Map<String, Object>>(){}.getType();

  private final Path root;
  private final Sources sources;

  public NewSessionPayload(Map<String, ?> source) throws IOException {
    Objects.requireNonNull(source, "Payload must be set");

    String json = new BeanToJsonConverter().convert(source);

    long size = json.length() * 2;  // Each character takes two bytes
    if (size > THRESHOLD || Runtime.getRuntime().freeMemory() < size) {
      this.root = Files.createTempDirectory("new-session");
      this.sources = diskBackedSource(new StringReader(json));
    } else {
      this.root = null;
      this.sources = memoryBackedSource(source);
    }
  }

  public NewSessionPayload(long size, Reader source) throws IOException {
    if (size > THRESHOLD || Runtime.getRuntime().freeMemory() < size) {
      this.root = Files.createTempDirectory("new-session");
      this.sources = diskBackedSource(source);
    } else {
      this.root = null;
      this.sources = memoryBackedSource(GSON.fromJson(source, MAP_TYPE));
    }
  }

  private Sources memoryBackedSource(Map<String, ?> source) {
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

    return new Sources(
        () -> oss,
        () -> alwaysMatch,
        firstMatches,
        dialects);
  }

  private Sources diskBackedSource(Reader source) throws IOException {
    LOG.fine("Disk-based payload for " + source);

    try (JsonReader json = GSON.newJsonReader(source)) {
      Set<Dialect> dialects = new TreeSet<>();
      Supplier<Map<String, Object>> oss = null;
      Supplier<Map<String, Object>> always = ImmutableMap::of;
      List<Supplier<Map<String, Object>>> first = new LinkedList<>();

      json.beginObject();

      while (json.hasNext()) {
        switch (json.nextName()) {
          case "capabilities":
            json.beginObject();
            while (json.hasNext()) {
              switch (json.nextName()) {

                case "alwaysMatch":
                  Path a = write("always-match.json", json);
                  always = () -> read(a);
                  dialects.add(Dialect.W3C);
                  break;

                case "firstMatch":
                  json.beginArray();
                  int i = 0;
                  while (json.hasNext()) {
                    Path f = write("first-match-" + i + ".json", json);
                    first.add(() -> read(f));
                    i++;
                  }
                  json.endArray();
                  dialects.add(Dialect.W3C);
                  break;

                default:
                  json.skipValue();
              }
            }
            json.endObject();
            break;

          case "desiredCapabilities":
            Path ossCaps = write("oss.json", json);
            oss = () -> read(ossCaps);
            break;

          default:
            json.skipValue();
        }
      }
      json.endObject();

      if (first.isEmpty()) {
        first.add(ImmutableMap::of);
      }

      return new Sources(
        oss,
        always,
        first,
        dialects);
    } finally {
      source.close();
    }
  }

  private Path write(String fileName, JsonReader json) throws IOException {
    Path out = root.resolve(fileName);

    Map<String, Object> value = GSON.fromJson(json, MAP_TYPE);

    try (Writer writer = Files.newBufferedWriter(out, UTF_8, TRUNCATE_EXISTING, CREATE)) {
      GSON.toJson(value, writer);
    }

    return out;
  }

  private Map<String, Object> read(Path path) {
    try (Reader reader = Files.newBufferedReader(path, UTF_8)) {
      return GSON.fromJson(reader, MAP_TYPE);
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

  public Stream<Capabilities> stream() throws IOException {
    Stream<? extends Map<String, Object>> mapStream;

    if (getDownstreamDialects().contains(Dialect.W3C)) {
      Map<String, Object> always = sources.getAlwaysMatch().get();
      mapStream = sources.getFirstMatch().stream()
        .map(Supplier::get)
        .peek(m -> {
          Set<String> intersection = Sets.intersection(always.keySet(), m.keySet());
          if (!intersection.isEmpty()) {
            throw new IllegalArgumentException("Duplicate w3c capability keys: " + intersection);
          }
        })
        .map(m -> ImmutableMap.<String, Object>builder().putAll(always).putAll(m).build())
        .peek(m -> {
          Set<String> illegalKeys = m.keySet().stream().filter(ACCEPTED_W3C_PATTERNS.negate())
                  .collect(ImmutableSortedSet.toImmutableSortedSet( Ordering.natural()));
          if (!illegalKeys.isEmpty()) {
           throw new IllegalArgumentException("Illegal w3c capability keys: " + illegalKeys);
          }
        });
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
           sources .getDialects();
  }

  @Override
  public void close() {
    if (root != null) {
      FileHandler.delete(root.toAbsolutePath().toFile());
    }
  }

  private static class Sources {
    private final Supplier<Map<String, Object>> oss;
    private final Supplier<Map<String, Object>> alwaysMatch;
    private final List<Supplier<Map<String, Object>>> firstMatch;
    private final ImmutableSet<Dialect> dialects;

    Sources(
        Supplier<Map<String, Object>> oss,
        Supplier<Map<String, Object>> alwaysMatch,
        List<Supplier<Map<String, Object>>> firstMatch,
        Set<Dialect> dialects) {
      this.oss = oss;
      this.alwaysMatch = alwaysMatch;
      this.firstMatch = firstMatch;
      this.dialects = ImmutableSet.copyOf(dialects);
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
  }
}
