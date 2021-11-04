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

import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.UncheckedIOException;

import static org.openqa.selenium.remote.http.Contents.utf8String;

public class PageHandler implements HttpHandler {

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {

    int lastIndex = req.getUri().lastIndexOf('/');
    String pageNumber =
        (lastIndex == -1 ? "Unknown" : req.getUri().substring(lastIndex + 1));
    String body = String.format("<html><head><title>Page%s</title></head>" +
                               "<body>Page number <span id=\"pageNumber\">%s</span>" +
                               "<p><a href=\"../xhtmlTest.html\" target=\"_top\">top</a>" +
                               "</body></html>",
                               pageNumber, pageNumber);

    return new HttpResponse()
      .setHeader("Content-Type", "text/html")
      .setContent(utf8String(body));
  }
}
