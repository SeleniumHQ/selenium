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

import static java.nio.charset.StandardCharsets.UTF_8;
import static java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME;

import java.io.UncheckedIOException;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

class EchoHandler implements HttpHandler {

  private static final String EPOCH_START =
      RFC_1123_DATE_TIME.format(ZonedDateTime.ofInstant(Instant.ofEpochMilli(0), ZoneId.of("UTC")));
  private static final String RESPONSE_STRING =
      "<html><head><title>Done</title></head><body>"
          + "<h1>Method: <span id='method'>%s</span></h1>"
          + "<h1>Headers</h1><table id='headers'><tbody>%s</tbody></table>"
          + "<h1>Body:</h1><pre>%s</pre>"
          + "</body></html>";

  @Override
  public HttpResponse execute(HttpRequest request) throws UncheckedIOException {
    HttpResponse response = new HttpResponse();
    response.setHeader("Content-Type", "text/html");
    // Don't Cache Anything  at the browser
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Pragma", "no-cache");
    response.setHeader("Expires", EPOCH_START);

    String method = request.getMethod().toString();
    String headers =
        StreamSupport.stream(request.getHeaderNames().spliterator(), false)
            .flatMap(
                name ->
                    StreamSupport.stream(request.getHeaders(name).spliterator(), false)
                        .map(
                            value -> String.format("<tr><td>%s</td><td>%s</td></tr>", name, value)))
            .collect(Collectors.joining(""));
    String body = Contents.utf8String(request.getContent());

    response.setContent(
        Contents.string(String.format(RESPONSE_STRING, method, headers, body), UTF_8));

    return response;
  }
}
