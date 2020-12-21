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

import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static java.nio.charset.StandardCharsets.UTF_8;

public class Utf8Handler implements HttpHandler {

  private final Path webSrc;
  private final String stripPrefix;

  public Utf8Handler(Path webSrc, String stripPrefix) {
    this.webSrc = webSrc;
    this.stripPrefix = stripPrefix;
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {


    try {
      String fileName = req.getUri();
      if (fileName.startsWith(stripPrefix)) {
        fileName = fileName.substring(stripPrefix.length());
      }

      Path target = webSrc.resolve(fileName);

      return new HttpResponse()
        .setHeader("Content-Type", "text/html; charset=UTF-8")
        .setContent(Contents.utf8String(new String(Files.readAllBytes(target), UTF_8)));
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
