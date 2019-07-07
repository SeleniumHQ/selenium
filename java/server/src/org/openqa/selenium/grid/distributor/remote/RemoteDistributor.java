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

package org.openqa.selenium.grid.distributor.remote;

import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;

import java.net.URL;
import java.util.Objects;
import java.util.UUID;

import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.DELETE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

public class RemoteDistributor extends Distributor {

  public static final Json JSON = new Json();
  private final HttpHandler client;

  public RemoteDistributor(DistributedTracer tracer, HttpClient.Factory factory, URL url) {
    super(tracer, factory);

    Objects.requireNonNull(factory);
    Objects.requireNonNull(url);

    this.client = factory.createClient(url);
  }

  @Override
  public CreateSessionResponse newSession(HttpRequest request)
      throws SessionNotCreatedException {
    HttpRequest upstream = new HttpRequest(POST, "/se/grid/distributor/session");
    upstream.setContent(request.getContent());

    HttpResponse response = client.execute(upstream);

    return Values.get(response, CreateSessionResponse.class);
  }

  @Override
  public RemoteDistributor add(Node node) {
    HttpRequest request = new HttpRequest(POST, "/se/grid/distributor/node");

    request.setContent(utf8String(JSON.toJson(node.getStatus())));

    HttpResponse response = client.execute(request);

    Values.get(response, Void.class);

    return this;
  }

  @Override
  public void remove(UUID nodeId) {
    Objects.requireNonNull(nodeId, "Node ID must be set");
    HttpRequest request = new HttpRequest(DELETE, "/se/grid/distributor/node/" + nodeId);

    HttpResponse response = client.execute(request);

    Values.get(response, Void.class);
  }

  @Override
  public DistributorStatus getStatus() {
    HttpRequest request = new HttpRequest(GET, "/se/grid/distributor/status");

    HttpResponse response = client.execute(request);

    return Values.get(response, DistributorStatus.class);
  }
}
