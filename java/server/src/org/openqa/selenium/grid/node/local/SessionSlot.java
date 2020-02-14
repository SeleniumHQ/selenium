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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.SessionClosedEvent;
import org.openqa.selenium.grid.node.ActiveSession;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.UncheckedIOException;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.logging.Level;
import java.util.logging.Logger;

public class SessionSlot implements
    HttpHandler,
    Function<CreateSessionRequest, Optional<ActiveSession>>,
    Predicate<Capabilities>  {

  public static final Logger LOG = Logger.getLogger(SessionSlot.class.getName());
  private final EventBus bus;
  private final Capabilities stereotype;
  private final SessionFactory factory;
  private ActiveSession currentSession;

  public SessionSlot(EventBus bus, Capabilities stereotype, SessionFactory factory) {
    this.bus = Objects.requireNonNull(bus);
    this.stereotype = ImmutableCapabilities.copyOf(Objects.requireNonNull(stereotype));
    this.factory = Objects.requireNonNull(factory);
  }

  public Capabilities getStereotype() {
    return stereotype;
  }

  public boolean isAvailable() {
    return currentSession == null;
  }

  public ActiveSession getSession() {
    if (isAvailable()) {
      throw new NoSuchSessionException("Session is not running");
    }

    return currentSession;
  }

  public void stop() {
    if (isAvailable()) {
      return;
    }

    SessionId id = currentSession.getId();
    currentSession.stop();
    currentSession = null;
    bus.fire(new SessionClosedEvent(id));
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    if (currentSession == null) {
      throw new NoSuchSessionException("No session currently running: " + req.getUri());
    }

    return currentSession.execute(req);
  }

  @Override
  public boolean test(Capabilities capabilities) {
    return factory.test(capabilities);
  }

  @Override
  public Optional<ActiveSession> apply(CreateSessionRequest sessionRequest) {
    if (!isAvailable()) {
      return Optional.empty();
    }

    try {
      Optional<ActiveSession> possibleSession = factory.apply(sessionRequest);
      possibleSession.ifPresent(session -> currentSession = session);
      return possibleSession;
    } catch (Exception e) {
      LOG.log(Level.WARNING, "Unable to create session", e);
      return Optional.empty();
    }
  }
}
