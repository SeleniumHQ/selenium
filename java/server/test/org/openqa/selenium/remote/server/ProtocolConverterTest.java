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


import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.remote.ErrorCodes.UNHANDLED_ERROR;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.net.MediaType;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;

import org.junit.Test;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.JsonHttpCommandCodec;
import org.openqa.selenium.remote.http.JsonHttpResponseCodec;
import org.openqa.selenium.remote.http.W3CHttpCommandCodec;
import org.openqa.selenium.remote.http.W3CHttpResponseCodec;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

public class ProtocolConverterTest {

  private final static TypeToken<Map<String, Object>> MAP_TYPE = new TypeToken<Map<String, Object>>() {};
  private final static Gson gson = new GsonBuilder().serializeNulls().create();

  @Test
  public void shouldRoundTripASimpleCommand() throws IOException {
    SessionId sessionId = new SessionId("1234567");

    SessionCodec handler = new ProtocolConverter(
        new URL("http://example.com/wd/hub"),
        new W3CHttpCommandCodec(),
        new W3CHttpResponseCodec(),
        new JsonHttpCommandCodec(),
        new JsonHttpResponseCodec()) {
      @Override
      protected HttpResponse makeRequest(HttpRequest request) throws IOException {
        HttpResponse response = new HttpResponse();

        response.setHeader("Content-Type", MediaType.JSON_UTF_8.toString());
        response.setHeader("Cache-Control", "none");

        JsonObject obj = new JsonObject();
        obj.addProperty("sessionId", sessionId.toString());
        obj.addProperty("status", 0);
        obj.add("value", JsonNull.INSTANCE);
        String payload = gson.toJson(obj);
        response.setContent(payload.getBytes(UTF_8));

        return response;
      }
    };

    Command command = new Command(
        sessionId,
        DriverCommand.GET,
        ImmutableMap.of("url", "http://example.com/cheese"));

    HttpRequest w3cRequest = new W3CHttpCommandCodec().encode(command);

    HttpResponse resp = new HttpResponse();
    handler.handle(w3cRequest, resp);

    assertEquals(MediaType.JSON_UTF_8, MediaType.parse(resp.getHeader("Content-type")));
    assertEquals(HttpURLConnection.HTTP_OK, resp.getStatus());

    Map<String, Object> parsed = new Gson().fromJson(resp.getContentString(), MAP_TYPE.getType());
    assertNull(parsed.toString(), parsed.get("sessionId"));
    assertTrue(parsed.toString(), parsed.containsKey("value"));
    assertNull(parsed.toString(), parsed.get("value"));
  }

  @Test
  public void shouldAliasAComplexCommand() throws IOException {
    SessionId sessionId = new SessionId("1234567");

    // Downstream is JSON, upstream is W3C. This way we can force "isDisplayed" to become JS
    // execution.
    SessionCodec handler = new ProtocolConverter(
        new URL("http://example.com/wd/hub"),
        new JsonHttpCommandCodec(),
        new JsonHttpResponseCodec(),
        new W3CHttpCommandCodec(),
        new W3CHttpResponseCodec()) {
      @Override
      protected HttpResponse makeRequest(HttpRequest request) throws IOException {
        assertEquals(String.format("/session/%s/execute/sync", sessionId), request.getUri());
        Map<String, Object> params = gson.fromJson(request.getContentString(), MAP_TYPE.getType());

        assertEquals(
            ImmutableList.of(
                ImmutableMap.of(W3C.getEncodedElementKey(), "4567890")),
            params.get("args"));

        HttpResponse response = new HttpResponse();

        response.setHeader("Content-Type", MediaType.JSON_UTF_8.toString());
        response.setHeader("Cache-Control", "none");

        JsonObject obj = new JsonObject();
        obj.addProperty("sessionId", sessionId.toString());
        obj.addProperty("status", 0);
        obj.addProperty("value", true);
        String payload = gson.toJson(obj);
        response.setContent(payload.getBytes(UTF_8));

        return response;
      }
    };

    Command command = new Command(
        sessionId,
        DriverCommand.IS_ELEMENT_DISPLAYED,
        ImmutableMap.of("id", "4567890"));

    HttpRequest w3cRequest = new JsonHttpCommandCodec().encode(command);

    HttpResponse resp = new HttpResponse();
    handler.handle(w3cRequest, resp);

    assertEquals(MediaType.JSON_UTF_8, MediaType.parse(resp.getHeader("Content-type")));
    assertEquals(HttpURLConnection.HTTP_OK, resp.getStatus());

    Map<String, Object> parsed = new Gson().fromJson(resp.getContentString(), MAP_TYPE.getType());
    assertNull(parsed.get("sessionId"));
    assertTrue(parsed.containsKey("value"));
    assertEquals(true, parsed.get("value"));
  }

  @Test
  public void shouldConvertAnException() throws IOException {
    // Json upstream, w3c downstream
    SessionId sessionId = new SessionId("1234567");

    SessionCodec handler = new ProtocolConverter(
        new URL("http://example.com/wd/hub"),
        new W3CHttpCommandCodec(),
        new W3CHttpResponseCodec(),
        new JsonHttpCommandCodec(),
        new JsonHttpResponseCodec()) {
      @Override
      protected HttpResponse makeRequest(HttpRequest request) throws IOException {
        HttpResponse response = new HttpResponse();

        response.setHeader("Content-Type", MediaType.JSON_UTF_8.toString());
        response.setHeader("Cache-Control", "none");

       String payload = new BeanToJsonConverter().convert(
           ImmutableMap.of(
               "sessionId", sessionId.toString(),
               "status", UNHANDLED_ERROR,
               "value", new WebDriverException("I love cheese and peas")));
        response.setContent(payload.getBytes(UTF_8));
        response.setStatus(HTTP_INTERNAL_ERROR);

        return response;
      }
    };

    Command command = new Command(
        sessionId,
        DriverCommand.GET,
        ImmutableMap.of("url", "http://example.com/cheese"));

    HttpRequest w3cRequest = new W3CHttpCommandCodec().encode(command);

    HttpResponse resp = new HttpResponse();
    handler.handle(w3cRequest, resp);

    assertEquals(MediaType.JSON_UTF_8, MediaType.parse(resp.getHeader("Content-type")));
    assertEquals(HTTP_INTERNAL_ERROR, resp.getStatus());

    Map<String, Object> parsed = new Gson().fromJson(resp.getContentString(), MAP_TYPE.getType());
    assertNull(parsed.get("sessionId"));
    assertTrue(parsed.containsKey("value"));
    @SuppressWarnings("unchecked") Map<String, Object> value =
        (Map<String, Object>) parsed.get("value");
    System.out.println("value = " + value.keySet());
    assertEquals("unknown error", value.get("error"));
    assertTrue(((String) value.get("message")).startsWith("I love cheese and peas"));
  }

}
