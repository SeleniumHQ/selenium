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

import static java.nio.charset.StandardCharsets.UTF_8;

import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class JreHttpClient implements HttpClient {

  private final URL url;
  private final String auth;

  private JreHttpClient(URL url) {
    if (!url.getProtocol().toLowerCase().startsWith("http")) {
      throw new IllegalArgumentException("Base URL must be an http URL: " + url);
    }
    this.url = url;

    String authority = url.getUserInfo();
    if (authority == null || "".equals(authority)) {
      auth = null;
    } else {
      auth = "Basic " + Base64.getEncoder().encodeToString(url.getUserInfo().getBytes(UTF_8));
    }
  }

  @Override
  public HttpResponse execute(HttpRequest request, boolean followRedirects) throws IOException {
    URL url = new URL(this.url.toString() + request.getUri());

    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
    try {
      connection.setInstanceFollowRedirects(followRedirects);
      if (auth != null) {
        connection.setRequestProperty("Authorization", auth);
      }
      for (String name : request.getHeaderNames()) {
        for (String value : request.getHeaders(name)) {
          connection.addRequestProperty(name, value);
        }
      }
      connection.setRequestProperty("Content-length", String.valueOf(request.getContent().length));
      connection.setRequestMethod(request.getMethod().toString());
      connection.setDoInput(true);

      if (request.getMethod() == HttpMethod.POST) {
        connection.setDoOutput(true);
        try (OutputStream os = connection.getOutputStream()) {
          os.write(request.getContent());
        }
      }

      HttpResponse response = new HttpResponse();
      response.setStatus(connection.getResponseCode());

      for (Map.Entry<String, List<String>> entry : connection.getHeaderFields().entrySet()) {
        // HttpURLConnection stores headers in a HashMap. The order they come back is basically
        // random.
        for (String value : entry.getValue()) {
          response.addHeader(entry.getKey(), value);
        }
      }

      InputStream is = connection.getErrorStream();
      if (is == null) {
        is = connection.getInputStream();
      }
      try (ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
        int count;
        byte[] data = new byte[1024];
        while ((count = is.read(data, 0, data.length)) != -1) {
          bos.write(data, 0, count);
        }
        bos.flush();
        response.setContent(bos.toByteArray());
      } finally {
        is.close();
      }

      return response;
    } finally {
      connection.disconnect();
    }
  }

  @Override
  public void close() throws IOException {

  }

  public static class Factory implements HttpClient.Factory {

    @Override
    public HttpClient createClient(URL url) {
      return new JreHttpClient(Objects.requireNonNull(url, "Base URL must be set"));
    }
  }
}
