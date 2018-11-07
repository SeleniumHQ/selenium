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

package org.openqa.selenium.grid.sessionmap;

import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.util.Objects;

class AddToSessionMap implements CommandHandler {

  private final Json json;
  private final SessionMap sessions;

  AddToSessionMap(Json json, SessionMap sessions) {
    this.json = Objects.requireNonNull(json);
    this.sessions = Objects.requireNonNull(sessions);
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) {
    Session session = json.toType(req.getContentString(), Session.class);
    Objects.requireNonNull(session, "Session to add must be set");

    sessions.add(session);

    resp.setContent(json.toJson(ImmutableMap.of("value", true)).getBytes(UTF_8));
  }
}
