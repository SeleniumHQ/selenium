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

import static com.google.common.base.Preconditions.checkNotNull;
import static org.apache.http.protocol.HttpCoreContext.HTTP_TARGET_HOST;

import org.apache.http.Header;
import org.apache.http.HeaderElement;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHost;
import org.apache.http.NoHttpResponseException;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.net.BindException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.concurrent.TimeUnit;

public class ApacheHttpClient implements org.openqa.selenium.remote.http.HttpClient {

  private static final int MAX_REDIRECTS = 10;

  private final URL url;
  private final HttpHost targetHost;
  private final HttpClient client;

  public ApacheHttpClient(HttpClient client, URL url) {
    this.client = checkNotNull(client, "null HttpClient");
    this.url = checkNotNull(url, "null URL");

    // Some machines claim "localhost.localdomain" is the same as "localhost".
    // This assumption is not always true.
    String host = url.getHost().replace(".localdomain", "");
    this.targetHost = new HttpHost(host, url.getPort(), url.getProtocol());
  }

  @Override
  public HttpResponse execute(HttpRequest request, boolean followRedirects) throws IOException {
    HttpContext context = createContext();

    String requestUrl = url.toExternalForm().replaceAll("/$", "") + request.getUri();
    HttpUriRequest httpMethod = createHttpUriRequest(request.getMethod(), requestUrl);
    for (String name : request.getHeaderNames()) {
      // Skip content length as it is implicitly set when the message entity is set below.
      if (!"Content-Length".equalsIgnoreCase(name)) {
        for (String value : request.getHeaders(name)) {
          httpMethod.addHeader(name, value);
        }
      }
    }

    if (httpMethod instanceof HttpPost) {
      ((HttpPost) httpMethod).setEntity(new ByteArrayEntity(request.getContent()));
    }

    org.apache.http.HttpResponse response = fallBackExecute(context, httpMethod);
    if (followRedirects) {
      response = followRedirects(client, context, response, /* redirect count */0);
    }
    return createResponse(response, context);
  }

  private HttpResponse createResponse(
      org.apache.http.HttpResponse response, HttpContext context) throws IOException {
    HttpResponse internalResponse = new HttpResponse();

    internalResponse.setStatus(response.getStatusLine().getStatusCode());
    for (Header header : response.getAllHeaders()) {
      for (HeaderElement headerElement : header.getElements()) {
        internalResponse.addHeader(header.getName(), headerElement.getValue());
      }
    }

    HttpEntity entity = response.getEntity();
    if (entity != null) {
      try {
        internalResponse.setContent(EntityUtils.toByteArray(entity));
      } finally {
        EntityUtils.consume(entity);
      }
    }

    Object host = context.getAttribute(HTTP_TARGET_HOST);
    if (host instanceof HttpHost) {
      internalResponse.setTargetHost(((HttpHost) host).toURI());
    }

    return internalResponse;
  }

  protected HttpContext createContext() {
    return new BasicHttpContext();
  }

  private static HttpUriRequest createHttpUriRequest(HttpMethod method, String url) {
    switch (method) {
      case DELETE:
        return new HttpDelete(url);
      case GET:
        return new HttpGet(url);
      case POST:
        return new HttpPost(url);
    }
    throw new AssertionError("Unsupported method: " + method);
  }

  private org.apache.http.HttpResponse fallBackExecute(
      HttpContext context, HttpUriRequest httpMethod) throws IOException {
    try {
      return client.execute(targetHost, httpMethod, context);
    } catch (BindException e) {
      // If we get this, there's a chance we've used all the local ephemeral sockets
      // Sleep for a bit to let the OS reclaim them, then try the request again.
      try {
        Thread.sleep(2000);
      } catch (InterruptedException ie) {
        throw new RuntimeException(ie);
      }
    } catch (NoHttpResponseException e) {
      // If we get this, there's a chance we've used all the remote ephemeral sockets
      // Sleep for a bit to let the OS reclaim them, then try the request again.
      try {
        Thread.sleep(2000);
      } catch (InterruptedException ie) {
        throw new RuntimeException(ie);
      }
    }
    return client.execute(targetHost, httpMethod, context);
  }

  private org.apache.http.HttpResponse followRedirects(
      HttpClient client,
      HttpContext context,
      org.apache.http.HttpResponse response, int redirectCount) {
    if (!isRedirect(response)) {
      return response;
    }

    try {
      // Make sure that the previous connection is freed.
      HttpEntity httpEntity = response.getEntity();
      if (httpEntity != null) {
        EntityUtils.consume(httpEntity);
      }
    } catch (IOException e) {
      throw new WebDriverException(e);
    }

    if (redirectCount > MAX_REDIRECTS) {
      throw new WebDriverException("Maximum number of redirects exceeded. Aborting");
    }

    String location = response.getFirstHeader("location").getValue();
    URI uri;
    try {
      uri = buildUri(context, location);

      HttpGet get = new HttpGet(uri);
      get.setHeader("Accept", "application/json; charset=utf-8");
      org.apache.http.HttpResponse newResponse = client.execute(targetHost, get, context);
      return followRedirects(client, context, newResponse, redirectCount + 1);
    } catch (URISyntaxException e) {
      throw new WebDriverException(e);
    } catch (ClientProtocolException e) {
      throw new WebDriverException(e);
    } catch (IOException e) {
      throw new WebDriverException(e);
    }
  }

  private URI buildUri(HttpContext context, String location) throws URISyntaxException {
    URI uri;
    uri = new URI(location);
    if (!uri.isAbsolute()) {
      HttpHost host = (HttpHost) context.getAttribute(HTTP_TARGET_HOST);
      uri = new URI(host.toURI() + location);
    }
    return uri;
  }

  private boolean isRedirect(org.apache.http.HttpResponse response) {
    int code = response.getStatusLine().getStatusCode();

    return (code == 301 || code == 302 || code == 303 || code == 307)
           && response.containsHeader("location");
  }

  public static class Factory implements org.openqa.selenium.remote.http.HttpClient.Factory {

    private static HttpClientFactory defaultClientFactory;

    private final HttpClientFactory clientFactory;

    public Factory() {
      this(getDefaultHttpClientFactory());
    }

    public Factory(HttpClientFactory clientFactory) {
      this.clientFactory = checkNotNull(clientFactory, "null HttpClientFactory");
    }

    @Override
    public org.openqa.selenium.remote.http.HttpClient createClient(URL url) {
      checkNotNull(url, "null URL");
      HttpClient client;
      if (url.getUserInfo() != null) {
        UsernamePasswordCredentials credentials =
            new UsernamePasswordCredentials(url.getUserInfo());
        client = clientFactory.createHttpClient(credentials);
      } else {
        client = clientFactory.getHttpClient();
      }
      return new ApacheHttpClient(client, url);
    }

    private static synchronized HttpClientFactory getDefaultHttpClientFactory() {
      if (defaultClientFactory == null) {
        defaultClientFactory = new HttpClientFactory();
      }
      return defaultClientFactory;
    }
  }
  
  @Override
	public void close() throws IOException {
	  client.getConnectionManager().closeIdleConnections(0, TimeUnit.SECONDS);		
	}
  
}
