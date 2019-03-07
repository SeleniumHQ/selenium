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

package org.openqa.selenium.grid.node.local;

import static org.openqa.selenium.net.Urls.fromUri;
import static org.openqa.selenium.remote.http.HttpMethod.DELETE;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionClosedEvent;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.ReverseProxyHandler;
import org.openqa.selenium.remote.http.HttpClient;

import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Predicate;

class SessionFactory
    implements Predicate<Capabilities>, Function<Capabilities, Optional<TrackedSession>> {

  private final EventBus bus;
  private final HttpClient.Factory httpClientFactory;
  private final Capabilities capabilities;
  private final Function<Capabilities, Session> generator;
  private volatile boolean available = true;

  SessionFactory(
      EventBus bus,
      HttpClient.Factory httpClientFactory,
      Capabilities capabilities,
      Function<Capabilities, Session> generator) {
    this.bus = Objects.requireNonNull(bus);
    this.httpClientFactory = Objects.requireNonNull(httpClientFactory);
    this.capabilities = Objects.requireNonNull(ImmutableCapabilities.copyOf(capabilities));
    this.generator = Objects.requireNonNull(generator);
  }

  public Capabilities getCapabilities() {
    return capabilities;
  }

  public boolean isAvailable() {
    return available;
  }

  @Override
  public boolean test(Capabilities capabilities) {
    if (!isAvailable()) {
      return false;
    }

    return this.capabilities.getCapabilityNames().stream()
        .allMatch(name -> Objects.equals(
            this.capabilities.getCapability(name), capabilities.getCapability(name)));

  }

  @Override
  public Optional<TrackedSession> apply(Capabilities capabilities) {
    if (!test(capabilities)) {
      return Optional.empty();
    }

    this.available = false;
    Session session;
    try {
      session = generator.apply(capabilities);
    } catch (Throwable throwable) {
      this.available = true;
      return Optional.empty();
    }

    CommandHandler handler;
    if (session instanceof CommandHandler) {
      handler = (CommandHandler) session;
    } else {
      HttpClient client = httpClientFactory.createClient(fromUri(session.getUri()));
      handler = new ReverseProxyHandler(client);
    }

    String killUrl = "/session/" + session.getId();
    CommandHandler killingHandler = (req, res) -> {
      handler.execute(req, res);
      if (req.getMethod() == DELETE && killUrl.equals(req.getUri())) {
        available = true;
        bus.fire(new SessionClosedEvent(session.getId()));
      }
    };

    return Optional.of(new TrackedSession(this, session, killingHandler));
  }
}
