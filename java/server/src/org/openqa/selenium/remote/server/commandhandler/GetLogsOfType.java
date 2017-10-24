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

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.server.ActiveSession;
import org.openqa.selenium.remote.server.CommandHandler;
import org.openqa.selenium.remote.server.log.LoggingManager;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;

public class GetLogsOfType implements CommandHandler {

  private final JsonToBeanConverter toBean;
  private final ActiveSession session;

  public GetLogsOfType(JsonToBeanConverter toBean, ActiveSession session) {
    this.toBean = Objects.requireNonNull(toBean);
    this.session = Objects.requireNonNull(session);
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    String originalPayload = req.getContentString();

    Map<?, ?> args = toBean.convert(Map.class, originalPayload);
    String type = (String) args.get("type");

    if (!LogType.SERVER.equals(type)) {
      HttpRequest upReq = new HttpRequest(POST, String.format("/session/%s/log", session.getId()));
      upReq.setContent(originalPayload.getBytes(UTF_8));
      session.execute(upReq, resp);
      return;
    }

    LogEntries entries = LoggingManager.perSessionLogHandler().getSessionLog(session.getId());
    Response response = new Response(session.getId());
    response.setStatus(ErrorCodes.SUCCESS);
    response.setValue(entries);

    session.getDownstreamDialect().getResponseCodec().encode(() -> resp, response);
  }
}
