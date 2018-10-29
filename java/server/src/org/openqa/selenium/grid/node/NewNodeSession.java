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

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.util.HashMap;
import java.util.Objects;
import java.util.function.BiConsumer;
import java.util.function.Predicate;

class NewNodeSession implements Predicate<HttpRequest>, CommandHandler {

  private final BiConsumer<HttpResponse, Object> encodeJson;
  private final Node node;
  private final Json json;

  NewNodeSession(Node node, Json json) {
    this.node = Objects.requireNonNull(node);

    this.json = Objects.requireNonNull(json);
    this.encodeJson = (res, obj) -> {
      res.setContent(json.toJson(obj).getBytes(UTF_8));
    };
  }

  @Override
  public boolean test(HttpRequest req) {
    return req.getMethod() == POST && "/se/grid/node/session".equals(req.getUri());
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    Capabilities caps = json.toType(req.getContentString(), Capabilities.class);

    Session session = node.newSession(caps).orElse(null);

    HashMap<String, Object> value = new HashMap<>();
    value.put("value", session);
    encodeJson.accept(resp, value);
  }
}
