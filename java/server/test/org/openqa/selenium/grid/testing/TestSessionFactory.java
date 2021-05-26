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

package org.openqa.selenium.grid.testing;

import static java.net.HttpURLConnection.HTTP_NOT_FOUND;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.remote.http.Contents.utf8String;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.ActiveSession;
import org.openqa.selenium.grid.node.BaseActiveSession;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.Instant;
import java.util.UUID;
import java.util.function.BiFunction;

public class TestSessionFactory implements SessionFactory {

  private final Capabilities stereotype;
  private final BiFunction<SessionId, Capabilities, Session> sessionGenerator;

  public TestSessionFactory(BiFunction<SessionId, Capabilities, Session> sessionGenerator) {
    this(new ImmutableCapabilities(), sessionGenerator);
  }

  public TestSessionFactory(Capabilities stereotype, BiFunction<SessionId, Capabilities, Session> sessionGenerator) {
    this.stereotype = ImmutableCapabilities.copyOf(stereotype);
    this.sessionGenerator = sessionGenerator;
  }

  @Override
  public Either<WebDriverException, ActiveSession> apply(CreateSessionRequest sessionRequest) {
    SessionId id = new SessionId(UUID.randomUUID());
    Session session = sessionGenerator.apply(id, sessionRequest.getDesiredCapabilities());

    URL url;
    try {
      url = session.getUri().toURL();
    } catch (MalformedURLException e) {
      throw new UncheckedIOException(e);
    }

    Dialect downstream = sessionRequest.getDownstreamDialects().contains(W3C) ?
                         W3C :
                         sessionRequest.getDownstreamDialects().iterator().next();


    BaseActiveSession activeSession = new BaseActiveSession(
      session.getId(),
      url,
      downstream,
      W3C,
      stereotype,
      session.getCapabilities(),
      Instant.now()) {
      @Override
      public void stop() {
        // Do nothing
      }

      @Override
      public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
        if (session instanceof HttpHandler) {
          return ((HttpHandler) session).execute(req);
        } else {
          // Do nothing.
          return new HttpResponse().setStatus(HTTP_NOT_FOUND)
            .setContent(utf8String("No handler found for " + req));
        }
      }
    };
    return Either.right(activeSession);
  }

  @Override
  public boolean test(Capabilities capabilities) {
    return true;
  }
}
