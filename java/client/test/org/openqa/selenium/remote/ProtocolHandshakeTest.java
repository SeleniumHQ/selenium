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

import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasEntry;
import static org.hamcrest.Matchers.hasKey;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.Proxy.ProxyType.AUTODETECT;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@SuppressWarnings("unchecked")
@RunWith(JUnit4.class)
public class ProtocolHandshakeTest {

  @Test
  public void requestShouldIncludeJsonWireProtocolCapabilities() throws IOException {
    Map<String, Object> params = ImmutableMap.of("desiredCapabilities", new ImmutableCapabilities());
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(
        "{\"value\": {\"sessionId\": \"23456789\", \"capabilities\": {}}}".getBytes(UTF_8));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    HttpRequest request = client.getRequest();
    Map<String, Object> json = new Gson()
        .fromJson(request.getContentString(), new TypeToken<Map<String, Object>>(){}.getType());

    assertEquals(ImmutableMap.of(), json.get("desiredCapabilities"));
  }

  @Test
  public void requestShouldIncludeOlderGeckoDriverCapabilities() throws IOException {
    Map<String, Object> params = ImmutableMap.of("desiredCapabilities", new ImmutableCapabilities());
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(
        "{\"value\": {\"sessionId\": \"23456789\", \"capabilities\": {}}}".getBytes(UTF_8));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    HttpRequest request = client.getRequest();
    Map<String, Object> json = new Gson()
        .fromJson(request.getContentString(), new TypeToken<Map<String, Object>>(){}.getType());
    Map<String, Object> capabilities = (Map<String, Object>) json.get("capabilities");

    assertEquals(ImmutableMap.of(), capabilities.get("desiredCapabilities"));
  }

  @Test
  public void requestShouldIncludeSpecCompliantW3CCapabilities() throws IOException {
    Map<String, Object> params = ImmutableMap.of("desiredCapabilities", new ImmutableCapabilities());
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(
        "{\"value\": {\"sessionId\": \"23456789\", \"capabilities\": {}}}".getBytes(UTF_8));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    HttpRequest request = client.getRequest();
    Map<String, Object> json = new Gson()
        .fromJson(request.getContentString(), new TypeToken<Map<String, Object>>(){}.getType());
    Map<String, Object> caps = (Map<String, Object>) json.get("capabilities");

    assertEquals(ImmutableMap.of(), caps.get("alwaysMatch"));
    assertEquals(ImmutableList.of(), caps.get("firstMatch"));
  }

  @Test
  public void shouldParseW3CNewSessionResponse() throws IOException {
    Map<String, Object> params = ImmutableMap.of("desiredCapabilities", new ImmutableCapabilities());
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(
        "{\"value\": {\"sessionId\": \"23456789\", \"capabilities\": {}}}".getBytes(UTF_8));
    RecordingHttpClient client = new RecordingHttpClient(response);

    ProtocolHandshake.Result result = new ProtocolHandshake().createSession(client, command);
    assertEquals(result.getDialect(), Dialect.W3C);
  }

  @Test
  public void shouldParseOlderW3CNewSessionResponse() throws IOException {
    Map<String, Object> params = ImmutableMap.of("desiredCapabilities", new ImmutableCapabilities());
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    // Some drivers (e.g., GeckoDriver 0.15.0) return the capabilities in a key named "value",
    // rather than "capabilities"; essentially this is the old Wire Protocol format, wrapped in a
    // "value" key.
    response.setContent(
        "{\"value\": {\"sessionId\": \"23456789\", \"value\": {}}}".getBytes(UTF_8));
    RecordingHttpClient client = new RecordingHttpClient(response);

    ProtocolHandshake.Result result = new ProtocolHandshake().createSession(client, command);
    assertEquals(result.getDialect(), Dialect.W3C);
  }

  @Test
  public void shouldParseWireProtocolNewSessionResponse() throws IOException {
    Map<String, Object> params = ImmutableMap.of("desiredCapabilities", new ImmutableCapabilities());
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(
        "{\"sessionId\": \"23456789\", \"status\": 0, \"value\": {}}".getBytes(UTF_8));
    RecordingHttpClient client = new RecordingHttpClient(response);

    ProtocolHandshake.Result result = new ProtocolHandshake().createSession(client, command);
    assertEquals(result.getDialect(), Dialect.OSS);
  }

  @Test
  public void shouldAddBothGeckoDriverAndW3CCapabilitiesToRootCapabilitiesProperty()
      throws IOException {
    Map<String, Object> params = ImmutableMap.of("desiredCapabilities", new ImmutableCapabilities());
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(
        "{\"sessionId\": \"23456789\", \"status\": 0, \"value\": {}}".getBytes(UTF_8));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    HttpRequest request = client.getRequest();
    Map<String, Object> handshakeRequest = new Gson().fromJson(
        request.getContentString(),
        new TypeToken<Map<String, Object>>() {}.getType());

    Object rawCaps = handshakeRequest.get("capabilities");
    assertTrue(rawCaps instanceof Map);

    Map<?, ?> capabilities = (Map<?, ?>) rawCaps;

    // GeckoDriver
    assertTrue(capabilities.containsKey("desiredCapabilities"));

    // W3C
    assertTrue(capabilities.containsKey("alwaysMatch"));
    assertTrue(capabilities.containsKey("firstMatch"));
  }

  @Test
  public void shouldNotIncludeNonProtocolExtensionKeys() throws IOException {
    Capabilities caps = new ImmutableCapabilities(
        "se:option", "cheese",
        "option", "I like sausages",
        "browserName", "amazing cake browser");

    Map<String, Object> params = ImmutableMap.of("desiredCapabilities", caps);
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(
        "{\"sessionId\": \"23456789\", \"status\": 0, \"value\": {}}".getBytes(UTF_8));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    HttpRequest request = client.getRequest();
    Map<String, Object> handshakeRequest = new Gson().fromJson(
        request.getContentString(),
        new TypeToken<Map<String, Object>>() {}.getType());

    Object rawCaps = handshakeRequest.get("capabilities");
    assertTrue(rawCaps instanceof Map);

    Map<?, ?> capabilities = (Map<?, ?>) rawCaps;

    Map<String, ?> always = (Map<String, ?>) capabilities.get("alwaysMatch");
    List<Map<?, ?>> first = (List<Map<?, ?>>) capabilities.get("firstMatch");

    // We don't care where they are, but we want to see "se:option" and not "option"
    Set<String> keys = new HashSet<>(always.keySet());
    keys.addAll(first.stream()
                    .map(Map::keySet)
                    .flatMap(Collection::stream)
                    .map(String::valueOf)
                    .collect(Collectors.toSet()));
    assertTrue(keys.contains("browserName"));
    assertTrue(keys.contains("se:option"));
    assertFalse(keys.contains("options"));
  }

  @Test
  public void firstMatchSeparatesCapsForDifferentBrowsers() throws IOException {
    Capabilities caps = new ImmutableCapabilities(
        "moz:firefoxOptions", ImmutableMap.of(),
        "browserName", "chrome");

    Map<String, Object> params = ImmutableMap.of("desiredCapabilities", caps);
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(
        "{\"sessionId\": \"23456789\", \"status\": 0, \"value\": {}}".getBytes(UTF_8));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    HttpRequest request = client.getRequest();
    Map<String, Object> handshakeRequest = new Gson().fromJson(
        request.getContentString(),
        new TypeToken<Map<String, Object>>() {}.getType());

    Object rawCaps = handshakeRequest.get("capabilities");
    assertTrue(rawCaps instanceof Map);

    Map<?, ?> capabilities = (Map<?, ?>) rawCaps;

    Map<String, ?> always = (Map<String, ?>) capabilities.get("alwaysMatch");
    List<Map<?, ?>> first = (List<Map<?, ?>>) capabilities.get("firstMatch");

    assertTrue(always.isEmpty());
    assertThat(first, containsInAnyOrder(
        hasKey("moz:firefoxOptions"),
        hasEntry("browserName", "chrome")));
  }

  @Test
  public void doesNotCreateFirstMatchForNonW3CCaps() throws IOException {
    Capabilities caps = new ImmutableCapabilities(
        "chromeOptions", ImmutableMap.of(),
        "moz:firefoxOptions", ImmutableMap.of(),
        "browserName", "firefox");

    Map<String, Object> params = ImmutableMap.of("desiredCapabilities", caps);
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(
        "{\"sessionId\": \"23456789\", \"status\": 0, \"value\": {}}".getBytes(UTF_8));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    HttpRequest request = client.getRequest();
    Map<String, Object> handshakeRequest = new Gson().fromJson(
        request.getContentString(),
        new TypeToken<Map<String, Object>>() {}.getType());

    Object rawCaps = handshakeRequest.get("capabilities");
    assertTrue(rawCaps instanceof Map);

    Map<?, ?> capabilities = (Map<?, ?>) rawCaps;

    Map<String, ?> always = (Map<String, ?>) capabilities.get("alwaysMatch");
    List<Map<?, ?>> first = (List<Map<?, ?>>) capabilities.get("firstMatch");

    assertTrue(always.isEmpty());
    // firstMatch should not contain an object for Chrome-specific capabilities. Because
    // "chromeOptions" is not a W3C capability name, it is stripped from any firstMatch objects.
    // The resulting empty object should be omitted from firstMatch; if it is present, then the
    // Firefox-specific capabilities might be ignored.
    assertThat(first, contains(
        allOf(hasKey("moz:firefoxOptions"), hasEntry("browserName", "firefox"))));
  }

  @Test
  public void shouldLowerCaseProxyTypeForW3CRequest() throws IOException {
    Proxy proxy = new Proxy();
    proxy.setProxyType(AUTODETECT);
    Capabilities caps = new ImmutableCapabilities(CapabilityType.PROXY, proxy);
    Map<String, Object> params = ImmutableMap.of("desiredCapabilities", caps);
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(
        "{\"sessionId\": \"23456789\", \"status\": 0, \"value\": {}}".getBytes(UTF_8));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    HttpRequest request = client.getRequest();
    Map<String, Object> handshakeRequest = new Gson().fromJson(
        request.getContentString(),
        new TypeToken<Map<String, Object>>() {}.getType());

    Object rawCaps = handshakeRequest.get("capabilities");
    assertTrue(rawCaps instanceof Map);

    Map<?, ?> capabilities = (Map<?, ?>) rawCaps;

    Map<String, ?> always = (Map<String, ?>) capabilities.get("alwaysMatch");
    Map<String, ?> seenProxy = (Map<String, ?>) always.get("proxy");
    assertEquals("autodetect", seenProxy.get("proxyType"));

    Map<String, ?> jsonCaps = (Map<String, ?>) capabilities.get("desiredCapabilities");
    seenProxy = (Map<String, ?>) jsonCaps.get("proxy");
    assertEquals("AUTODETECT", seenProxy.get("proxyType"));
  }

  @Test
  public void shouldNotIncludeMappingOfANYPlatform() throws IOException {
    Capabilities caps = new ImmutableCapabilities(
        "platform", "ANY",
        "platformName", "ANY",
        "browserName", "cake");

    Map<String, Object> params = ImmutableMap.of("desiredCapabilities", caps);
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(
        "{\"sessionId\": \"23456789\", \"status\": 0, \"value\": {}}".getBytes(UTF_8));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    HttpRequest request = client.getRequest();
    Map<String, Object> handshakeRequest = new Gson().fromJson(
        request.getContentString(),
        new TypeToken<Map<String, Object>>() {}.getType());

    Object rawCaps = handshakeRequest.get("capabilities");
    assertTrue(rawCaps instanceof Map);

    Map<?, ?> capabilities = (Map<?, ?>) rawCaps;

    Map<String, ?> always = (Map<String, ?>) capabilities.get("alwaysMatch");
    assertEquals("cake", always.get("browserName"));
    assertNull(capabilities.toString(), always.get("platformName"));
    assertNull(capabilities.toString(), always.get("platform"));
  }

  class RecordingHttpClient implements HttpClient {

    private final HttpResponse response;
    private HttpRequest request;

    public RecordingHttpClient(HttpResponse response) {
      this.response = response;
    }

    @Override
    public HttpResponse execute(HttpRequest request, boolean followRedirects) throws IOException {
      this.request = request;
      request.getContentString();
      return response;
    }

    @Override
    public void close() throws IOException {
      // Does nothing
    }

    public HttpRequest getRequest() {
      return request;
    }
  }
}
