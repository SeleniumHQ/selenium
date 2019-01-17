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

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.util.Objects;

class StatusHandler implements CommandHandler {

  private final Distributor distributor;
  private final Json json;

  public StatusHandler(Distributor distributor, Json json) {
    this.distributor = Objects.requireNonNull(distributor);
    this.json = Objects.requireNonNull(json);
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    DistributorStatus status = distributor.getStatus();

    ImmutableMap<String, Object> report = ImmutableMap.of(
        "value", ImmutableMap.of(
            "ready", status.hasCapacity(),
            "message", status.hasCapacity() ? "Ready" : "No free slots available",
            "node", status));

    resp.setContent(json.toJson(report).getBytes(UTF_8));
  }
}
