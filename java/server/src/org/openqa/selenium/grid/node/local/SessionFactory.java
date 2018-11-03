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

import static org.openqa.selenium.remote.http.HttpMethod.DELETE;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.ReverseProxyHandler;

import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Predicate;

class SessionFactory
    implements Predicate<Capabilities>, Function<Capabilities, Optional<SessionAndHandler>> {

  private final SessionMap sessions;
  private final Capabilities capabilities;
  private final Function<Capabilities, Session> generator;
  private volatile boolean available = true;

  SessionFactory(
      SessionMap sessions,
      Capabilities capabilities,
      Function<Capabilities, Session> generator) {
    this.sessions = Objects.requireNonNull(sessions);
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
  public Optional<SessionAndHandler> apply(Capabilities capabilities) {
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
    sessions.add(session);

    CommandHandler handler;
    if (session instanceof CommandHandler) {
      handler = (CommandHandler) session;
    } else {
      try {
        handler = new ReverseProxyHandler(session.getUri().toURL());
      } catch (MalformedURLException e) {
        throw new UncheckedIOException(e);
      }
    }

    String killUrl = "/session/" + session.getId();
    CommandHandler killingHandler = (req, res) -> {
      if (req.getMethod() == DELETE && killUrl.equals(req.getUri())) {
        try {
          sessions.remove(session.getId());
        } finally {
          available = true;
        }
      }
      handler.execute(req, res);
    };

    return Optional.of(new SessionAndHandler(session, killingHandler));
  }
}
