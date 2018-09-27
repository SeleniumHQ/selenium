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

package org.openqa.selenium.remote.server.commandhandler;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.io.Zip;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.grid.session.ActiveSession;
import org.openqa.selenium.grid.web.CommandHandler;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.Objects;

public class UploadFile implements CommandHandler {

  private final Json json;
  private final ActiveSession session;

  public UploadFile(Json json, ActiveSession session) {
    this.json = Objects.requireNonNull(json);
    this.session = Objects.requireNonNull(session);
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    Map<String, Object> args = json.toType(req.getContentString(), Json.MAP_TYPE);
    String file = (String) args.get("file");

    File tempDir = session.getFileSystem().createTempDir("upload", "file");

    Zip.unzip(file, tempDir);
    // Select the first file
    File[] allFiles = tempDir.listFiles();

    Response response = new Response(session.getId());
    if (allFiles == null || allFiles.length != 1) {
      response.setStatus(ErrorCodes.UNHANDLED_ERROR);
      response.setValue(new WebDriverException(
          "Expected there to be only 1 file. There were: " +
          (allFiles == null ? 0 : allFiles.length)));
    } else {
      response.setStatus(ErrorCodes.SUCCESS);
      response.setValue(allFiles[0].getAbsolutePath());
    }

    session.getDownstreamDialect().getResponseCodec().encode(() -> resp, response);
  }
}
