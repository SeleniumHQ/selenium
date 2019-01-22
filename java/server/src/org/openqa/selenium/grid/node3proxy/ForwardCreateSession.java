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

package org.openqa.selenium.grid.node3proxy;

import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.util.Objects;

class ForwardCreateSession implements CommandHandler {

  private final Distributor distributor;
  private final Json json;

  public ForwardCreateSession(Distributor distributor, Json json) {
    this.distributor = Objects.requireNonNull(distributor);
    this.json = Objects.requireNonNull(json);
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    // convert new session request from v3 to v4
    // send to the distributor
    // convert response from v4 to v3
    // return it to the node
    try (Reader reader = new StringReader(req.getContentString());
         NewSessionPayload payload = NewSessionPayload.create(reader)) {
      Session session = distributor.newSession(payload);

      resp.setContent(json.toJson(ImmutableMap.of("value", session)).getBytes(UTF_8));
    }
  }
}
