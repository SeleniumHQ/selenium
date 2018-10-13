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

package org.openqa.selenium.grid.distributor;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.util.Objects;
import java.util.function.Predicate;

class CreateSession implements Predicate<HttpRequest>, CommandHandler {

  private final Distributor distributor;
  private final Json json;

  public CreateSession(Distributor distributor, Json json) {
    this.distributor = Objects.requireNonNull(distributor);
    this.json = Objects.requireNonNull(json);
  }

  @Override
  public boolean test(HttpRequest req) {
    return req.getMethod() == POST && "/se/grid/distributor/session".equals(req.getUri());
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    try (Reader reader = new StringReader(req.getContentString());
         NewSessionPayload payload = NewSessionPayload.create(reader)) {
      Session session = distributor.newSession(payload);

      resp.setContent(json.toJson(ImmutableMap.of("value", session)).getBytes(UTF_8));
    }
  }
}
