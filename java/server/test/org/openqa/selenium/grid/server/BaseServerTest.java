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

import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.grid.server.Server.get;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import com.google.common.collect.ImmutableMap;
import com.google.common.net.MediaType;

import org.assertj.core.api.Assertions;
import org.junit.Test;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.net.URL;

public class BaseServerTest {

  private BaseServerOptions emptyOptions = new BaseServerOptions(new MapConfig(ImmutableMap.of()));

  @Test
  public void baseServerStartsAndDoesNothing() throws IOException {
    Server<?> server = new BaseServer<>(emptyOptions).start();

    URL url = server.getUrl();
    HttpClient client = HttpClient.Factory.createDefault().createClient(url);
    HttpResponse response = client.execute(new HttpRequest(GET, "/status"));

    // Although we don't expect the server to be ready, we do expect the request to succeed.
    assertEquals(HTTP_OK, response.getStatus());

    // And we expect the content to be UTF-8 encoded JSON.
    assertEquals(MediaType.JSON_UTF_8, MediaType.parse(response.getHeader("Content-Type")));
  }

  @Test
  public void shouldAllowAHandlerToBeRegistered() throws IOException {
    Server<?> server = new BaseServer<>(emptyOptions);
    server.addHandler(
        get("/cheese"),
        (inj, ignored) -> (req, res) -> res.setContent("cheddar".getBytes(UTF_8)));

    server.start();
    URL url = server.getUrl();
    HttpClient client = HttpClient.Factory.createDefault().createClient(url);
    HttpResponse response = client.execute(new HttpRequest(GET, "/cheese"));

    assertEquals("cheddar", response.getContentString());
  }

  @Test
  public void ifTwoHandlersRespondToTheSameRequestTheLastOneAddedWillBeUsed() throws IOException {
    Server<?> server = new BaseServer<>(emptyOptions);
    server.addHandler(
        get("/status"),
        (inj, ignored) -> (req, res) -> res.setContent("one".getBytes(UTF_8)));
    server.addHandler(
        get("/status"),
        (inj, ignored) -> (req, res) -> res.setContent("two".getBytes(UTF_8)));

    server.start();
    URL url = server.getUrl();
    HttpClient client = HttpClient.Factory.createDefault().createClient(url);
    HttpResponse response = client.execute(new HttpRequest(GET, "/status"));

    assertEquals("two", response.getContentString());

  }

  @Test
  public void addHandlersOnceServerIsStartedIsAnError() {
    Server<BaseServer> server = new BaseServer<>(emptyOptions);
    server.start();

    Assertions.assertThatExceptionOfType(IllegalStateException.class).isThrownBy(
        () -> server.addHandler(get("/foo"), (inj, ignored) -> (req, res) -> {}));
  }

}
