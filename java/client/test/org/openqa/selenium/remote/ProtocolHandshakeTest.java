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
import static java.util.Collections.EMPTY_MAP;
import static java.util.Collections.singletonList;
import static java.util.Collections.singletonMap;
import static java.util.stream.Collectors.toList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.Proxy.ProxyType.AUTODETECT;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Contents.utf8String;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.WebSocket;
import org.openqa.selenium.testing.UnitTests;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@SuppressWarnings("unchecked")
@Category(UnitTests.class)
public class ProtocolHandshakeTest {

  @Test
  public void requestShouldIncludeJsonWireProtocolCapabilities() throws IOException {
    Map<String, Object> params = singletonMap("desiredCapabilities", new ImmutableCapabilities());
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(utf8String(
        "{\"value\": {\"sessionId\": \"23456789\", \"capabilities\": {}}}"));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    Map<String, Object> json = getRequestPayloadAsMap(client);

    assertThat(json.get("desiredCapabilities")).isEqualTo(EMPTY_MAP);
  }

  @Test
  public void requestShouldIncludeSpecCompliantW3CCapabilities() throws IOException {
    Map<String, Object> params = singletonMap("desiredCapabilities", new ImmutableCapabilities());
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(utf8String(
        "{\"value\": {\"sessionId\": \"23456789\", \"capabilities\": {}}}"));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    Map<String, Object> json = getRequestPayloadAsMap(client);

    List<Map<String, Object>> caps = mergeW3C(json);

    assertThat(caps).isNotEmpty();
  }

  @Test
  public void shouldParseW3CNewSessionResponse() throws IOException {
    Map<String, Object> params = singletonMap("desiredCapabilities", new ImmutableCapabilities());
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(utf8String(
        "{\"value\": {\"sessionId\": \"23456789\", \"capabilities\": {}}}"));
    RecordingHttpClient client = new RecordingHttpClient(response);

    ProtocolHandshake.Result result = new ProtocolHandshake().createSession(client, command);
    assertThat(result.getDialect()).isEqualTo(Dialect.W3C);
  }

  @Test
  public void shouldParseWireProtocolNewSessionResponse() throws IOException {
    Map<String, Object> params = singletonMap("desiredCapabilities", new ImmutableCapabilities());
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(utf8String(
        "{\"sessionId\": \"23456789\", \"status\": 0, \"value\": {}}"));
    RecordingHttpClient client = new RecordingHttpClient(response);

    ProtocolHandshake.Result result = new ProtocolHandshake().createSession(client, command);
    assertThat(result.getDialect()).isEqualTo(Dialect.OSS);
  }

  @Test
  public void shouldNotIncludeNonProtocolExtensionKeys() throws IOException {
    Capabilities caps = new ImmutableCapabilities(
        "se:option", "cheese",
        "option", "I like sausages",
        "browserName", "amazing cake browser");

    Map<String, Object> params = singletonMap("desiredCapabilities", caps);
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(utf8String(
        "{\"sessionId\": \"23456789\", \"status\": 0, \"value\": {}}"));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    Map<String, Object> handshakeRequest = getRequestPayloadAsMap(client);

    Object rawCaps = handshakeRequest.get("capabilities");
    assertThat(rawCaps).isInstanceOf(Map.class);

    Map<?, ?> capabilities = (Map<?, ?>) rawCaps;

    assertThat(capabilities.get("alwaysMatch")).isNull();
    List<Map<?, ?>> first = (List<Map<?, ?>>) capabilities.get("firstMatch");

    // We don't care where they are, but we want to see "se:option" and not "option"
    Set<String> keys = first.stream()
        .map(Map::keySet)
        .flatMap(Collection::stream)
        .map(String::valueOf).collect(Collectors.toSet());
    assertThat(keys)
        .contains("browserName", "se:option")
        .doesNotContain("options");
  }

  @Test
  public void firstMatchSeparatesCapsForDifferentBrowsers() throws IOException {
    Capabilities caps = new ImmutableCapabilities(
        "moz:firefoxOptions", EMPTY_MAP,
        "browserName", "chrome");

    Map<String, Object> params = singletonMap("desiredCapabilities", caps);
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(utf8String(
        "{\"sessionId\": \"23456789\", \"status\": 0, \"value\": {}}"));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    Map<String, Object> handshakeRequest = getRequestPayloadAsMap(client);

    List<Map<String, Object>> capabilities = mergeW3C(handshakeRequest);

    assertThat(capabilities).contains(
        singletonMap("moz:firefoxOptions", EMPTY_MAP),
        singletonMap("browserName", "chrome"));
  }

  @Test
  public void doesNotCreateFirstMatchForNonW3CCaps() throws IOException {
    Capabilities caps = new ImmutableCapabilities(
        "cheese", EMPTY_MAP,
        "moz:firefoxOptions", EMPTY_MAP,
        "browserName", "firefox");

    Map<String, Object> params = singletonMap("desiredCapabilities", caps);
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(utf8String(
        "{\"sessionId\": \"23456789\", \"status\": 0, \"value\": {}}"));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    Map<String, Object> handshakeRequest = getRequestPayloadAsMap(client);

    List<Map<String, Object>> w3c = mergeW3C(handshakeRequest);

    assertThat(w3c).hasSize(1);
    // firstMatch should not contain an object for Chrome-specific capabilities. Because
    // "chromeOptions" is not a W3C capability name, it is stripped from any firstMatch objects.
    // The resulting empty object should be omitted from firstMatch; if it is present, then the
    // Firefox-specific capabilities might be ignored.
    assertThat(w3c.get(0))
        .containsKey("moz:firefoxOptions")
        .containsEntry("browserName", "firefox");
  }

  @Test
  public void shouldLowerCaseProxyTypeForW3CRequest() throws IOException {
    Proxy proxy = new Proxy();
    proxy.setProxyType(AUTODETECT);
    Capabilities caps = new ImmutableCapabilities(CapabilityType.PROXY, proxy);
    Map<String, Object> params = singletonMap("desiredCapabilities", caps);
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(utf8String(
        "{\"sessionId\": \"23456789\", \"status\": 0, \"value\": {}}"));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    Map<String, Object> handshakeRequest = getRequestPayloadAsMap(client);

    mergeW3C(handshakeRequest).forEach(always -> {
          Map<String, ?> seenProxy = (Map<String, ?>) always.get("proxy");
      assertThat(seenProxy.get("proxyType")).isEqualTo("autodetect");
        });

    Map<String, ?> jsonCaps = (Map<String, ?>) handshakeRequest.get("desiredCapabilities");
    Map<String, ?> seenProxy = (Map<String, ?>) jsonCaps.get("proxy");
    assertThat(seenProxy.get("proxyType")).isEqualTo("AUTODETECT");
  }

  @Test
  public void shouldNotIncludeMappingOfANYPlatform() throws IOException {
    Capabilities caps = new ImmutableCapabilities(
        "platform", "ANY",
        "platformName", "ANY",
        "browserName", "cake");

    Map<String, Object> params = singletonMap("desiredCapabilities", caps);
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(utf8String(
        "{\"sessionId\": \"23456789\", \"status\": 0, \"value\": {}}"));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    Map<String, Object> handshakeRequest = getRequestPayloadAsMap(client);

    mergeW3C(handshakeRequest)
        .forEach(capabilities -> {
          assertThat(capabilities.get("browserName")).isEqualTo("cake");
          assertThat(capabilities.get("platformName")).isNull();
          assertThat(capabilities.get("platform")).isNull();
        });
  }

  private List<Map<String, Object>> mergeW3C(Map<String, Object> caps) {
    Map<String, Object> capabilities = (Map<String, Object>) caps.get("capabilities");
    if (capabilities == null) {
      return null;
    }

    Map<String, Object> always = Optional.ofNullable(
        (Map <String, Object>) capabilities.get("alwaysMatch")).orElse(EMPTY_MAP);

    Collection<Map<String, Object>> firsts = Optional.ofNullable(
        (Collection<Map<String, Object>>) capabilities.get("firstMatch")).orElse(singletonList(EMPTY_MAP));

    List<Map<String, Object>> allCaps = firsts.stream()
        .map(first -> ImmutableMap.<String, Object>builder().putAll(always).putAll(first).build())
        .collect(toList());

    assertThat(allCaps).isNotEmpty();

    return allCaps;
  }

  private Map<String, Object> getRequestPayloadAsMap(RecordingHttpClient client) {
    return new Json().toType(client.getRequestPayload(), Map.class);
  }

  class RecordingHttpClient implements HttpClient {

    private final HttpResponse response;
    private String payload;

    RecordingHttpClient(HttpResponse response) {
      this.response = response;
    }

    @Override
    public HttpResponse execute(HttpRequest request) {
      payload = string(request);
      return response;
    }

    String getRequestPayload() {
      return payload;
    }

    @Override
    public WebSocket openSocket(HttpRequest request, WebSocket.Listener listener) {
      throw new UnsupportedOperationException("openSocket");
    }
  }
}
