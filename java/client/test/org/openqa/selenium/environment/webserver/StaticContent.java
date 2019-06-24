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

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.function.Function;

import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static org.openqa.selenium.remote.http.Contents.utf8String;

public class StaticContent implements HttpHandler {

  private final List<Function<String, Path>> transforms;

  public StaticContent(Function<String, Path>... transforms) {
    this.transforms = Arrays.asList(transforms);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    Path dest = transforms.stream()
        .map(transform -> transform.apply(req.getUri()))
        .peek(System.out::println)
        .filter(Files::exists)
        .findFirst()
        .orElse(null);

    if (dest == null) {
      return new HttpResponse()
          .setStatus(HTTP_NOT_FOUND)
          .setContent(utf8String(String.format("Cannot find %s", req.getUri())));
    }

    if (Files.isDirectory(dest)) {
      Path index = dest.resolve("index.html");
      if (Files.exists(index)) {
        dest = index;
      } else {
        StringBuilder content = new StringBuilder();

        HttpResponse res = new HttpResponse();
        res.setStatus(200);
        res.setHeader("Content-Type", "text/html");
        try {
          Files.walk(dest, 0).forEach(
              path -> {
                content.append("<p><a href=\"")
                    .append(String.format("%s/%s", req.getUri(), path.getFileName()))
                    .append("\">")
                    .append(path.getFileName())
                    .append("</a>");
              }
          );

          res.setContent(utf8String(content.toString()));
          return res;
        } catch (IOException e) {
          throw new UncheckedIOException(e);
        }
      }
    }

    String type = "text/html";
    if (req.getUri().endsWith(".html")) {
      type = "text/html";
    } else if (req.getUri().endsWith(".css")) {
      type = "text/css";
    } else if (req.getUri().endsWith(".js")) {
      type = "application/javascript";
    } else if (req.getUri().endsWith("appcache")) {
      type = "text/cache-manifest";
    }

    HttpResponse res = new HttpResponse();
    res.setHeader("Content-Type", type);
    Path finalDest = dest;
    res.setContent(() -> {
      try {
        return Files.newInputStream(finalDest);
      } catch (IOException e) {
        throw new UncheckedIOException(e);
      }
    });

    return res;
  }
}
