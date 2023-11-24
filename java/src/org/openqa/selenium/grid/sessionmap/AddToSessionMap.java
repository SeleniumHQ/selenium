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

package org.openqa.selenium.grid.sessionmap;

import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST;

import com.google.common.collect.ImmutableMap;
import java.util.Objects;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Tracer;

class AddToSessionMap implements HttpHandler {

  private final Tracer tracer;
  private final Json json;
  private final SessionMap sessions;

  AddToSessionMap(Tracer tracer, Json json, SessionMap sessions) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.json = Require.nonNull("Json converter", json);
    this.sessions = Require.nonNull("Session map", sessions);
  }

  @Override
  public HttpResponse execute(HttpRequest req) {
    try (Span span = newSpanAsChildOf(tracer, req, "sessions.add_session")) {
      HTTP_REQUEST.accept(span, req);

      Session session = json.toType(string(req), Session.class);
      Objects.requireNonNull(session, "Session to add must be set");

      SESSION_ID.accept(span, session.getId());
      CAPABILITIES.accept(span, session.getCapabilities());
      span.setAttribute("session.uri", session.getUri().toString());

      sessions.add(session);

      return new HttpResponse().setContent(asJson(ImmutableMap.of("value", true)));
    }
  }
}
