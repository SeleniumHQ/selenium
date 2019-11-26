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

import org.openqa.selenium.grid.session.ActiveSession;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.server.log.LoggingManager;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Map;
import java.util.Objects;

import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

public class GetLogsOfType implements HttpHandler {

  private final Json json;
  private final ActiveSession session;

  public GetLogsOfType(Json json, ActiveSession session) {
    this.json = Objects.requireNonNull(json);
    this.session = Objects.requireNonNull(session);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    String originalPayload = string(req);

    Map<String, Object> args = json.toType(originalPayload, Json.MAP_TYPE);
    String type = (String) args.get("type");

    if (!LogType.SERVER.equals(type)) {
      HttpRequest upReq = new HttpRequest(POST, String.format("/session/%s/log", session.getId()));
      upReq.setContent(utf8String(originalPayload));
      return session.execute(upReq);
    }

    LogEntries entries = null;
    try {
      entries = LoggingManager.perSessionLogHandler().getSessionLog(session.getId());
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
    Response response = new Response(session.getId());
    response.setStatus(ErrorCodes.SUCCESS);
    response.setValue(entries);

    HttpResponse resp = new HttpResponse();
    session.getDownstreamDialect().getResponseCodec().encode(() -> resp, response);

    return resp;
  }
}
