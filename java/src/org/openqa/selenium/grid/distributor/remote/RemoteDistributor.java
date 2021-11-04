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
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.security.AddSecretFilter;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.HttpTracing;
import org.openqa.selenium.remote.tracing.Tracer;

import java.net.URL;
import java.util.logging.Logger;

import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.HttpMethod.DELETE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

public class RemoteDistributor extends Distributor {

  private static final Logger LOG = Logger.getLogger("Selenium Distributor (Remote)");
  private final HttpHandler client;
  private final Filter addSecret;

  public RemoteDistributor(Tracer tracer, HttpClient.Factory factory, URL url, Secret registrationSecret) {
    super(tracer, factory, registrationSecret);
    this.client = factory.createClient(url);

    this.addSecret = new AddSecretFilter(registrationSecret);
  }

  @Override
  public boolean isReady() {
    try {
      return client.execute(new HttpRequest(GET, "/readyz")).isSuccessful();
    } catch (Exception e) {
      return false;
    }
  }

  @Override
  public RemoteDistributor add(Node node) {
    HttpRequest request = new HttpRequest(POST, "/se/grid/distributor/node");
    HttpTracing.inject(tracer, tracer.getCurrentContext(), request);
    request.setContent(asJson(node.getStatus()));

    HttpResponse response = client.with(addSecret).execute(request);

    Values.get(response, Void.class);

    LOG.info(String.format("Added node %s.", node.getId()));

    return this;
  }

  @Override
  public boolean drain(NodeId nodeId) {
    Require.nonNull("Node ID", nodeId);
    HttpRequest request = new HttpRequest(POST, "/se/grid/distributor/node/" + nodeId + "/drain");
    HttpTracing.inject(tracer, tracer.getCurrentContext(), request);
    request.setContent(asJson(nodeId));

    HttpResponse response = client.with(addSecret).execute(request);

    return Values.get(response, Boolean.class);
  }

  @Override
  public void remove(NodeId nodeId) {
    Require.nonNull("Node ID", nodeId);
    HttpRequest request = new HttpRequest(DELETE, "/se/grid/distributor/node/" + nodeId);
    HttpTracing.inject(tracer, tracer.getCurrentContext(), request);

    HttpResponse response = client.with(addSecret).execute(request);

    Values.get(response, Void.class);
  }

  @Override
  public DistributorStatus getStatus() {
    HttpRequest request = new HttpRequest(GET, "/se/grid/distributor/status");
    HttpTracing.inject(tracer, tracer.getCurrentContext(), request);

    HttpResponse response = client.execute(request);

    return Values.get(response, DistributorStatus.class);
  }

  @Override
  public Either<SessionNotCreatedException, CreateSessionResponse> newSession(SessionRequest sessionRequest)
    throws SessionNotCreatedException {
    HttpRequest req = new HttpRequest(POST, "/se/grid/distributor/session")
      .setContent(asJson(sessionRequest));
    HttpTracing.inject(tracer, tracer.getCurrentContext(), req);

    HttpResponse res = client.execute(req);

    if (res.isSuccessful()) {
      return Either.right(Values.get(res, CreateSessionResponse.class));
    } else {
      return Either.left(Values.get(res, SessionNotCreatedException.class));
    }
  }
}
