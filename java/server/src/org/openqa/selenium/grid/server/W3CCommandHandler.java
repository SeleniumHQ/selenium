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

package org.openqa.selenium.grid.server;

import static com.google.common.net.MediaType.JSON_UTF_8;
import static org.openqa.selenium.remote.http.Contents.utf8String;

import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.ErrorCodec;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.util.Objects;

public class W3CCommandHandler implements CommandHandler {

  public static final Json JSON = new Json();
  private final ErrorCodec errors = ErrorCodec.createDefault();
  private final CommandHandler delegate;

  public W3CCommandHandler(CommandHandler delegate) {
    this.delegate = Objects.requireNonNull(delegate);
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) {
    // Assume we're executing a normal W3C WebDriver request
    resp.setHeader("Content-Type", JSON_UTF_8.toString());
    resp.setHeader("Cache-Control", "none");

    try {
      delegate.execute(req, resp);
    } catch (Throwable cause) {
      resp.setStatus(errors.getHttpStatusCode(cause));

      resp.setHeader("Content-Type", JSON_UTF_8.toString());
      resp.setHeader("Cache-Control", "none");

      resp.setContent(utf8String(JSON.toJson(errors.encode(cause))));
    }
  }
}
