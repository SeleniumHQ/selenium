package org.openqa.selenium.remote.internal;

import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.ProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.RedirectStrategy;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.conn.scheme.PlainSocketFactory;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.conn.ssl.SSLSocketFactory;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.tsccm.ThreadSafeClientConnManager;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.http.protocol.HttpContext;

import java.util.concurrent.TimeUnit;

import static java.util.concurrent.TimeUnit.SECONDS;

/*
Copyright 2007-2011 WebDriver committers

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
public class HttpClientFactory {

  private final DefaultHttpClient httpClient;
  private final DefaultHttpClient gridClient;
  private final int TIMEOUT_THREE_HOURS = (int) SECONDS.toMillis( 60 * 60 * 3);

  public HttpClientFactory() {
    httpClient = new DefaultHttpClient(getClientConnectionManager());
    httpClient.setParams(getHttpParams());
    gridClient = new DefaultHttpClient(getClientConnectionManager());
    gridClient.setRedirectStrategy(new MyRedirectHandler());
    gridClient.setParams(getGridHttpParams());
    gridClient.getConnectionManager().closeIdleConnections(100, TimeUnit.MILLISECONDS);
  }

  private static ClientConnectionManager getClientConnectionManager() {
    SchemeRegistry registry = new SchemeRegistry();
    registry.register(new Scheme("http", 80, PlainSocketFactory.getSocketFactory()));
    registry.register(new Scheme("https", 443, SSLSocketFactory.getSocketFactory()));
    ThreadSafeClientConnManager cm = new ThreadSafeClientConnManager(registry);
    cm.setMaxTotal(2000);
    cm.setDefaultMaxPerRoute(2000);
    return cm;
  }

  public HttpClient getHttpClient() {
    return httpClient;
  }

  public HttpClient getGridHttpClient() {
    return gridClient;
  }

  public HttpParams getHttpParams() {
    HttpParams params = new BasicHttpParams();
    HttpConnectionParams.setSoReuseaddr(params, true);
    HttpConnectionParams.setConnectionTimeout(params, 120 * 1000);
    HttpConnectionParams.setSoTimeout(params, TIMEOUT_THREE_HOURS);
    HttpConnectionParams.setStaleCheckingEnabled(params, true);
    return params;
  }

  public HttpParams getGridHttpParams(){
    final HttpParams params = getHttpParams();
    HttpConnectionParams.setSoTimeout(params, TIMEOUT_THREE_HOURS);
    HttpConnectionParams.setConnectionTimeout(params, 120 * 1000);
    return params;
  }

  public void close() {
    httpClient.getConnectionManager().shutdown();
    gridClient.getConnectionManager().shutdown();
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
