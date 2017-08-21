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

import static com.google.common.base.Charsets.UTF_8;
import static com.google.common.net.HttpHeaders.CONTENT_LENGTH;
import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static com.google.common.net.MediaType.JSON_UTF_8;
import static org.openqa.selenium.remote.BrowserType.CHROME;
import static org.openqa.selenium.remote.BrowserType.EDGE;
import static org.openqa.selenium.remote.BrowserType.FIREFOX;
import static org.openqa.selenium.remote.BrowserType.IE;
import static org.openqa.selenium.remote.BrowserType.OPERA;
import static org.openqa.selenium.remote.BrowserType.OPERA_BLINK;
import static org.openqa.selenium.remote.BrowserType.SAFARI;
import static org.openqa.selenium.remote.CapabilityType.PROXY;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableSet;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import com.google.gson.reflect.TypeToken;
import com.google.gson.stream.JsonWriter;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.BufferedInputStream;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.logging.Logger;
import java.util.regex.Pattern;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

public class ProtocolHandshake {

  private final static Logger LOG = Logger.getLogger(ProtocolHandshake.class.getName());

  /**
   * Patterns that are acceptable to send to a w3c remote end.
   */
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

  private final static Type MAP_TYPE = new TypeToken<Map<?, ?>>(){}.getType();


  public Result createSession(HttpClient client, Command command)
    throws IOException {
    Capabilities desired = (Capabilities) command.getParameters().get("desiredCapabilities");
    desired = desired == null ? new DesiredCapabilities() : desired;
    Capabilities required = (Capabilities) command.getParameters().get("requiredCapabilities");
    required = required == null ? new DesiredCapabilities() : required;

    BeanToJsonConverter converter = new BeanToJsonConverter();
    JsonObject des = (JsonObject) converter.convertObject(desired);
    JsonObject req = (JsonObject) converter.convertObject(required);

    // We don't know how large the generated JSON is going to be. Spool it to disk, and then read
    // the file size, then stream it to the remote end. If we could be sure the remote end could
    // cope with chunked requests we'd use those. I don't think we can. *sigh*
    Path jsonFile = Files.createTempFile("new-session", ".json");

    try (
        BufferedWriter fileWriter = Files.newBufferedWriter(jsonFile, UTF_8);
        JsonWriter out = new JsonWriter(fileWriter)) {
      out.setHtmlSafe(true);
      out.setIndent("  ");
      Gson gson = new Gson();
      out.beginObject();

      streamJsonWireProtocolParameters(out, gson, des, req);

      out.name("capabilities");
      out.beginObject();
      streamGeckoDriver013Parameters(out, gson, des, req);
      streamW3CProtocolParameters(out, gson, des, req);
      out.endObject();

      out.endObject();
      out.flush();

      long size = Files.size(jsonFile);
      try (InputStream rawIn = Files.newInputStream(jsonFile);
           BufferedInputStream contentStream = new BufferedInputStream(rawIn)) {
        LOG.fine("Attempting multi-dialect session, assuming Postel's Law holds true on the remote end");
        Optional<Result> result = createSession(client, contentStream, size);

        if (result.isPresent()) {
          Result toReturn = result.get();
          LOG.info(String.format("Detected dialect: %s", toReturn.dialect));
          return toReturn;
        }
      }
    } finally {
      Files.deleteIfExists(jsonFile);
    }

    throw new SessionNotCreatedException(
      String.format(
        "Unable to create new remote session. " +
        "desired capabilities = %s, required capabilities = %s",
        desired,
        required));
  }

  private void streamJsonWireProtocolParameters(
      JsonWriter out,
      Gson gson,
      JsonObject des,
      JsonObject req) throws IOException {
    out.name("desiredCapabilities");
    gson.toJson(des, out);
    out.name("requiredCapabilities");
    gson.toJson(req, out);
  }

  private void streamW3CProtocolParameters(
      JsonWriter out,
      Gson gson,
      JsonObject des,
      JsonObject req) throws IOException {
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

    Map<String, ?> chrome = Stream.of(des, req)
        .map(JsonObject::entrySet)
        .flatMap(Collection::stream)
        .filter(entry ->
                    ("browserName".equals(entry.getKey()) && CHROME.equals(entry.getValue().getAsString())) ||
                    "chromeOptions".equals(entry.getKey()))
        .distinct()
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (left, right) -> right));

    Map<String, ?> edge = Stream.of(des, req)
        .map(JsonObject::entrySet)
        .flatMap(Collection::stream)
        .filter(entry -> ("browserName".equals(entry.getKey()) && EDGE.equals(entry.getValue().getAsString())))
        .distinct()
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (left, right) -> right));

    Map<String, ?> firefox = Stream.of(des, req)
        .map(JsonObject::entrySet)
        .flatMap(Collection::stream)
        .filter(entry ->
                    ("browserName".equals(entry.getKey()) && FIREFOX.equals(entry.getValue().getAsString())) ||
                    entry.getKey().startsWith("firefox_") ||
                    entry.getKey().startsWith("moz:"))
        .distinct()
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (left, right) -> right));

    Map<String, ?> ie = Stream.of(req, des)
        .map(JsonObject::entrySet)
        .flatMap(Collection::stream)
        .filter(entry ->
                    ("browserName".equals(entry.getKey()) && IE.equals(entry.getValue().getAsString())) ||
                    "browserAttachTimeout".equals(entry.getKey()) ||
                    "enableElementCacheCleanup".equals(entry.getKey()) ||
                    "enablePersistentHover".equals(entry.getKey()) ||
                    "extractPath".equals(entry.getKey()) ||
                    "host".equals(entry.getKey()) ||
                    "ignoreZoomSetting".equals(entry.getKey()) ||
                    "initialBrowserZoom".equals(entry.getKey()) ||
                    "logFile".equals(entry.getKey()) ||
                    "logLevel".equals(entry.getKey()) ||
                    "requireWindowFocus".equals(entry.getKey()) ||
                    "se:ieOptions".equals(entry.getKey()) ||
                    "silent".equals(entry.getKey()) ||
                    entry.getKey().startsWith("ie."))
        .distinct()
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (left, right) -> right));

    Map<String, ?> opera = Stream.of(des, req)
        .map(JsonObject::entrySet)
        .flatMap(Collection::stream)
        .filter(entry ->
                    ("browserName".equals(entry.getKey()) && OPERA_BLINK.equals(entry.getValue().getAsString())) ||
                    ("browserName".equals(entry.getKey()) && OPERA.equals(entry.getValue().getAsString())) ||
                    "operaOptions".equals(entry.getKey()))
        .distinct()
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (left, right) -> right));

    Map<String, ?> safari = Stream.of(des, req)
        .map(JsonObject::entrySet)
        .flatMap(Collection::stream)
        .filter(entry ->
                    ("browserName".equals(entry.getKey()) && SAFARI.equals(entry.getValue().getAsString())) ||
                    "safari.options".equals(entry.getKey()))
        .distinct()
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (left, right) -> right));

    Set<String> excludedKeys = Stream.of(chrome, edge, firefox, ie, opera, safari)
        .map(Map::keySet)
        .flatMap(Collection::stream)
        .distinct()
        .collect(ImmutableSet.toImmutableSet());

    JsonObject alwaysMatch = Stream.of(des, req)
        .map(JsonObject::entrySet)
        .flatMap(Collection::stream)
        .filter(entry -> !excludedKeys.contains(entry.getKey()))
        .filter(entry -> entry.getValue() != null)
        .filter(entry -> ACCEPTED_W3C_PATTERNS.test(entry.getKey()))
        .filter(entry ->
                    !("platformName".equals(entry.getKey()) &&
                    entry.getValue().isJsonPrimitive() &&
                    "ANY".equalsIgnoreCase(entry.getValue().getAsString())))
        .distinct()
        .collect(Collector.of(
            JsonObject::new,
            (obj, e) -> obj.add(e.getKey(), e.getValue()),
            (left, right) -> {
              for (Map.Entry<String, JsonElement> entry : right.entrySet()) {
                left.add(entry.getKey(), entry.getValue());
              }
              return left;
            }));

    // Now, hopefully we're left with just the browser-specific pieces. Skip the empty ones.
    JsonArray firstMatch = Stream.of(chrome, edge, firefox, ie, opera, safari)
        .map(map -> {
          JsonObject json = new JsonObject();
          for (Map.Entry<String, ?> entry : map.entrySet()) {
            if (ACCEPTED_W3C_PATTERNS.test(entry.getKey())) {
              json.add(entry.getKey(), gson.toJsonTree(entry.getValue()));
            }
          }
          return json;
        })
        .filter(obj -> !obj.entrySet().isEmpty())
        .collect(Collector.of(
            JsonArray::new,
            JsonArray::add,
            (left, right) -> {
              for (JsonElement element : right) {
                left.add(element);
              }
              return left;
            }
        ));

    // TODO(simon): transform some capabilities that changed in the spec (timeout's "pageLoad")
    Stream.concat(Stream.of(alwaysMatch), StreamSupport.stream(firstMatch.spliterator(), false))
        .map(el -> (JsonObject) el)
        .forEach(obj -> {
          if (obj.has("proxy")) {
            JsonObject proxy = obj.getAsJsonObject("proxy");
            if (proxy.has("proxyType")) {
              proxy.add(
                  "proxyType",
                  new JsonPrimitive(proxy.get("proxyType").getAsString().toLowerCase()));
            }
          }
        });

    out.name("alwaysMatch");
    gson.toJson(alwaysMatch, out);
    out.name("firstMatch");
    gson.toJson(firstMatch, out);
  }

  public Optional<Result> createSession(HttpClient client, InputStream newSessionBlob, long size)
    throws IOException {
    // Create the http request and send it
    HttpRequest request = new HttpRequest(HttpMethod.POST, "/session");

    request.setHeader(CONTENT_LENGTH, String.valueOf(size));
    request.setHeader(CONTENT_TYPE, JSON_UTF_8.toString());
    request.setContent(newSessionBlob);
    long start = System.currentTimeMillis();
    HttpResponse response = client.execute(request, true);
    long time = System.currentTimeMillis() - start;

    // Ignore the content type. It may not have been set. Strictly speaking we're not following the
    // W3C spec properly. Oh well.
    Map<?, ?> blob;
    try {
      blob = new JsonToBeanConverter().convert(Map.class, response.getContentString());
    } catch (JsonException e) {
      throw new WebDriverException(
          "Unable to parse remote response: " + response.getContentString());
    }

    InitialHandshakeResponse initialResponse = new InitialHandshakeResponse(
        time,
        response.getStatus(),
        blob);

    return Stream.of(
        new JsonWireProtocolResponse().getResponseFunction(),
        new Gecko013ProtocolResponse().getResponseFunction(),
        new W3CHandshakeResponse().getResponseFunction())
        .map(func -> func.apply(initialResponse))
        .filter(Optional::isPresent)
        .map(Optional::get)
        .findFirst();
  }

  private void streamGeckoDriver013Parameters(
      JsonWriter out,
      Gson gson,
      JsonObject des,
      JsonObject req) throws IOException {
    out.name("desiredCapabilities");
    gson.toJson(des, out);
    out.name("requiredCapabilities");
    gson.toJson(req, out);
  }

  public static class Result {
    private static Function<Object, Proxy> massageProxy = obj -> {
      if (obj instanceof Proxy) {
        return (Proxy) obj;
      }

      if (!(obj instanceof Map)) {
        return null;
      }

      Map<?, ?> rawMap = (Map<?, ?>) obj;
      for (Object key : rawMap.keySet()) {
        if (!(key instanceof String)) {
          return null;
        }
      }

      // This cast is now safe.
      //noinspection unchecked
      return new Proxy((Map<String, ?>) obj);
    };


    private final Dialect dialect;
    private final Map<String, ?> capabilities;
    private final SessionId sessionId;

    Result(Dialect dialect, String sessionId, Map<String, ?> capabilities) {
      this.dialect = dialect;
      this.sessionId = new SessionId(Preconditions.checkNotNull(sessionId));
      this.capabilities = capabilities;

      if (capabilities.containsKey(PROXY)) {
        //noinspection unchecked
        ((Map<String, Object>)capabilities).put(PROXY, massageProxy.apply(capabilities.get(PROXY)));
      }
    }

    public Dialect getDialect() {
      return dialect;
    }

    public Response createResponse() {
      Response response = new Response(sessionId);
      response.setValue(capabilities);
      response.setStatus(ErrorCodes.SUCCESS);
      response.setState(ErrorCodes.SUCCESS_STRING);
      return response;
    }

    @Override
    public String toString() {
      return String.format("%s: %s", dialect, capabilities);
    }
  }
}
