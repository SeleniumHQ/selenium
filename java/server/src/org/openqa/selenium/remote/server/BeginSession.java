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

package org.openqa.selenium.remote.server;

import static com.google.common.net.HttpHeaders.CONTENT_TYPE;
import static com.google.common.net.MediaType.JAVASCRIPT_UTF_8;
import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.remote.BrowserType.CHROME;
import static org.openqa.selenium.remote.BrowserType.EDGE;
import static org.openqa.selenium.remote.BrowserType.FIREFOX;
import static org.openqa.selenium.remote.BrowserType.IE;
import static org.openqa.selenium.remote.BrowserType.SAFARI;
import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;
import static org.openqa.selenium.remote.DesiredCapabilities.chrome;
import static org.openqa.selenium.remote.DesiredCapabilities.firefox;
import static org.openqa.selenium.remote.DesiredCapabilities.htmlUnit;
import static org.openqa.selenium.remote.Dialect.OSS;
import static org.openqa.selenium.remote.Dialect.W3C;

import com.google.common.base.Charsets;
import com.google.common.cache.Cache;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.net.MediaType;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonToken;

import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.Writer;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

class BeginSession implements CommandHandler {

  private final static Logger LOG = Logger.getLogger(BeginSession.class.getName());

  private final Cache<SessionId, ActiveSession> allSessions;
  private final Map<String, SessionFactory> factories;

  public BeginSession(Cache<SessionId, ActiveSession> allSessions, DriverSessions legacySessions) {
    this.allSessions = allSessions;

    this.factories = ImmutableMap.of(
        chrome().getBrowserName(), new ServicedSession.Factory("org.openqa.selenium.chrome.ChromeDriverService"),
        firefox().getBrowserName(), new ServicedSession.Factory("org.openqa.selenium.firefox.GeckoDriverService"),
        htmlUnit().getBrowserName(), new InMemorySession.Factory(legacySessions));
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    // Copy the capabilities to disk
    Path allCaps = Files.createTempFile("selenium", ".json");

    try {
      Map<String, Object> ossKeys = new HashMap<>();
      Map<String, Object> alwaysMatch = new HashMap<>();
      List<Map<String, Object>> firstMatch = new LinkedList<>();

      readCapabilities(allCaps, req, ossKeys, alwaysMatch, firstMatch);
      List<SessionFactory> browserGenerators = determineBrowser(
          ossKeys,
          alwaysMatch,
          firstMatch);

      ImmutableSet.Builder<Dialect> downstreamDialects = ImmutableSet.builder();
      // Favour OSS for now
      if (!ossKeys.isEmpty()) {
        downstreamDialects.add(OSS);
      }
      if (!alwaysMatch.isEmpty() || !firstMatch.isEmpty()) {
        downstreamDialects.add(W3C);
      }

      ActiveSession session = browserGenerators.stream()
            .map(func -> {
              try {
                return func.apply(allCaps, downstreamDialects.build());
              } catch (Exception e) {
                LOG.log(Level.INFO, "Unable to start session.", e);
              }
              return null;
            })
            .filter(Objects::nonNull)
            .findFirst()
            .orElseThrow(() -> new SessionNotCreatedException("Unable to create a new session"));

      allSessions.put(session.getId(), session);

      Object toConvert;
      switch (session.getDownstreamDialect()) {
        case OSS:
          toConvert = ImmutableMap.of(
              "status", 0,
              "sessionId", session.getId().toString(),
              "value", session.getCapabilities());
          break;

        case W3C:
          toConvert = ImmutableMap.of(
              "value", ImmutableMap.of(
                  "sessionId", session.getId().toString(),
                  "capabilities", session.getCapabilities()));
          break;

          default:
            throw new SessionNotCreatedException(
                "Unrecognized downstream dialect: " + session.getDownstreamDialect());
      }

      byte[] payload = new BeanToJsonConverter().convert(toConvert).getBytes(UTF_8);

      resp.setStatus(HTTP_OK);
      resp.setHeader("Cache-Control", "no-cache");

      resp.setHeader("Content-Type", JAVASCRIPT_UTF_8.toString());
      resp.setHeader("Content-Length", String.valueOf(payload.length));

      resp.setContent(payload);
    } finally {
      Files.delete(allCaps);
    }
  }

  private void readCapabilities(
      Path allCaps,
      HttpRequest req,
      Map<String, Object> ossKeys,
      Map<String, Object> alwaysMatch,
      List<Map<String, Object>> firstMatch) throws IOException {

    Charset charset = Charsets.UTF_8;
    try {
      String contentType = req.getHeader(CONTENT_TYPE);
      if (contentType != null) {
        MediaType mediaType = MediaType.parse(contentType);
        charset = mediaType.charset().or(Charsets.UTF_8);
      }
    } catch (IllegalArgumentException ignored) {
      // Do nothing.
    }

    try (InputStream rawIn = new BufferedInputStream(req.consumeContentStream());
         Reader reader = new InputStreamReader(rawIn, charset);
         Writer writer = Files.newBufferedWriter(allCaps, UTF_8);
         Reader in = new TeeReader(reader, writer);
         JsonReader json = new JsonReader(in)) {
      json.beginObject();

      while (json.hasNext()) {
        String name = json.nextName();

        switch (name) {
          case "desiredCapabilities":
            if (!ossKeys.isEmpty()) {
              json.skipValue();
            } else {
              ossKeys.putAll(sparseCapabilities(json));
            }
            break;

          case "capabilities":
            json.beginObject();
            while (json.hasNext()) {
              String capabilityName = json.nextName();

              switch (capabilityName) {
                case "alwaysMatch":
                  alwaysMatch.putAll(sparseCapabilities(json));
                  break;

                case "desiredCapabilities":
                  ossKeys.putAll(sparseCapabilities(json));
                  break;

                case "firstMatch":
                  json.beginArray();
                  while (json.hasNext()) {
                    firstMatch.add(sparseCapabilities(json));
                  }
                  json.endArray();
                  break;

                default:
                  json.skipValue();
                  break;
              }
            }
            json.endObject();
            break;

          default:
            json.skipValue();
            break;
        }
      }
    }
  }

  private List<SessionFactory> determineBrowser(
      Map<String, Object> ossKeys,
      Map<String, Object> alwaysMatchKeys,
      List<Map<String, Object>> firstMatchKeys) {
    List<Map<String, Object>> allCapabilities = firstMatchKeys.stream()
        // remove null keys
        .map(caps -> ImmutableMap.<String, Object>builder().putAll(caps).putAll(alwaysMatchKeys).build())
        .collect(Collectors.toList());
    allCapabilities.add(ossKeys);

    // Can we figure out the browser from any of these?
    ImmutableList.Builder<SessionFactory> builder = ImmutableList.builder();
    for (Map<String, Object> caps : allCapabilities) {
      caps.entrySet().stream()
          .map(entry -> guessBrowserName(entry.getKey(), entry.getValue()))
          .filter(factories.keySet()::contains)
          .map(factories::get)
          .findFirst()
          .ifPresent(builder::add);
    }

    return builder.build();
  }

  private String guessBrowserName(String capabilityKey, Object value) {
    if (BROWSER_NAME.equals(capabilityKey)) {
      return (String) value;
    }
    if ("chromeOptions".equals(capabilityKey)) {
      return CHROME;
    }
    if ("edgeOptions".equals(capabilityKey)) {
      return EDGE;
    }
    if (capabilityKey.startsWith("moz:")) {
      return FIREFOX;
    }
    if (capabilityKey.startsWith("safari.")) {
      return SAFARI;
    }
    if ("se:ieOptions".equals(capabilityKey)) {
      return IE;
    }
    return null;
  }

  private Map<String, Object> sparseCapabilities(JsonReader json) throws IOException {
    Map<String, Object> caps = new HashMap<>();

    json.beginObject();

    while (json.hasNext()) {
      String key = json.nextName();

      JsonToken token = json.peek();
      switch (token) {
        case NULL:
          json.skipValue();
          break;

        case STRING:
          if (BROWSER_NAME.equals(key)) {
            caps.put(key, json.nextString());
          } else {
            caps.put(key, "");
            json.skipValue();
          }
          break;

        default:
          caps.put(key, "");
          json.skipValue();
          break;
      }
    }

    json.endObject();

    return caps;
  }

  private static class ServicedSessionFactory implements Function<Path, ActiveSession> {

    @Override
    public ActiveSession apply(Path path) {
      return null;
    }
  }
}
