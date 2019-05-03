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

package org.openqa.selenium.docker;

import static org.openqa.selenium.remote.http.HttpMethod.DELETE;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.time.Duration;
import java.util.Objects;
import java.util.function.Function;
import java.util.logging.Logger;

public class Container {

  public static final Logger LOG = Logger.getLogger(Container.class.getName());
  private final Function<HttpRequest, HttpResponse> client;
  private final ContainerId id;

  public Container(Function<HttpRequest, HttpResponse> client, ContainerId id) {
    LOG.finest("Created container " + id);
    this.client = Objects.requireNonNull(client);
    this.id = Objects.requireNonNull(id);
  }

  public ContainerId getId() {
    return id;
  }

  public void start() {
    LOG.info("Starting " + getId());
    client.apply(new HttpRequest(POST, String.format("/containers/%s/start", id)));
  }

  public void stop(Duration timeout) {
    Objects.requireNonNull(timeout);

    LOG.info("Stopping " + getId());

    String seconds = String.valueOf(timeout.toMillis() / 1000);

    HttpRequest request = new HttpRequest(POST, String.format("/containers/%s/stop", id));
    request.addQueryParameter("t", seconds);

    client.apply(request);
  }

  public void delete() {
    LOG.finest("Removing " + getId());

    HttpRequest request = new HttpRequest(DELETE, "/containers/" + id);
    client.apply(request);
  }
}
