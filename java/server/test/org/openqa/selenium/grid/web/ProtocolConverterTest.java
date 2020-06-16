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

package org.openqa.selenium.grid.web;


import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.net.MediaType;
import org.junit.Test;
import org.mockito.Mockito;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.codec.jwp.JsonHttpCommandCodec;
import org.openqa.selenium.remote.codec.w3c.W3CHttpCommandCodec;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.Dialect.OSS;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.remote.ErrorCodes.UNHANDLED_ERROR;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.Contents.bytes;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.POST;


public class ProtocolConverterTest {

  private final Json json = new Json();
  private final Tracer tracer = DefaultTestTracer.createTracer();

  @Test
  public void shouldRoundTripASimpleCommand() throws IOException {
    SessionId sessionId = new SessionId("1234567");

    HttpHandler handler = new ProtocolConverter(
        tracer,
        HttpClient.Factory.createDefault().createClient(new URL("http://example.com/wd/hub")),
        W3C,
        OSS) {
      @Override
      protected HttpResponse makeRequest(HttpRequest request) {
        HttpResponse response = new HttpResponse();

        response.setHeader("Content-Type", MediaType.JSON_UTF_8.toString());
        response.setHeader("Cache-Control", "none");

        Map<String, Object> obj = new HashMap<>();
        obj.put("sessionId", sessionId.toString());
        obj.put("status", 0);
        obj.put("value", null);
        String payload = json.toJson(obj);
        response.setContent(utf8String(payload));

        return response;
      }
    };

    Command command = new Command(
        sessionId,
        DriverCommand.GET,
        ImmutableMap.of("url", "http://example.com/cheese"));

    HttpRequest w3cRequest = new W3CHttpCommandCodec().encode(command);

    HttpResponse resp = handler.execute(w3cRequest);

    assertEquals(MediaType.JSON_UTF_8, MediaType.parse(resp.getHeader("Content-type")));
    assertEquals(HttpURLConnection.HTTP_OK, resp.getStatus());

    Map<String, Object> parsed = json.toType(string(resp), MAP_TYPE);
    assertNull(parsed.toString(), parsed.get("sessionId"));
    assertTrue(parsed.toString(), parsed.containsKey("value"));
    assertNull(parsed.toString(), parsed.get("value"));
  }

  @Test
  public void shouldAliasAComplexCommand() throws IOException {
    SessionId sessionId = new SessionId("1234567");

    // Downstream is JSON, upstream is W3C. This way we can force "isDisplayed" to become JS
    // execution.
    HttpHandler handler = new ProtocolConverter(
        tracer,
        HttpClient.Factory.createDefault().createClient(new URL("http://example.com/wd/hub")),
        OSS,
        W3C) {
      @Override
      protected HttpResponse makeRequest(HttpRequest request) {
        assertEquals(String.format("/session/%s/execute/sync", sessionId), request.getUri());
        Map<String, Object> params = json.toType(string(request), MAP_TYPE);

        assertEquals(
            ImmutableList.of(
                ImmutableMap.of(W3C.getEncodedElementKey(), "4567890")),
            params.get("args"));

        HttpResponse response = new HttpResponse();

        response.setHeader("Content-Type", MediaType.JSON_UTF_8.toString());
        response.setHeader("Cache-Control", "none");

        Map<String, Object> obj = ImmutableMap.of(
            "sessionId", sessionId.toString(),
            "status", 0,
            "value", true);
        String payload = json.toJson(obj);
        response.setContent(utf8String(payload));

        return response;
      }
    };

    Command command = new Command(
        sessionId,
        DriverCommand.IS_ELEMENT_DISPLAYED,
        ImmutableMap.of("id", "4567890"));

    HttpRequest w3cRequest = new JsonHttpCommandCodec().encode(command);

    HttpResponse resp = handler.execute(w3cRequest);

    assertEquals(MediaType.JSON_UTF_8, MediaType.parse(resp.getHeader("Content-type")));
    assertEquals(HttpURLConnection.HTTP_OK, resp.getStatus());

    Map<String, Object> parsed = json.toType(string(resp), MAP_TYPE);
    assertNull(parsed.get("sessionId"));
    assertTrue(parsed.containsKey("value"));
    assertEquals(true, parsed.get("value"));
  }

  @Test
  public void shouldConvertAnException() throws IOException {
    // Json upstream, w3c downstream
    SessionId sessionId = new SessionId("1234567");

    HttpHandler handler = new ProtocolConverter(
        tracer,
        HttpClient.Factory.createDefault().createClient(new URL("http://example.com/wd/hub")),
        W3C,
        OSS) {
      @Override
      protected HttpResponse makeRequest(HttpRequest request) {
        HttpResponse response = new HttpResponse();

        response.setHeader("Content-Type", MediaType.JSON_UTF_8.toString());
        response.setHeader("Cache-Control", "none");

       String payload = new Json().toJson(
           ImmutableMap.of(
               "sessionId", sessionId.toString(),
               "status", UNHANDLED_ERROR,
               "value", new WebDriverException("I love cheese and peas")));
        response.setContent(utf8String(payload));
        response.setStatus(HTTP_INTERNAL_ERROR);

        return response;
      }
    };

    Command command = new Command(
        sessionId,
        DriverCommand.GET,
        ImmutableMap.of("url", "http://example.com/cheese"));

    HttpRequest w3cRequest = new W3CHttpCommandCodec().encode(command);

    HttpResponse resp = handler.execute(w3cRequest);

    assertEquals(MediaType.JSON_UTF_8, MediaType.parse(resp.getHeader("Content-type")));
    assertEquals(HTTP_INTERNAL_ERROR, resp.getStatus());

    Map<String, Object> parsed = json.toType(string(resp), MAP_TYPE);
    assertNull(parsed.get("sessionId"));
    assertTrue(parsed.containsKey("value"));
    @SuppressWarnings("unchecked") Map<String, Object> value =
        (Map<String, Object>) parsed.get("value");
    System.out.println("value = " + value.keySet());
    assertEquals("unknown error", value.get("error"));
    assertTrue(((String) value.get("message")).startsWith("I love cheese and peas"));
  }

  @Test
  public void newJwpSessionResponseShouldBeCorrectlyConvertedToW3C() {
    Map<String, Object> jwpNewSession = ImmutableMap.of("desiredCapabilities", ImmutableMap.of("cheese", "brie"));

    Map<String, Object> w3cResponse = ImmutableMap.of(
      "value", ImmutableMap.of(
        "sessionId", "i like cheese very much",
        "capabilities", ImmutableMap.of("cheese", "brie")));

    HttpClient client = mock(HttpClient.class);
    Mockito.when(client.execute(any())).thenReturn(new HttpResponse().setContent(asJson(w3cResponse)));

    ProtocolConverter converter = new ProtocolConverter(tracer, client, OSS, W3C);

    HttpResponse response = converter.execute(new HttpRequest(POST, "/session").setContent(asJson(jwpNewSession)));

    Map<String, Object> convertedResponse = json.toType(string(response), MAP_TYPE);

    assertThat(convertedResponse.get("sessionId")).isEqualTo("i like cheese very much");
    assertThat(convertedResponse.get("status")).isEqualTo(0L);
    assertThat(convertedResponse.get("value")).isEqualTo(ImmutableMap.of("cheese", "brie"));
  }

  @Test
  public void newW3CSessionResponseShouldBeCorrectlyConvertedToJwp() {
    Map<String, Object> w3cNewSession = ImmutableMap.of(
      "capabilities", ImmutableMap.of());

    Map<String, Object> jwpResponse = ImmutableMap.of(
      "status", 0,
      "sessionId", "i like cheese very much",
      "value", ImmutableMap.of("cheese", "brie"));

    HttpClient client = mock(HttpClient.class);
    Mockito.when(client.execute(any())).thenReturn(new HttpResponse().setContent(asJson(jwpResponse)));

    ProtocolConverter converter = new ProtocolConverter(tracer, client, W3C, OSS);

    HttpResponse response = converter.execute(new HttpRequest(POST, "/session").setContent(asJson(w3cNewSession)));

    Map<String, Object> convertedResponse = json.toType(string(response), MAP_TYPE);
    Map<?, ?> value = (Map<?, ?>) convertedResponse.get("value");
    assertThat(value.get("capabilities"))
      .as("capabilities: " + convertedResponse)
      .isEqualTo(jwpResponse.get("value"));
    assertThat(value.get("sessionId"))
      .as("session id: " + convertedResponse)
      .isEqualTo(jwpResponse.get("sessionId"));
  }

  @Test
  public void newJwpSessionResponseShouldBeConvertedToW3CCorrectly() {
    Map<String, Object> w3cResponse = ImmutableMap.of(
      "value", ImmutableMap.of(
        "capabilities", ImmutableMap.of("cheese", "brie"),
        "sessionId", "i like cheese very much"));

    Map<String, Object> jwpNewSession = ImmutableMap.of(
      "desiredCapabilities", ImmutableMap.of());

    HttpClient client = mock(HttpClient.class);
    Mockito.when(client.execute(any())).thenReturn(new HttpResponse().setContent(asJson(w3cResponse)));

    ProtocolConverter converter = new ProtocolConverter(tracer, client, OSS, W3C);

    HttpResponse response = converter.execute(new HttpRequest(POST, "/session").setContent(asJson(jwpNewSession)));

    Map<String, Object> convertedResponse = json.toType(string(response), MAP_TYPE);
    assertThat(convertedResponse.get("status")).isEqualTo(0L);
    assertThat(convertedResponse.get("sessionId")).isEqualTo("i like cheese very much");
    assertThat(convertedResponse.get("value")).isEqualTo(ImmutableMap.of("cheese", "brie"));
  }

  @Test
  public void contentLengthShouldBeSetCorrectlyOnSuccessfulNewSessionRequest() {
    Map<String, Object> w3cResponse = ImmutableMap.of(
      "value", ImmutableMap.of(
        "capabilities", ImmutableMap.of("cheese", "brie"),
        "sessionId", "i like cheese very much"));
    byte[] bytes = json.toJson(w3cResponse).getBytes(UTF_8);

    HttpClient client = mock(HttpClient.class);
    Mockito.when(client.execute(any()))
      .thenReturn(
        new HttpResponse().setHeader("Content-Length", String.valueOf(bytes.length)).setContent(bytes(bytes)));

    ProtocolConverter converter = new ProtocolConverter(tracer, client, OSS, W3C);

    HttpResponse response = converter.execute(
      new HttpRequest(POST, "/session")
        .setContent(asJson(ImmutableMap.of("desiredCapabilities", ImmutableMap.of()))));

    assertThat(response.getHeader("Content-Length")).isNotEqualTo(String.valueOf(bytes.length));
  }
}
