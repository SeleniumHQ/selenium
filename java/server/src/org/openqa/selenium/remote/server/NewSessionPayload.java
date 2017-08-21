package org.openqa.selenium.remote.server;

import static java.nio.charset.StandardCharsets.UTF_8;
import static java.nio.file.StandardOpenOption.CREATE;
import static java.nio.file.StandardOpenOption.TRUNCATE_EXISTING;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Ordering;
import com.google.common.collect.Sets;
import com.google.common.io.CharStreams;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParseException;
import com.google.gson.TypeAdapter;
import com.google.gson.TypeAdapterFactory;
import com.google.gson.reflect.TypeToken;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonToken;
import com.google.gson.stream.JsonWriter;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.JsonToBeanConverter;

import java.io.ByteArrayInputStream;
import java.io.Closeable;
import java.io.IOException;
import java.io.InputStream;
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
import java.util.Optional;
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

  private static final Gson GSON = new GsonBuilder()
      .registerTypeAdapterFactory(ListAdapter.FACTORY)
      .registerTypeAdapterFactory(MapAdapter.FACTORY)
      .setLenient()
      .serializeNulls()
      .create();
  private static final Type MAP_TYPE = new TypeToken<Map<String, Object>>(){}.getType();

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

    return new NewSessionPayload(builder.build());
  }

  public NewSessionPayload(Map<String, ?> source) throws IOException {
    Objects.requireNonNull(source, "Payload must be set");

    String json = new BeanToJsonConverter().convert(source);

    Sources sources;
    long size = json.length() * 2;  // Each character takes two bytes
    if (size > THRESHOLD || Runtime.getRuntime().freeMemory() < size) {
      this.root = Files.createTempDirectory("new-session");
      sources = diskBackedSource(new StringReader(json));
    } else {
      this.root = null;
      sources = memoryBackedSource(source);
    }

    validate(sources);
    this.sources = rewrite(sources);
  }

  public NewSessionPayload(long size, Reader source) throws IOException {
    Sources sources;
    if (size > THRESHOLD || Runtime.getRuntime().freeMemory() < size) {
      this.root = Files.createTempDirectory("new-session");
      sources = diskBackedSource(source);
    } else {
      this.root = null;
      sources =
          memoryBackedSource(
              new JsonToBeanConverter().convert(Map.class, CharStreams.toString(source)));
    }

    validate(sources);
    this.sources = rewrite(sources);
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

    byte[] json = new BeanToJsonConverter().convert(source).getBytes(UTF_8);

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
        JsonReader json = GSON.newJsonReader(in)) {
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
            dialects.add(Dialect.OSS);
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

  private static Object readValue(JsonReader in, Gson gson) throws IOException {
    switch (in.peek()) {
      case BEGIN_ARRAY:
      case BEGIN_OBJECT:
      case BOOLEAN:
      case NULL:
      case STRING:
        return gson.fromJson(in, Object.class);

      case NUMBER:
        String number = in.nextString();
        if (number.indexOf('.') != -1) {
          return Double.parseDouble(number);
        }
        return Long.parseLong(number);

      default:
        throw new JsonParseException("Unexpected type: " + in.peek());
    }
  }

  private static class MapAdapter extends TypeAdapter<Map<?, ?>> {

    private final static TypeAdapterFactory FACTORY = new TypeAdapterFactory() {
      @SuppressWarnings("unchecked")
      @Override
      public <T> TypeAdapter<T> create(Gson gson, TypeToken<T> type) {
        if (type.getRawType() == Map.class) {
          return (TypeAdapter<T>) new MapAdapter(gson);
        }
        return null;
      }
    };

    private final Gson gson;

    private MapAdapter(Gson gson) {
      this.gson = Objects.requireNonNull(gson);
    }

    @Override
    public Map<?, ?> read(JsonReader in) throws IOException {
      if (in.peek() == JsonToken.NULL) {
        in.nextNull();
        return null;
      }

      Map<String, Object> map = new TreeMap<>();
      in.beginObject();

      while (in.hasNext()) {
        String key = in.nextName();
        Object value = readValue(in, gson);

        map.put(key, value);
      }

      in.endObject();
      return map;
    }

    @Override
    public void write(JsonWriter out, Map<?, ?> value) throws IOException {
      // It's fine to use GSON's own default writer for this.
      out.beginObject();
      for (Map.Entry<?, ?> entry : value.entrySet()) {
        out.name(String.valueOf(entry.getKey()));
        @SuppressWarnings("unchecked")
        TypeAdapter<Object>
            adapter =
            (TypeAdapter<Object>) gson.getAdapter(entry.getValue().getClass());
        adapter.write(out, entry.getValue());
      }
      out.endObject();
    }
  }

  private static class ListAdapter extends TypeAdapter<List<?>> {

    private final static TypeAdapterFactory FACTORY = new TypeAdapterFactory() {
      @SuppressWarnings("unchecked")
      @Override
      public <T> TypeAdapter<T> create(Gson gson, TypeToken<T> type) {
        if (type.getRawType() == List.class) {
          return (TypeAdapter<T>) new ListAdapter(gson);
        }
        return null;
      }
    };

    private final Gson gson;

    private ListAdapter(Gson gson) {
      this.gson = Objects.requireNonNull(gson);
    }

    @Override
    public List<?> read(JsonReader in) throws IOException {
      if (in.peek() == JsonToken.NULL) {
        in.nextNull();
        return null;
      }

      List<Object> list = new LinkedList<>();
      in.beginArray();

      while (in.hasNext()) {
        list.add(readValue(in, gson));
      }

      in.endArray();
      return list;
    }

    @Override
    public void write(JsonWriter out, List<?> value) throws IOException {
      out.beginArray();
      for (Object entry : value) {
        @SuppressWarnings("unchecked")
        TypeAdapter<Object> adapter = (TypeAdapter<Object>) gson.getAdapter(entry.getClass());
        adapter.write(out, entry);
      }
      out.endArray();
    }
  }
}
