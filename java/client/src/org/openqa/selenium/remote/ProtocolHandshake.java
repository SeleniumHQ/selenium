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

import com.google.common.base.Preconditions;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.logging.Logger;
import java.util.stream.Stream;

public class ProtocolHandshake {

  private final static Logger LOG = Logger.getLogger(ProtocolHandshake.class.getName());

  public Result createSession(HttpClient client, Command command)
    throws IOException {
    // Avoid serialising the capabilities too many times. Things like profiles are expensive.

    Capabilities desired = (Capabilities) command.getParameters().get("desiredCapabilities");
    desired = desired == null ? new DesiredCapabilities() : desired;
    Capabilities required = (Capabilities) command.getParameters().get("requiredCapabilities");
    required = required == null ? new DesiredCapabilities() : required;

    String des = new BeanToJsonConverter().convert(desired);
    String req = new BeanToJsonConverter().convert(required);

    // Assume the remote end obeys the robustness principle.
    StringBuilder parameters = new StringBuilder("{");
    amendW3cParameters(parameters, desired, required);
    parameters.append(",");
    amendGeckoDriver013Parameters(parameters, des, req);
    parameters.append(",");
    amendOssParameters(parameters, des, req);
    parameters.append("}");
    LOG.fine("Attempting multi-dialect session, assuming Postel's Law holds true on the remote end");
    Optional<Result> result = createSession(client, parameters);

    if (result.isPresent()) {
      Result toReturn = result.get();
      LOG.info(String.format("Detected dialect: %s", toReturn.dialect));
      return toReturn;
    }

    throw new SessionNotCreatedException(
      String.format(
        "Unable to create new remote session. " +
        "desired capabilities = %s, required capabilities = %s",
        desired,
        required));
  }

  private void amendW3cParameters(
      StringBuilder parameters,
      Capabilities desired,
      Capabilities required) {
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

    Map<String, ?> req = required.asMap();
    Map<String, ?> des = desired.asMap();

    Map<String, ?> chrome = Stream.of(req, des)
        .map(Map::entrySet)
        .flatMap(Collection::stream)
        .filter(entry ->
                    ("browserName".equals(entry.getKey()) && CHROME.equals(entry.getValue())) ||
                    "chromeOptions".equals(entry.getKey()))
        .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));

    Map<String, ?> edge = Stream.of(req, des)
        .map(Map::entrySet)
        .flatMap(Collection::stream)
        .filter(entry -> ("browserName".equals(entry.getKey()) && EDGE.equals(entry.getValue())))
        .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));

    Map<String, ?> firefox = Stream.of(req, des)
        .map(Map::entrySet)
        .flatMap(Collection::stream)
        .filter(entry ->
                    ("browserName".equals(entry.getKey()) && FIREFOX.equals(entry.getValue())) ||
                    "firefox_binary".equals(entry.getKey()) ||
                    "firefox_profile".equals(entry.getKey()) ||
                    entry.getKey().startsWith("moz:"))
        .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));

    Map<String, ?> ie = Stream.of(req, des)
        .map(Map::entrySet)
        .flatMap(Collection::stream)
        .filter(entry ->
                    ("browserName".equals(entry.getKey()) && IE.equals(entry.getValue())) ||
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
                    "silent".equals(entry.getKey()) ||
                    entry.getKey().startsWith("ie."))
        .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));

    Map<String, ?> opera = Stream.of(req, des)
        .map(Map::entrySet)
        .flatMap(Collection::stream)
        .filter(entry ->
                    ("browserName".equals(entry.getKey()) && OPERA_BLINK.equals(entry.getValue())) ||
                    ("browserName".equals(entry.getKey()) && OPERA.equals(entry.getValue())) ||
                    "operaOptions".equals(entry.getKey()))
        .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));

    Map<String, ?> safari = Stream.of(req, des)
        .map(Map::entrySet)
        .flatMap(Collection::stream)
        .filter(entry ->
                    ("browserName".equals(entry.getKey()) && SAFARI.equals(entry.getValue())) ||
                    "safari.options".equals(entry.getKey()))
        .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));

    Set<String> excludedKeys = Stream.of(chrome, edge, firefox, ie, opera, safari)
        .map(Map::keySet)
        .flatMap(Collection::stream)
        .collect(ImmutableSet.toImmutableSet());

    Map<String, ?> alwaysMatch = Stream.of(des, req)
        .map(Map::entrySet)
        .flatMap(Collection::stream)
        .filter(entry -> !excludedKeys.contains(entry.getKey()))
        .filter(entry -> entry.getValue() != null)
        .filter(entry -> !"marionette".equals(entry.getKey()))  // We never want to send this
        .distinct()
        .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));

    // Now, hopefully we're left with just the browser-specific pieces. Skip the empty ones.
    List<Map<String, ?>> firstMatch = Stream.of(chrome, edge, firefox, ie, opera, safari)
        .filter(map -> !map.isEmpty())
        .collect(ImmutableList.toImmutableList());

    BeanToJsonConverter converter = new BeanToJsonConverter();
    parameters.append("\"alwaysMatch\": ").append(converter.convert(alwaysMatch)).append(",");
    parameters.append("\"firstMatch\": ").append(converter.convert(firstMatch));
  }

  private Optional<Result> createSession(HttpClient client, StringBuilder params)
    throws IOException {
    // Create the http request and send it
    HttpRequest request = new HttpRequest(HttpMethod.POST, "/session");
    String content = params.toString();
    byte[] data = content.getBytes(UTF_8);

    request.setHeader(CONTENT_LENGTH, String.valueOf(data.length));
    request.setHeader(CONTENT_TYPE, JSON_UTF_8.toString());
    request.setContent(data);
    HttpResponse response = client.execute(request, true);

    Map<?, ?> jsonBlob = null;
    String resultString = response.getContentString();
    try {
      jsonBlob = new JsonToBeanConverter().convert(Map.class, resultString);
    } catch (ClassCastException e) {
      LOG.info("Unable to parse response from server: " + resultString);
      return Optional.empty();
    } catch (JsonException e) {
      // Fine. Handle that below
    }

    if (jsonBlob == null) {
      jsonBlob = new HashMap<>();
    }

    // If the result looks positive, return the result.
    Object sessionId = jsonBlob.get("sessionId");
    Object value = jsonBlob.get("value");
    Object w3cError = jsonBlob.get("error");
    Object ossStatus = jsonBlob.get("status");
    Map<String, ?> capabilities = null;

    // The old geckodriver prior to 0.14 returned "value" as the thing containing the session id.
    // Later versions follow the (amended) w3c spec and return the capabilities in a field called
    // "value"
    if (value != null && value instanceof Map) {
      Map<?, ?> mappedValue = (Map<?, ?>) value;
      if (mappedValue.containsKey("value") && mappedValue.containsKey("sessionId")) {
        value = mappedValue.get("value");
        sessionId = mappedValue.get("sessionId");
      }
    }

    if (value != null && value instanceof Map) {
      capabilities = (Map<String, ?>) value;
    } else if (value != null && value instanceof Capabilities) {
      capabilities = ((Capabilities) capabilities).asMap();
    }

    if (response.getStatus() == HttpURLConnection.HTTP_OK) {
      if (sessionId != null && capabilities != null) {
        Dialect dialect = ossStatus == null ? Dialect.W3C : Dialect.OSS;
        return Optional.of(
          new Result(dialect, String.valueOf(sessionId), capabilities));
      }
    }

    // If the result was an error that we believe has to do with the remote end failing to start the
    // session, create an exception and throw it.
    Response tempResponse = null;
    if ("session not created".equals(w3cError)) {
      tempResponse = new Response(null);
      tempResponse.setStatus(ErrorCodes.SESSION_NOT_CREATED);
      tempResponse.setValue(jsonBlob);
    } else if (
      ossStatus instanceof Number &&
      ((Number) ossStatus).intValue() == ErrorCodes.SESSION_NOT_CREATED) {
      tempResponse = new Response(null);
      tempResponse.setStatus(ErrorCodes.SESSION_NOT_CREATED);
      tempResponse.setValue(jsonBlob);
    }

    if (tempResponse != null) {
      new ErrorHandler().throwIfResponseFailed(tempResponse, 0);
    }

    // Otherwise, just return empty.
    return Optional.empty();
  }

  private void amendGeckoDriver013Parameters(
    StringBuilder params,
    String desired,
    String required) {
    params.append("\"capabilities\": {");
    params.append("\"desiredCapabilities\": ").append(desired);
    params.append(",");
    params.append("\"requiredCapabilities\": ").append(required);
    params.append("}");
  }

  private void amendOssParameters(
    StringBuilder params,
    String desired,
    String required) {
    params.append("\"desiredCapabilities\": ").append(desired);
    params.append(",");
    params.append("\"requiredCapabilities\": ").append(required);
  }


  public class Result {
    private final Dialect dialect;
    private final Map<String, ?> capabilities;
    private final SessionId sessionId;

    private Result(Dialect dialect, String sessionId, Map<String, ?> capabilities) {
      this.dialect = dialect;
      this.sessionId = new SessionId(Preconditions.checkNotNull(sessionId));
      this.capabilities = capabilities;
    }

    public Dialect getDialect() {
      return dialect;
    }

    public Response createResponse() {
      Response response = new Response(sessionId);
      response.setValue(capabilities);
      response.setStatus(ErrorCodes.SUCCESS);
      return response;
    }

    @Override
    public String toString() {
      return String.format("%s: %s", dialect, capabilities);
    }
  }
}
