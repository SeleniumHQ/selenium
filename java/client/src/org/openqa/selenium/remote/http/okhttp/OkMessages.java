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

package org.openqa.selenium.remote.http.okhttp;

import com.google.common.io.ByteStreams;
import okhttp3.HttpUrl;
import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.net.URI;
import java.util.Optional;

import static org.openqa.selenium.remote.http.Contents.bytes;
import static org.openqa.selenium.remote.http.Contents.empty;

class OkMessages {

  private OkMessages() {
    // Utility classes.
  }

  static Request toOkHttpRequest(URI baseUrl, HttpRequest request) {
    Request.Builder builder = new Request.Builder();

    HttpUrl.Builder url;
    String rawUrl;

    if (request.getUri().startsWith("ws://")) {
      rawUrl = "http://" + request.getUri().substring("ws://".length());
    } else if (request.getUri().startsWith("wss://")) {
      rawUrl = "https://" + request.getUri().substring("wss://".length());
    } else if (request.getUri().startsWith("http://") || request.getUri().startsWith("https://")) {
      rawUrl = request.getUri();
    } else {
      rawUrl = baseUrl.toString().replaceAll("/$", "") + request.getUri();
    }

    HttpUrl parsed = HttpUrl.parse(rawUrl);
    if (parsed == null) {
      throw new UncheckedIOException(
          new IOException("Unable to parse URL: " + baseUrl.toString() + request.getUri()));
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

    switch (request.getMethod()) {
      case GET:
        builder.get();
        break;

      case POST:
        String rawType = Optional.ofNullable(request.getHeader("Content-Type"))
            .orElse("application/json; charset=utf-8");
        MediaType type = MediaType.parse(rawType);
        RequestBody body = RequestBody.create(bytes(request.getContent()), type);
        builder.post(body);
        break;

      case DELETE:
        builder.delete();
    }
    return builder.build();
  }

  static HttpResponse toSeleniumResponse(Response response) {
    HttpResponse toReturn = new HttpResponse();

    toReturn.setStatus(response.code());

    toReturn.setContent(response.body() == null ? empty() : Contents.memoize(() -> {
      InputStream stream = response.body().byteStream();
      return new InputStream() {
        @Override
        public int read() throws IOException {
          return stream.read();
        }

        @Override
        public void close() throws IOException {
          response.close();
          super.close();
        }
      };
    }));

    response.headers().names().forEach(
        name -> response.headers(name).forEach(value -> toReturn.addHeader(name, value)));

    // We need to close the okhttp body in order to avoid leaking connections,
    // however if we do this then we can't read the contents any more. We're
    // already memoising the result, so read everything to be safe.
    try {
      ByteStreams.copy(toReturn.getContent().get(), ByteStreams.nullOutputStream());
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    } finally {
      response.close();
    }

    return toReturn;
  }
}
