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

package org.openqa.selenium.environment.webserver;

import com.google.common.net.MediaType;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.UncheckedIOException;
import java.net.HttpURLConnection;
import java.util.Base64;

import static java.nio.charset.StandardCharsets.UTF_8;

public class BasicAuthHandler implements HttpHandler {
  private static final String CREDENTIALS = "test:test";
  private final Base64.Decoder decoder = Base64.getDecoder();

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    if (isAuthorized(req.getHeader("Authorization"))) {
      return new HttpResponse()
        .addHeader("Content-Type", MediaType.HTML_UTF_8.toString())
        .setContent(Contents.string("<h1>authorized</h1>", UTF_8));
    }

    return new HttpResponse()
      .setStatus(HttpURLConnection.HTTP_UNAUTHORIZED)
      .addHeader("WWW-Authenticate", "Basic realm=\"basic-auth-test\"");
  }

  private boolean isAuthorized(String auth) {
    if (auth != null) {
      final int index = auth.indexOf(' ') + 1;

      if (index > 0) {
        final String credentials = new String(decoder.decode(auth.substring(index)));
        return CREDENTIALS.equals(credentials);
      }
    }

    return false;
  }
}
