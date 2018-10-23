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

import com.google.common.base.Strings;

import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import okhttp3.ConnectionPool;
import okhttp3.Credentials;
import okhttp3.HttpUrl;
import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import java.io.IOException;
import java.net.URL;
import java.util.Optional;

public class OkHttpClient implements HttpClient {

  private final okhttp3.OkHttpClient client;
  private final URL baseUrl;

  public OkHttpClient(okhttp3.OkHttpClient client, URL url) {
    this.client = client;
    this.baseUrl = url;
  }

  @Override
  public HttpResponse execute(HttpRequest request) throws IOException {
    Request.Builder builder = new Request.Builder();

    HttpUrl.Builder url;
    String rawUrl;
    if (request.getUri().startsWith("http:") || request.getUri().startsWith("https:")) {
      rawUrl = request.getUri();
    } else {
      rawUrl = baseUrl.toExternalForm().replaceAll("/$", "") + request.getUri();
    }

    HttpUrl parsed = HttpUrl.parse(rawUrl);
    if (parsed == null) {
      throw new IOException("Unable to parse URL: " + baseUrl.toString() + request.getUri());
    }
    url = parsed.newBuilder();

    for (String name : request.getQueryParameterNames()) {
      for (String value : request.getQueryParameters(name)) {
        url.addQueryParameter(name, value);
      }
    }

    builder.url(url.build());

    for (String name : request.getHeaderNames()) {
      for (String value : request.getHeaders(name)) {
        builder.addHeader(name, value);
      }
    }

    if (request.getHeader("User-Agent") == null) {
      builder.addHeader("User-Agent", USER_AGENT);
    }

    switch (request.getMethod()) {
      case GET:
        builder.get();
        break;

      case POST:
        String rawType = Optional.ofNullable(request.getHeader("Content-Type"))
            .orElse("application/json; charset=utf-8");
        MediaType type = MediaType.parse(rawType);
        RequestBody body = RequestBody.create(type, request.getContent());
        builder.post(body);
        break;

      case DELETE:
        builder.delete();
    }

    Response response = client.newCall(builder.build()).execute();

    HttpResponse toReturn = new HttpResponse();
    toReturn.setContent(response.body().bytes());
    toReturn.setStatus(response.code());
    response.headers().names().forEach(
        name -> response.headers(name).forEach(value -> toReturn.addHeader(name, value)));

    return toReturn;
  }

  public static class Factory implements HttpClient.Factory {

    private final ConnectionPool pool = new ConnectionPool();

    @Override
    public Builder builder() {
      return new Builder() {
        @Override
        public HttpClient createClient(URL url) {
          okhttp3.OkHttpClient.Builder client = new okhttp3.OkHttpClient.Builder()
              .connectionPool(pool)
              .followRedirects(true)
              .followSslRedirects(true)
              .proxy(proxy)
              .readTimeout(readTimeout.toMillis(), MILLISECONDS)
              .connectTimeout(connectionTimeout.toMillis(), MILLISECONDS);

          String info = url.getUserInfo();
          if (!Strings.isNullOrEmpty(info)) {
            String[] parts = info.split(":", 2);
            String user = parts[0];
            String pass = parts.length > 1 ? parts[1] : null;

            String credentials = Credentials.basic(user, pass);

            client.authenticator((route, response) -> {
              if (response.request().header("Authorization") != null) {
                return null; // Give up, we've already attempted to authenticate.
              }

              return response.request().newBuilder()
                  .header("Authorization", credentials)
                  .build();
            });
          }

          client.addNetworkInterceptor(chain -> {
            Request request = chain.request();
            Response response = chain.proceed(request);
            return response.code() == 408
                   ? response.newBuilder().code(500).message("Server-Side Timeout").build()
                   : response;
          });

          return new OkHttpClient(client.build(), url);
        }
      };
    }

    @Override
    public void cleanupIdleClients() {
      pool.evictAll();
    }
  }
}
