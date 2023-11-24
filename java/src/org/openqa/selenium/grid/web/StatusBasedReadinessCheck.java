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

package org.openqa.selenium.grid.web;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_NO_CONTENT;
import static java.util.logging.Level.WARNING;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import com.google.common.net.MediaType;
import java.io.UncheckedIOException;
import java.util.Map;
import java.util.logging.Logger;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

/**
 * An {@link HttpHandler} that obeys the contracted required by a Kubernetes health check, but which
 * reads a selenium `/status` endpoint.
 */
public class StatusBasedReadinessCheck implements HttpHandler {

  private static final Logger LOG = Logger.getLogger(StatusBasedReadinessCheck.class.getName());
  private static final Json JSON = new Json();
  private final HttpHandler handler;
  private final HttpMethod method;
  private final String url;

  public StatusBasedReadinessCheck(HttpHandler handler, HttpMethod method, String url) {
    this.handler = Require.nonNull("handler", handler);
    this.method = Require.nonNull("HTTP method", method);
    this.url = Require.nonNull("URL for status", url);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    try {
      HttpResponse response = handler.execute(new HttpRequest(method, url));
      Map<String, Object> valueWrapped = JSON.toType(Contents.string(response), MAP_TYPE);

      Object value = valueWrapped.get("value");
      if (value instanceof Map) {
        Object ready = ((Map<?, ?>) value).get("ready");
        if (Boolean.TRUE.equals(ready)) {
          return new HttpResponse().setStatus(HTTP_NO_CONTENT);
        }
      }

      return new HttpResponse()
          .setStatus(HTTP_INTERNAL_ERROR)
          .setHeader("Content-Type", MediaType.PLAIN_TEXT_UTF_8.toString())
          .setContent(
              Contents.utf8String("Unable to determine status of server from " + valueWrapped));
    } catch (Exception e) {
      LOG.log(WARNING, "Unable to read status", e);
      return new HttpResponse()
          .setStatus(HTTP_INTERNAL_ERROR)
          .setHeader("Content-Type", MediaType.PLAIN_TEXT_UTF_8.toString())
          .setContent(Contents.utf8String("Unable to determine status of server"));
    }
  }
}
