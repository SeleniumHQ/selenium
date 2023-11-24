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

package org.openqa.selenium.docker;

import static java.net.HttpURLConnection.HTTP_BAD_REQUEST;
import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assumptions.assumeThat;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Paths;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

class BootstrapTest {

  @Test
  void shouldReportDockerIsUnsupportedIfServerReturns500() {
    HttpHandler client = req -> new HttpResponse().setStatus(HTTP_INTERNAL_ERROR);

    boolean isSupported = new Docker(client).isSupported();

    assertThat(isSupported).isFalse();
  }

  @Test
  void shouldReportDockerIsUnsupportedIfServerReturns404() {
    HttpHandler client = req -> new HttpResponse().setStatus(HTTP_NOT_FOUND);

    boolean isSupported = new Docker(client).isSupported();

    assertThat(isSupported).isFalse();
  }

  @Test
  void shouldReportDockerIsUnsupportedIfRequestCausesAnIoException() {
    HttpHandler client =
        req -> {
          throw new UncheckedIOException(new IOException("Eeek!"));
        };

    boolean isSupported = new Docker(client).isSupported();

    assertThat(isSupported).isFalse();
  }

  @Test
  void shouldComplainBitterlyIfNoSupportedVersionOfDockerProtocolIsFound() {
    HttpHandler client =
        req ->
            new HttpResponse()
                .setStatus(HTTP_BAD_REQUEST)
                .setHeader("Content-Type", "application/json")
                .setContent(
                    utf8String(
                        "{\"message\":\"client version 1.50 is too new. Maximum supported API"
                            + " version is 1.41\"}"));

    boolean isSupported = new Docker(client).isSupported();

    assertThat(isSupported).isFalse();
  }

  @Test
  @Disabled("Need to check that the docker daemon is running without using our http stack")
  void shouldBeAbleToConnectToRunningDockerServer() throws URISyntaxException {
    // It's not enough for the socket to exist. We must be able to connect to it
    assumeThat(Paths.get("/var/run/docker.sock")).exists();

    HttpClient client =
        HttpClient.Factory.create("reactor")
            .createClient(
                ClientConfig.defaultConfig().baseUri(new URI("unix:///var/run/docker.sock")));
    HttpResponse res = client.execute(new HttpRequest(GET, "/version"));
    assertThat(res.getStatus()).isEqualTo(HTTP_OK);
  }
}
