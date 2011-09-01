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
  private final DefaultHttpClient nonRedirecting;

  public HttpClientFactory() {
    httpClient = new DefaultHttpClient(getClientConnectionManager());
    httpClient.setParams(getHttpParams());
    nonRedirecting = new DefaultHttpClient(getClientConnectionManager());
    nonRedirecting.setRedirectStrategy(new MyRedirectHandler());
    nonRedirecting.setParams(getHttpParams());
  }

  private static ClientConnectionManager getClientConnectionManager() {
    SchemeRegistry registry = new SchemeRegistry();
    registry.register(new Scheme("http", 80, PlainSocketFactory.getSocketFactory()));
    registry.register(new Scheme("https", 443, SSLSocketFactory.getSocketFactory()));
    ThreadSafeClientConnManager cm = new ThreadSafeClientConnManager(registry);
    cm.setMaxTotal(200);
    cm.setDefaultMaxPerRoute(200);
    return cm;
  }

  public HttpClient getHttpClient() {
    return httpClient;
  }

  public HttpClient getNonRedirectingHttpClient() {
    return nonRedirecting;
  }

  public HttpParams getHttpParams() {
    HttpParams params = new BasicHttpParams();
    HttpConnectionParams.setSoReuseaddr(params, true);
    return params;
  }

  public void close() {
    httpClient.getConnectionManager().shutdown();
    nonRedirecting.getConnectionManager().shutdown();
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
