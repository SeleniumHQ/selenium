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

package org.openqa.selenium.remote.http;

import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.Proxy;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.time.Duration;
import javax.net.ssl.SSLContext;
import org.openqa.selenium.Credentials;
import org.openqa.selenium.internal.Require;

public class ClientConfig {

  private static final Filter RETRY_FILTER = new RetryRequest();
  private static final Filter DEFAULT_FILTER = new AddSeleniumUserAgent();
  private final URI baseUri;
  private final Duration connectionTimeout;
  private final Duration readTimeout;
  private final Filter filters;
  private final Proxy proxy;
  private final Credentials credentials;
  private final SSLContext sslContext;
  private final String version;

  protected ClientConfig(
      URI baseUri,
      Duration connectionTimeout,
      Duration readTimeout,
      Filter filters,
      Proxy proxy,
      Credentials credentials,
      SSLContext sslContext,
      String version) {
    this.baseUri = baseUri;
    this.connectionTimeout = Require.nonNegative("Connection timeout", connectionTimeout);
    this.readTimeout = Require.nonNegative("Read timeout", readTimeout);
    this.filters = Require.nonNull("Filters", filters);
    this.proxy = proxy;
    this.credentials = credentials;
    this.sslContext = sslContext;
    this.version = version;
  }

  public static ClientConfig defaultConfig() {
    return new ClientConfig(
        null,
        Duration.ofSeconds(
            Long.parseLong(System.getProperty("webdriver.httpclient.connectionTimeout", "10"))),
        Duration.ofSeconds(
            Long.parseLong(System.getProperty("webdriver.httpclient.readTimeout", "180"))),
        DEFAULT_FILTER,
        null,
        null,
        null,
        System.getProperty("webdriver.httpclient.version", null));
  }

  public ClientConfig baseUri(URI baseUri) {
    return new ClientConfig(
        Require.nonNull("Base URI", baseUri),
        connectionTimeout,
        readTimeout,
        filters,
        proxy,
        credentials,
        sslContext,
        version);
  }

  public ClientConfig baseUrl(URL baseUrl) {
    try {
      return baseUri(Require.nonNull("Base URL", baseUrl).toURI());
    } catch (URISyntaxException e) {
      throw new RuntimeException(e);
    }
  }

  public URI baseUri() {
    return baseUri;
  }

  public URL baseUrl() {
    try {
      return baseUri().toURL();
    } catch (MalformedURLException e) {
      throw new UncheckedIOException(e);
    }
  }

  public ClientConfig connectionTimeout(Duration timeout) {
    return new ClientConfig(
        baseUri,
        Require.nonNull("Connection timeout", timeout),
        readTimeout,
        filters,
        proxy,
        credentials,
        sslContext,
        version);
  }

  public Duration connectionTimeout() {
    return connectionTimeout;
  }

  public ClientConfig readTimeout(Duration timeout) {
    return new ClientConfig(
        baseUri,
        connectionTimeout,
        Require.nonNull("Read timeout", timeout),
        filters,
        proxy,
        credentials,
        sslContext,
        version);
  }

  public Duration readTimeout() {
    return readTimeout;
  }

  public ClientConfig withFilter(Filter filter) {
    Require.nonNull("Filter", filter);
    return new ClientConfig(
        baseUri,
        connectionTimeout,
        readTimeout,
        filter.andThen(DEFAULT_FILTER),
        proxy,
        credentials,
        sslContext,
        version);
  }

  public ClientConfig withRetries() {
    return new ClientConfig(
        baseUri,
        connectionTimeout,
        readTimeout,
        filters.andThen(RETRY_FILTER),
        proxy,
        credentials,
        sslContext,
        version);
  }

  public Filter filter() {
    return filters;
  }

  public ClientConfig proxy(Proxy proxy) {
    return new ClientConfig(
        baseUri,
        connectionTimeout,
        readTimeout,
        filters,
        Require.nonNull("Proxy", proxy),
        credentials,
        sslContext,
        version);
  }

  public Proxy proxy() {
    return proxy;
  }

  public ClientConfig authenticateAs(Credentials credentials) {
    return new ClientConfig(
        baseUri,
        connectionTimeout,
        readTimeout,
        filters,
        proxy,
        Require.nonNull("Credentials", credentials),
        sslContext,
        version);
  }

  public Credentials credentials() {
    return credentials;
  }

  public ClientConfig sslContext(SSLContext sslContext) {
    return new ClientConfig(
        baseUri,
        connectionTimeout,
        readTimeout,
        filters,
        proxy,
        credentials,
        Require.nonNull("SSL Context", sslContext),
        version);
  }

  public SSLContext sslContext() {
    return sslContext;
  }

  public ClientConfig version(String version) {
    return new ClientConfig(
        baseUri,
        connectionTimeout,
        readTimeout,
        filters,
        proxy,
        credentials,
        sslContext,
        Require.nonNull("Version", version));
  }

  public String version() {
    return version;
  }

  @Override
  public String toString() {
    return "ClientConfig{"
        + "baseUri="
        + baseUri
        + ", connectionTimeout="
        + connectionTimeout
        + ", readTimeout="
        + readTimeout
        + ", filters="
        + filters
        + ", proxy="
        + proxy
        + ", credentials="
        + credentials
        + ", sslcontext="
        + sslContext
        + ", version="
        + version
        + '}';
  }
}
