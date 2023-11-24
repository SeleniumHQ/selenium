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
import static java.util.Collections.singleton;
import static java.util.Collections.singletonList;
import static java.util.Collections.singletonMap;
import static java.util.stream.Collectors.toList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Contents.utf8String;

import com.google.common.collect.ImmutableMap;
import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.WebSocket;

@SuppressWarnings("unchecked")
@Tag("UnitTests")
class ProtocolHandshakeTest {

  @Test
  void requestShouldIncludeSpecCompliantW3CCapabilities() throws IOException {
    Map<String, Object> params =
        singletonMap("capabilities", singleton(new ImmutableCapabilities()));
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(
        utf8String("{\"value\": {\"sessionId\": \"23456789\", \"capabilities\": {}}}"));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    Map<String, Object> json = getRequestPayloadAsMap(client);

    List<Map<String, Object>> caps = mergeW3C(json);

    assertThat(caps).isNotEmpty();
  }

  @Test
  void shouldParseW3CNewSessionResponse() throws IOException {
    Map<String, Object> params =
        singletonMap("capabilities", singleton(new ImmutableCapabilities()));
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(
        utf8String("{\"value\": {\"sessionId\": \"23456789\", \"capabilities\": {}}}"));
    RecordingHttpClient client = new RecordingHttpClient(response);

    ProtocolHandshake.Result result = new ProtocolHandshake().createSession(client, command);
    assertThat(result.getDialect()).isEqualTo(Dialect.W3C);
  }

  @Test
  void shouldNotIncludeNonProtocolExtensionKeys() throws IOException {
    Capabilities caps =
        new ImmutableCapabilities(
            "se:option", "cheese",
            "browserName", "amazing cake browser");

    Map<String, Object> params = singletonMap("capabilities", singleton(caps));
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent(
        utf8String("{\"value\": {\"sessionId\": \"23456789\", \"capabilities\": {}}}"));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    Map<String, Object> handshakeRequest = getRequestPayloadAsMap(client);

    Object rawCaps = handshakeRequest.get("capabilities");
    assertThat(rawCaps).isInstanceOf(Map.class);

    Map<?, ?> capabilities = (Map<?, ?>) rawCaps;

    assertThat(capabilities.get("alwaysMatch")).isNull();
    List<Map<?, ?>> first = (List<Map<?, ?>>) capabilities.get("firstMatch");

    // We don't care where they are, but we want to see "se:option" and not "option"
    Set<String> keys =
        first.stream()
            .map(Map::keySet)
            .flatMap(Collection::stream)
            .map(String::valueOf)
            .collect(Collectors.toSet());
    assertThat(keys).contains("browserName", "se:option").doesNotContain("options");
  }

  @Test
  void doesNotCreateFirstMatchForNonW3CCaps() throws IOException {
    Capabilities caps =
        new ImmutableCapabilities(
            "cheese", EMPTY_MAP,
            "moz:firefoxOptions", EMPTY_MAP,
            "browserName", "firefox");

    Map<String, Object> params = singletonMap("capabilities", singleton(caps));
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    ProtocolHandshake handshake = new ProtocolHandshake();
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> handshake.createSession(null, command));
  }

  private List<Map<String, Object>> mergeW3C(Map<String, Object> caps) {
    Map<String, Object> capabilities = (Map<String, Object>) caps.get("capabilities");
    if (capabilities == null) {
      return null;
    }

    Map<String, Object> always =
        Optional.ofNullable((Map<String, Object>) capabilities.get("alwaysMatch"))
            .orElse(EMPTY_MAP);

    Collection<Map<String, Object>> firsts =
        Optional.ofNullable((Collection<Map<String, Object>>) capabilities.get("firstMatch"))
            .orElse(singletonList(EMPTY_MAP));

    List<Map<String, Object>> allCaps =
        firsts.stream()
            .map(
                first ->
                    ImmutableMap.<String, Object>builder().putAll(always).putAll(first).build())
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
