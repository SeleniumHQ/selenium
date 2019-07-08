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

import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.remote.RemoteNode;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;

import java.util.Objects;

import static org.openqa.selenium.remote.http.Contents.string;

public class AddNode implements HttpHandler {

  private final DistributedTracer tracer;
  private final Distributor distributor;
  private final Json json;
  private final HttpClient.Factory httpFactory;

  public AddNode(
      DistributedTracer tracer,
      Distributor distributor,
      Json json,
      HttpClient.Factory httpFactory) {
    this.tracer = Objects.requireNonNull(tracer);
    this.distributor = Objects.requireNonNull(distributor);
    this.json = Objects.requireNonNull(json);
    this.httpFactory = Objects.requireNonNull(httpFactory);
  }

  @Override
  public HttpResponse execute(HttpRequest req) {
    NodeStatus status = json.toType(string(req), NodeStatus.class);

    Node node = new RemoteNode(
        tracer,
        httpFactory,
        status.getNodeId(),
        status.getUri(),
        status.getStereotypes().keySet());

    distributor.add(node);

    return new HttpResponse();
  }
}
