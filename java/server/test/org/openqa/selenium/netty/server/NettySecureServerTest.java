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

package org.openqa.selenium.netty.server;

import static java.net.http.HttpRequest.newBuilder;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;
import static org.openqa.selenium.remote.http.Contents.utf8String;

import com.google.common.collect.ImmutableMap;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicInteger;

import javax.net.ssl.SSLContext;
import javax.net.ssl.X509TrustManager;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.net.PortProber;

public class NettySecureServerTest {

  private static final String STREAM_ID_HEADER = "x-http2-stream-id";

  @Before
  public void setup() {
    // Disabling host name verification. This is purely for testing purposes.
    System.setProperty("jdk.internal.httpclient.disableHostnameVerification", "true");
  }

  @Test
  public void ensureHttp2ResponseIsReceived()
      throws URISyntaxException, IOException, InterruptedException {
    AtomicInteger count = new AtomicInteger(0);

    Server<?> server = getNettyServer(count).start();

    HttpRequest request = newBuilder()
        .uri(new URI(server.getUrl().toURI().toString()))
        .GET()
        .build();

    HttpClient client = HttpClient
        .newBuilder()
        .sslContext(getSslContext())
        .version(HttpClient.Version.HTTP_2)
        .build();

    HttpResponse<String> response = client.send(request, BodyHandlers.ofString());

    assertThat(count.get()).isEqualTo(1);
    assertThat(response.version()).isEqualTo(HttpClient.Version.HTTP_2);
  }

  @Test
  public void ensureHttp1ResponseIsReceived()
      throws URISyntaxException, IOException, InterruptedException {
    AtomicInteger count = new AtomicInteger(0);

    Server<?> server = getNettyServer(count).start();

    HttpRequest request = newBuilder()
        .uri(new URI(server.getUrl().toURI().toString()))
        .GET()
        .build();

    HttpClient client = HttpClient
        .newBuilder()
        .sslContext(getSslContext())
        .version(HttpClient.Version.HTTP_1_1)
        .build();

    HttpResponse<String> response = client.send(request, BodyHandlers.ofString());

    assertThat(count.get()).isEqualTo(1);
    assertThat(response.version()).isEqualTo(HttpClient.Version.HTTP_1_1);
  }

  @Test
  public void shouldBeAbleToHandleMultipleStreams()
      throws URISyntaxException, InterruptedException, IOException {
    AtomicInteger count = new AtomicInteger(0);

    Server<?> server = new NettyServer(
        new BaseServerOptions(
            new MapConfig(
                ImmutableMap.of("server", ImmutableMap.of("port", PortProber.findFreePort(),
                                                          "https-self-signed", true)))),
        req -> {
          count.incrementAndGet();
          return new org.openqa.selenium.remote.http.HttpResponse()
              .setContent(utf8String("Stream Id is " + req.getHeader(STREAM_ID_HEADER)));
        }).start();

    HttpRequest request = newBuilder()
        .uri(new URI(server.getUrl().toURI().toString()))
        .version(HttpClient.Version.HTTP_2)
        .GET()
        .build();

    HttpClient client = HttpClient
        .newBuilder()
        .sslContext(getSslContext())
        .version(HttpClient.Version.HTTP_2)
        .build();

    HttpResponse<String> firstResponse = client.send(request, BodyHandlers.ofString());
    HttpResponse<String> secondResponse = client.send(request, BodyHandlers.ofString());

    String firstString = firstResponse.body();
    String secondString = secondResponse.body();

    assertThat(count.get()).isEqualTo(2);
    assertThat(firstString.equals(secondString)).isFalse();

  }

  @Test
  public void shouldBeAbleToHandleMultipleAsyncRequests() throws URISyntaxException {
    AtomicInteger count = new AtomicInteger(0);

    Server<?> server = getNettyServer(count).start();

    HttpRequest request = newBuilder()
        .uri(new URI(server.getUrl().toURI().toString()))
        .GET()
        .build();

    HttpClient client = HttpClient
        .newBuilder()
        .sslContext(getSslContext())
        .version(HttpClient.Version.HTTP_2)
        .build();

    CompletableFuture<HttpResponse<String>> firstFuture =
        client.sendAsync(request, HttpResponse.BodyHandlers.ofString());
    CompletableFuture<HttpResponse<String>> secondFuture =
        client.sendAsync(request, HttpResponse.BodyHandlers.ofString());

    try {
      HttpResponse<String> firstResponse = firstFuture.get(30, TimeUnit.SECONDS);
      HttpResponse<String> secondResponse = secondFuture.get(30, TimeUnit.SECONDS);

      String firstString = firstResponse.body();
      String secondString = secondResponse.body();

      assertThat(count.get()).isEqualTo(2);
      assertThat(firstString.equals(secondString)).isFalse();

    } catch (InterruptedException | ExecutionException | TimeoutException e) {
      fail(e.getMessage());
    }
  }

  private SSLContext getSslContext() {
    try {
      SSLContext context = SSLContext.getInstance("TLS");

      X509TrustManager trustManager = new X509TrustManager() {
        // No-op implementation of the TrustManager to allow self-signed certificate for testing.
        public void checkClientTrusted(X509Certificate[] chain, String authType)
            throws CertificateException {
        }

        public void checkServerTrusted(X509Certificate[] chain, String authType)
            throws CertificateException {
        }

        public X509Certificate[] getAcceptedIssuers() {
          return new X509Certificate[0];
        }
      };

      context.init(null, new X509TrustManager[]{trustManager}, new SecureRandom());
      return context;
    } catch (NoSuchAlgorithmException | KeyManagementException e) {
      e.printStackTrace();
    }
    return null;
  }

  private NettyServer getNettyServer(AtomicInteger count) {
    return new NettyServer(
        new BaseServerOptions(
            new MapConfig(
                ImmutableMap.of("server", ImmutableMap.of("port", PortProber.findFreePort(),
                                                          "https-self-signed", true)))),
        req -> {
          return new org.openqa.selenium.remote.http.HttpResponse()
              .setContent(utf8String("Count is " + count.incrementAndGet()));
        }
    );
  }

}

