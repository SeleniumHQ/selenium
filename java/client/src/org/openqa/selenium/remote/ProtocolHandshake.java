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
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.CapabilityType.PROXY;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSortedMap;
import com.google.common.collect.Ordering;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
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

import java.io.BufferedInputStream;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Queue;
import java.util.ServiceLoader;
import java.util.Set;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.logging.Logger;
import java.util.stream.Stream;

public class ProtocolHandshake {

  private final static Logger LOG = Logger.getLogger(ProtocolHandshake.class.getName());

  private final Set<CapabilitiesFilter> adapters;
  private final Set<CapabilityTransform> transforms;

  public ProtocolHandshake() {
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

  public Result createSession(HttpClient client, Command command)
    throws IOException {
    Capabilities desired = (Capabilities) command.getParameters().get("desiredCapabilities");
    desired = desired == null ? new ImmutableCapabilities() : desired;

    @SuppressWarnings("unchecked") Map<String, Object> des = (Map<String, Object>) desired.asMap();

    // We don't know how large the generated JSON is going to be. Spool it to disk, and then read
    // the file size, then stream it to the remote end. If we could be sure the remote end could
    // cope with chunked requests we'd use those. I don't think we can. *sigh*
    Path jsonFile = Files.createTempFile("new-session", ".json");

    try (
        BufferedWriter fileWriter = Files.newBufferedWriter(jsonFile, UTF_8);
        JsonOutput out = new Json().newOutput(fileWriter)) {
      out.beginObject();

      streamJsonWireProtocolParameters(out, des);

      out.name("capabilities");
      out.beginObject();
      streamGeckoDriver013Parameters(out, des);
      streamW3CProtocolParameters(out, des);
      out.endObject();

      out.endObject();
      out.close();

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
        "desired capabilities = %s",
        desired));
  }

  private void streamJsonWireProtocolParameters(
      JsonOutput out,
      Map<String, Object> des) throws IOException {
    out.name("desiredCapabilities");
    out.write(des, MAP_TYPE);
  }

  private void streamW3CProtocolParameters(
      JsonOutput out,
      Map<String, Object> des) throws IOException {
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
        .peek(entry -> System.out.println(String.format("%s -> %s", entry.getKey(), entry.getValue())))
        .collect(ImmutableSortedMap.toImmutableSortedMap(
            Ordering.natural(),
            Map.Entry::getKey,
            Map.Entry::getValue));

    out.name("alwaysMatch");
    out.write(alwaysMatch, MAP_TYPE);
    out.name("firstMatch");
    out.write(firstMatch, Collection.class);
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
      JsonOutput out,
      Map<String, Object> des) throws IOException {
    out.name("desiredCapabilities");
    out.write(des, MAP_TYPE);
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
