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
package org.openqa.selenium.remote.internal;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static java.util.concurrent.TimeUnit.SECONDS;

import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.ProtocolException;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.Credentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.HttpClient;
import org.apache.http.client.RedirectStrategy;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.config.Registry;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.config.SocketConfig;
import org.apache.http.conn.HttpClientConnectionManager;
import org.apache.http.conn.routing.HttpRoutePlanner;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.conn.DefaultSchemePortResolver;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.impl.conn.SystemDefaultRoutePlanner;
import org.apache.http.protocol.HttpContext;

import java.io.IOException;
import java.net.ProxySelector;

public class HttpClientFactory {

  private final CloseableHttpClient httpClient;
  private static final int TIMEOUT_THREE_HOURS = (int) SECONDS.toMillis(60 * 60 * 3);
  private static final int TIMEOUT_TWO_MINUTES = (int) SECONDS.toMillis(60 * 2);
  private final HttpClientConnectionManager gridClientConnectionManager =
      getClientConnectionManager();

  public HttpClientFactory() {
    this(TIMEOUT_TWO_MINUTES, TIMEOUT_THREE_HOURS);
  }

  public HttpClientFactory(int connectionTimeout, int socketTimeout) {
    httpClient = createHttpClient(null, connectionTimeout, socketTimeout);
  }

  protected static HttpClientConnectionManager getClientConnectionManager() {
    Registry<ConnectionSocketFactory> socketFactoryRegistry = RegistryBuilder
        .<ConnectionSocketFactory>create()
        .register("http", PlainConnectionSocketFactory.getSocketFactory())
        .register("https", SSLConnectionSocketFactory.getSocketFactory())
        .build();

    PoolingHttpClientConnectionManager cm = new PoolingHttpClientConnectionManager(
        socketFactoryRegistry);
    cm.setMaxTotal(2000);
    cm.setDefaultMaxPerRoute(2000);
    return cm;
  }

  public HttpClient getHttpClient() {
    return httpClient;
  }

  public CloseableHttpClient createHttpClient(Credentials credentials) {
      return createHttpClient(credentials, TIMEOUT_TWO_MINUTES, TIMEOUT_THREE_HOURS);
  }

  public CloseableHttpClient createHttpClient(Credentials credentials, int connectionTimeout, int socketTimeout) {
    if (connectionTimeout <= 0) {
        throw new IllegalArgumentException("connection timeout must be > 0");
    }
    if (socketTimeout <= 0) {
        throw new IllegalArgumentException("socket timeout must be > 0");
    }

    SocketConfig socketConfig = createSocketConfig(socketTimeout);
    RequestConfig requestConfig = createRequestConfig(connectionTimeout, socketTimeout);

    HttpClientBuilder builder = HttpClientBuilder.create()
        .setConnectionManager(getClientConnectionManager())
        .setDefaultSocketConfig(createSocketConfig(socketTimeout))
        .setDefaultRequestConfig(createRequestConfig(connectionTimeout, socketTimeout))
        .setRoutePlanner(createRoutePlanner());

    if (credentials != null) {
      CredentialsProvider provider = new BasicCredentialsProvider();
      provider.setCredentials(AuthScope.ANY, credentials);
      builder.setDefaultCredentialsProvider(provider);
    }

    return builder.build();
  }

  public HttpClient getGridHttpClient(int connectionTimeout, int socketTimeout) {
    gridClientConnectionManager.closeIdleConnections(100, MILLISECONDS);

    SocketConfig socketConfig = createSocketConfig(socketTimeout);
    RequestConfig requestConfig = createRequestConfig(connectionTimeout, socketTimeout);

    return HttpClientBuilder.create()
        .setConnectionManager(gridClientConnectionManager)
        .setRedirectStrategy(new MyRedirectHandler())
        .setDefaultSocketConfig(socketConfig)
        .setDefaultRequestConfig(requestConfig)
        .setRoutePlanner(createRoutePlanner())
        .build();
  }

  protected SocketConfig createSocketConfig(int socketTimeout) {
    return SocketConfig.custom()
        .setSoReuseAddress(true)
        .setSoTimeout(socketTimeout)
        .build();
  }

  protected RequestConfig createRequestConfig(int connectionTimeout, int socketTimeout) {
    return RequestConfig.custom()
        .setStaleConnectionCheckEnabled(true)
        .setConnectTimeout(connectionTimeout)
        .setSocketTimeout(socketTimeout)
        .build();
  }

  protected HttpRoutePlanner createRoutePlanner() {
    return new SystemDefaultRoutePlanner(
        new DefaultSchemePortResolver(), ProxySelector.getDefault());
  }

  public void close() {
    try {
      httpClient.close();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
    gridClientConnectionManager.shutdown();
  }

  static class MyRedirectHandler implements RedirectStrategy {

    public boolean isRedirected(HttpRequest request, HttpResponse response, HttpContext context)
        throws ProtocolException {
      return false;
    }

    public HttpUriRequest getRedirect(HttpRequest request, HttpResponse response,
                                      HttpContext context) throws ProtocolException {
      return null;
    }
  }
}
