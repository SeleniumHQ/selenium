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

package org.openqa.selenium.remote.http.netty;

import static org.asynchttpclient.Dsl.request;
import static org.openqa.selenium.remote.http.Contents.empty;
import static org.openqa.selenium.remote.http.Contents.memoize;
import static org.openqa.selenium.remote.http.netty.NettyClient.toClampedInt;

import com.google.common.base.Strings;
import java.net.InetSocketAddress;
import java.net.URI;
import org.asynchttpclient.Dsl;
import org.asynchttpclient.Realm;
import org.asynchttpclient.Request;
import org.asynchttpclient.RequestBuilder;
import org.asynchttpclient.Response;
import org.asynchttpclient.proxy.ProxyServer;
import org.openqa.selenium.Credentials;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.remote.http.AddSeleniumUserAgent;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

class NettyMessages {

  private NettyMessages() {
    // Utility classes.
  }

  protected static Request toNettyRequest(ClientConfig config, HttpRequest request) {

    URI baseUrl = config.baseUri();
    int timeout = toClampedInt(config.readTimeout().toMillis());
    Credentials credentials = config.credentials();

    String rawUrl = getRawUrl(baseUrl, request.getUri());

    RequestBuilder builder =
        request(request.getMethod().toString(), rawUrl)
            .setReadTimeout(timeout)
            .setRequestTimeout(timeout);

    for (String name : request.getQueryParameterNames()) {
      for (String value : request.getQueryParameters(name)) {
        builder.addQueryParam(name, value);
      }
    }

    // Netty tends to timeout when a GET request has a 'Content-Length' header
    if (request.getMethod().equals(HttpMethod.GET) && request.getHeader("Content-Length") != null) {
      request.removeHeader("Content-Length");
    }

    for (String name : request.getHeaderNames()) {
      for (String value : request.getHeaders(name)) {
        builder.addHeader(name, value);
      }
    }
    if (request.getHeader("User-Agent") == null) {
      builder.addHeader("User-Agent", AddSeleniumUserAgent.USER_AGENT);
    }

    Realm.Builder realmBuilder = null;
    String info = baseUrl.getUserInfo();
    if (!Strings.isNullOrEmpty(info)) {
      String[] parts = info.split(":", 2);
      String user = parts[0];
      String pass = parts.length > 1 ? parts[1] : null;
      realmBuilder = Dsl.basicAuthRealm(user, pass).setUsePreemptiveAuth(true);
      builder.setRealm(realmBuilder);
    } else if (credentials != null) {
      if (!(credentials instanceof UsernameAndPassword)) {
        throw new IllegalArgumentException("Credentials must be a user name and password");
      }
      UsernameAndPassword uap = (UsernameAndPassword) credentials;
      realmBuilder = Dsl.basicAuthRealm(uap.username(), uap.password()).setUsePreemptiveAuth(true);
      builder.setRealm(realmBuilder);
    }

    if (config.proxy() != null) {
      InetSocketAddress address = (InetSocketAddress) config.proxy().address();
      ProxyServer.Builder proxyBuilder =
          new ProxyServer.Builder(address.getHostName(), address.getPort());
      if (realmBuilder != null) {
        proxyBuilder.setRealm(realmBuilder);
      }
      builder.setProxyServer(proxyBuilder);
    }

    if (request.getMethod().equals(HttpMethod.POST)) {
      builder.setBody(request.getContent().get());
    }

    return builder.build();
  }

  public static HttpResponse toSeleniumResponse(Response response) {
    HttpResponse toReturn = new HttpResponse();

    toReturn.setStatus(response.getStatusCode());

    toReturn.setContent(
        !response.hasResponseBody() ? empty() : memoize(response::getResponseBodyAsStream));

    response
        .getHeaders()
        .names()
        .forEach(
            name -> response.getHeaders(name).forEach(value -> toReturn.addHeader(name, value)));

    return toReturn;
  }

  private static String getRawUrl(URI baseUrl, String uri) {
    String rawUrl;
    if (uri.startsWith("ws://")) {
      rawUrl = "http://" + uri.substring("ws://".length());
    } else if (uri.startsWith("wss://")) {
      rawUrl = "https://" + uri.substring("wss://".length());
    } else if (uri.startsWith("http://") || uri.startsWith("https://")) {
      rawUrl = uri;
    } else {
      String base = baseUrl.toString();
      if (base.endsWith("/")) {
        rawUrl = base.substring(0, base.length() - 1) + uri;
      } else {
        rawUrl = base + uri;
      }
    }
    return rawUrl;
  }
}
