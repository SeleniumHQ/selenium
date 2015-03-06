/*
Copyright 2007-2011 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
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
  private final int TIMEOUT_THREE_HOURS = (int) SECONDS.toMillis(60 * 60 * 3);
  private final HttpClientConnectionManager gridClientConnectionManager =
      getClientConnectionManager();

  public HttpClientFactory() {
    httpClient = createHttpClient(null);
  }

  private static HttpClientConnectionManager getClientConnectionManager() {
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
    HttpClientBuilder builder = HttpClientBuilder.create()
        .setConnectionManager(getClientConnectionManager())
        .setDefaultSocketConfig(createSocketConfig())
        .setDefaultSocketConfig(createSocketConfig())
        .setRoutePlanner(createRoutePlanner())
        .setDefaultRequestConfig(createRequestConfig());

    if (credentials != null) {
      CredentialsProvider provider = new BasicCredentialsProvider();
      provider.setCredentials(AuthScope.ANY, credentials);
      builder.setDefaultCredentialsProvider(provider);
    }

    return builder.build();
  }

  public HttpClient getGridHttpClient(int connection_timeout, int socket_timeout) {
    gridClientConnectionManager.closeIdleConnections(100, MILLISECONDS);

    SocketConfig socketConfig = SocketConfig.copy(createSocketConfig())
        .setSoTimeout(socket_timeout > 0 ? socket_timeout : TIMEOUT_THREE_HOURS)
        .build();

    RequestConfig requestConfig = RequestConfig.copy(createRequestConfig())
        .setConnectTimeout(connection_timeout > 0 ? connection_timeout : 120 * 1000)
        .setSocketTimeout(socket_timeout > 0 ? socket_timeout : TIMEOUT_THREE_HOURS)
        .build();

    return HttpClientBuilder.create()
        .setConnectionManager(gridClientConnectionManager)
        .setRedirectStrategy(new MyRedirectHandler())
        .setDefaultSocketConfig(socketConfig)
        .setDefaultRequestConfig(requestConfig)
        .setRoutePlanner(createRoutePlanner())
        .build();
  }

  private SocketConfig createSocketConfig() {
    return SocketConfig.custom()
        .setSoReuseAddress(true)
        .setSoTimeout(TIMEOUT_THREE_HOURS)
        .build();
  }

  private RequestConfig createRequestConfig() {
    return RequestConfig.custom()
        .setStaleConnectionCheckEnabled(true)
        .setConnectTimeout(120 * 1000)
        .setSocketTimeout(TIMEOUT_THREE_HOURS)
        .build();
  }

  private HttpRoutePlanner createRoutePlanner() {
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
