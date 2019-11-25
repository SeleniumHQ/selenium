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

package org.openqa.selenium.grid.node;

import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Contents.utf8String;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.io.Zip;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Map;
import java.util.Objects;

class UploadFile implements HttpHandler {

  private final Node node;
  private final Json json;

  UploadFile(Node node, Json json) {
    this.node = Objects.requireNonNull(node);
    this.json = Objects.requireNonNull(json);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    Map<String, Object> incoming = json.toType(string(req), Json.MAP_TYPE);

    TemporaryFilesystem tempfs = TemporaryFilesystem.getDefaultTmpFS();
    File tempDir = tempfs.createTempDir("upload", "file");

    try {
      Zip.unzip((String) incoming.get("file"), tempDir);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
    // Select the first file
    File[] allFiles = tempDir.listFiles();
    if (allFiles == null) {
      throw new WebDriverException(
          String.format("Cannot access temporary directory for uploaded files %s", tempDir));
    }
    if (allFiles.length != 1) {
      throw new WebDriverException(
          String.format("Expected there to be only 1 file. There were: %s", allFiles.length));
    }

    ImmutableMap<String, Object> result = ImmutableMap.of(
        "value", allFiles[0].getAbsolutePath());

    return new HttpResponse().setContent(utf8String(json.toJson(result)));
  }
}
