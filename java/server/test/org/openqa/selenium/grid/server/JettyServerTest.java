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

package org.openqa.selenium.grid.server;

import com.google.common.collect.ImmutableMap;
import com.google.common.net.MediaType;
import org.junit.Test;
import org.openqa.selenium.UnableToSetCookieException;
import org.openqa.selenium.grid.config.CompoundConfig;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.web.ErrorCodec;
import org.openqa.selenium.jetty.server.JettyServer;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.net.URL;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.DELETE;
import static org.openqa.selenium.remote.http.Route.get;

public class JettyServerTest {

  private BaseServerOptions emptyOptions = new BaseServerOptions(new MapConfig(ImmutableMap.of()));

  @Test
  public void baseServerStartsAndDoesNothing() {
    Server<?> server = new JettyServer(emptyOptions, req -> new HttpResponse()).start();

    URL url = server.getUrl();
    HttpClient client = HttpClient.Factory.createDefault().createClient(url);
    HttpResponse response = client.execute(new HttpRequest(GET, "/status"));

    // Although we don't expect the server to be ready, we do expect the request to succeed.
    assertEquals(HTTP_OK, response.getStatus());

    // And we expect the content to be UTF-8 encoded JSON.
    assertEquals(MediaType.JSON_UTF_8, MediaType.parse(response.getHeader("Content-Type")));
  }

  @Test
  public void shouldAllowAHandlerToBeRegistered() {
    Server<?> server = new JettyServer(
      emptyOptions,
      get("/cheese").to(() -> req -> new HttpResponse().setContent(utf8String("cheddar"))));

    server.start();
    URL url = server.getUrl();
    HttpClient client = HttpClient.Factory.createDefault().createClient(url);
    HttpResponse response = client.execute(new HttpRequest(GET, "/cheese"));

    assertEquals("cheddar", string(response));
  }

  @Test
  public void exceptionsThrownByHandlersAreConvertedToAProperPayload() {
    Server<?> server = new JettyServer(
      emptyOptions,
      req -> {
        throw new UnableToSetCookieException("Yowza");
      });

    server.start();
    URL url = server.getUrl();
    HttpClient client = HttpClient.Factory.createDefault().createClient(url);
    HttpResponse response = client.execute(new HttpRequest(GET, "/status"));

    assertThat(response.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);

    Throwable thrown = null;
    try {
      thrown = ErrorCodec.createDefault().decode(new Json().toType(string(response), MAP_TYPE));
    } catch (IllegalArgumentException ignored) {
      fail("Apparently the command succeeded" + string(response));
    }

    assertThat(thrown).isInstanceOf(UnableToSetCookieException.class);
    assertThat(thrown.getMessage()).startsWith("Yowza");
  }

  @Test
  public void shouldDisableAllowOrigin() {
    // TODO: Server setup
    Server<?> server = new JettyServer(emptyOptions, req -> new HttpResponse()).start();

    // TODO: Client setup
    URL url = server.getUrl();
    HttpClient client = HttpClient.Factory.createDefault().createClient(url);
    HttpRequest request = new HttpRequest(DELETE, "/session");
    String exampleUrl = "http://www.example.com";
    request.setHeader("Origin", exampleUrl);
    request.setHeader("Accept", "*/*");
    HttpResponse response = client.execute(request);

    // TODO: Assertion
    assertEquals("Access-Control-Allow-Credentials should be null", null,
                 response.getHeader("Access-Control-Allow-Credentials"));

    assertEquals("Access-Control-Allow-Origin should be null",
                 null,
                 response.getHeader("Access-Control-Allow-Origin"));
  }

  @Test
  public void shouldAllowCORS() {
    // TODO: Server setup
    Config cfg = new CompoundConfig(
        new MapConfig(ImmutableMap.of("server", ImmutableMap.of("allow-cors", "true"))));
    BaseServerOptions options = new BaseServerOptions(cfg);
    assertTrue("Allow CORS should be enabled", options.getAllowCORS());
    Server<?> server = new JettyServer(options, req -> new HttpResponse()).start();

    // TODO: Client setup
    URL url = server.getUrl();
    HttpClient client = HttpClient.Factory.createDefault().createClient(url);
    HttpRequest request = new HttpRequest(DELETE, "/session");
    String exampleUrl = "http://www.example.com";
    request.setHeader("Origin", exampleUrl);
    request.setHeader("Accept", "*/*");
    HttpResponse response = client.execute(request);

    // TODO: Assertion
    assertEquals("Access-Control-Allow-Credentials should be true", "true",
                 response.getHeader("Access-Control-Allow-Credentials"));

    assertEquals("Access-Control-Allow-Origin should be equal to origin in request header",
                 exampleUrl,
                 response.getHeader("Access-Control-Allow-Origin"));
  }
}
