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

import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static java.nio.charset.StandardCharsets.UTF_8;

import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Function;

public class StaticContent implements BiConsumer<HttpRequest, HttpResponse> {

  private final List<Function<String, Path>> transforms;

  public StaticContent(Function<String, Path>... transforms) {
    this.transforms = Arrays.asList(transforms);
  }

  @Override
  public void accept(HttpRequest request, HttpResponse response) {
    Path dest = transforms.stream()
        .map(transform -> transform.apply(request.getUri()))
        .filter(Files::exists)
        .findFirst()
        .orElse(null);

    if (dest == null) {
      response.setStatus(HTTP_NOT_FOUND);
      response.setContent(String.format("Cannot find %s", request.getUri()).getBytes(UTF_8));
      return;
    }

    if (Files.isDirectory(dest)) {
      Path index = dest.resolve("index.html");
      if (Files.exists(index)) {
        dest = index;
      } else {
        StringBuilder content = new StringBuilder();

        response.setStatus(200);
        response.setHeader("Content-Type", "text/html");
        try {
          Files.walk(dest, 0).forEach(
              path -> {
                content.append("<p><a href=\"").append(String.format("%s/%s", request.getUri(), path.getFileName())).append("\">")
                    .append(path.getFileName())
                    .append("</a>");
              }
          );

          response.setContent(content.toString().getBytes(UTF_8));
          return;
        } catch (IOException e) {
          throw new UncheckedIOException(e);
        }
      }
    }

    String type = "text/html";
    if (request.getUri().endsWith(".html")) {
      type = "text/html";
    } else if (request.getUri().endsWith(".css")) {
      type = "text/css";
    } else if (request.getUri().endsWith(".js")) {
      type = "application/javascript";
    } else if (request.getUri().endsWith("appcache")) {
      type = "text/cache-manifest";
    }

    response.setHeader("Content-Type", type);
    try {
      response.setContent(Files.readAllBytes(dest));
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
