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
import static org.junit.Assert.assertEquals;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import org.junit.Test;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.util.Map;

@SuppressWarnings("unchecked")
public class ProtocolHandshakeTest {

  @Test
  public void shouldIncludeJsonWireProtocolCapabilities() throws IOException {
    Map<String, Object> params = ImmutableMap.of("desiredCapabilities", new DesiredCapabilities());
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent("{\"value\": {\"sessionId\": \"23456789\", \"value\": {}}}".getBytes(UTF_8));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    HttpRequest request = client.getRequest();
    Map<String, Object> json = new Gson()
        .fromJson(request.getContentString(), new TypeToken<Map<String, Object>>(){}.getType());

    assertEquals(ImmutableMap.of(), json.get("desiredCapabilities"));
    assertEquals(ImmutableMap.of(), json.get("requiredCapabilities"));
  }

  @Test
  public void shouldIncludeOlderGeckoDriverCapabilities() throws IOException {
    Map<String, Object> params = ImmutableMap.of("desiredCapabilities", new DesiredCapabilities());
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent("{\"value\": {\"sessionId\": \"23456789\", \"value\": {}}}".getBytes(UTF_8));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    HttpRequest request = client.getRequest();
    Map<String, Object> json = new Gson()
        .fromJson(request.getContentString(), new TypeToken<Map<String, Object>>(){}.getType());
    Map<String, Object> capabilities = (Map<String, Object>) json.get("capabilities");

    assertEquals(ImmutableMap.of(), capabilities.get("desiredCapabilities"));
    assertEquals(ImmutableMap.of(), capabilities.get("requiredCapabilities"));
  }

  @Test
  public void shouldIncludeSpecCompliantW3CCapabilities() throws IOException {
    Map<String, Object> params = ImmutableMap.of("desiredCapabilities", new DesiredCapabilities());
    Command command = new Command(null, DriverCommand.NEW_SESSION, params);

    HttpResponse response = new HttpResponse();
    response.setStatus(HTTP_OK);
    response.setContent("{\"value\": {\"sessionId\": \"23456789\", \"value\": {}}}".getBytes(UTF_8));
    RecordingHttpClient client = new RecordingHttpClient(response);

    new ProtocolHandshake().createSession(client, command);

    HttpRequest request = client.getRequest();
    Map<String, Object> json = new Gson()
        .fromJson(request.getContentString(), new TypeToken<Map<String, Object>>(){}.getType());

    assertEquals(ImmutableMap.of(), json.get("alwaysMatch"));
    assertEquals(ImmutableList.of(), json.get("firstMatch"));
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