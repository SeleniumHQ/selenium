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

package org.openqa.selenium.grid.sessionqueue;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.TypeToken;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.UncheckedIOException;
import java.lang.reflect.Type;
import java.util.Optional;
import java.util.Set;

import static java.util.Collections.singletonMap;
import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE;

class GetNextMatchingRequest implements HttpHandler {
  private static final Type SET_OF_CAPABILITIES = new TypeToken<Set<Capabilities>>() {}.getType();

  private final Tracer tracer;
  private final NewSessionQueue queue;

  public GetNextMatchingRequest(Tracer tracer, NewSessionQueue queue) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.queue = Require.nonNull("New session queue", queue);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    try (Span span = newSpanAsChildOf(tracer, req, "sessionqueue.getrequest")) {
      HTTP_REQUEST.accept(span, req);
      Set<Capabilities> stereotypes = Contents.fromJson(req, SET_OF_CAPABILITIES);

      Optional<SessionRequest> maybeRequest = queue.getNextAvailable(stereotypes);

      HttpResponse response =  new HttpResponse().setContent(Contents.asJson(singletonMap("value", maybeRequest.orElse(null))));

      HTTP_RESPONSE.accept(span, response);

      return response;
    }
  }
}
