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

import static java.nio.charset.StandardCharsets.UTF_16LE;
import static org.openqa.selenium.remote.http.Contents.string;

public class EncodingHandler implements HttpHandler {

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    String text = "<html><title>Character encoding (UTF 16)</title>"
      + "<body><p id='text'>"
      + "\u05E9\u05DC\u05D5\u05DD" // "Shalom"
      + "</p></body></html>";

    // Data should be transferred using UTF-8. Pick a different encoding
    return new HttpResponse()
      .setHeader("Content-Type", "text/html;charset=UTF-16LE")
      .setContent(string(text, UTF_16LE));
  }
}
