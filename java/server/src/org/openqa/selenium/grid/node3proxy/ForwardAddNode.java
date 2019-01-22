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

import static org.openqa.selenium.json.Json.MAP_TYPE;

import com.google.common.collect.ImmutableMap;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.remote.RemoteNode;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class ForwardAddNode implements CommandHandler {

  private final DistributedTracer tracer;
  private final Node3Proxy proxy;
  private final Json json;
  private final HttpClient.Factory httpFactory;

  public ForwardAddNode(
      DistributedTracer tracer,
      Node3Proxy proxy,
      Json json,
      HttpClient.Factory httpFactory) {
    this.tracer = Objects.requireNonNull(tracer);
    this.proxy = Objects.requireNonNull(proxy);
    this.json = Objects.requireNonNull(json);
    this.httpFactory = Objects.requireNonNull(httpFactory);
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    Map<String, Object> raw = json.toType(req.getContentString(), MAP_TYPE);
    RegistrationRequest registrationRequest = RegistrationRequest.fromJson(raw);
    List<MutableCapabilities> capabilities = registrationRequest.getConfiguration().capabilities;

    proxy.addNode(capabilities, registrationRequest.getConfiguration().maxSession);
  }
}
