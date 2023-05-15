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

import java.io.IOException;
import java.io.UncheckedIOException;
import java.io.Writer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

/**
 * Simple API to create pages on server. Request format (JSON): {"content" : "... code of the
 * page..."} Response body contains the address of the created page.
 */
class CreatePageHandler implements HttpHandler {

  private final Path tempPageDir;
  private final String hostname;
  private final int port;
  private final String path;

  public CreatePageHandler(Path tempPageDir, String hostname, int port, String path) {
    this.tempPageDir = tempPageDir;
    this.hostname = hostname;
    this.port = port;
    this.path = path;
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    String content = Contents.string(req);
    Map<String, String> json = new Json().toType(content, Json.MAP_TYPE);

    try {
      Path target = Files.createTempFile(tempPageDir, "page", ".html");
      try (Writer out = Files.newBufferedWriter(target, UTF_8)) {
        out.write(json.get("content"));
      }

      return new HttpResponse()
          .setHeader("Content-Type", "text/plain")
          .setContent(
              Contents.utf8String(
                  String.format(
                      "http://%s:%d/common%s/%s", hostname, port, path, target.getFileName())));
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
