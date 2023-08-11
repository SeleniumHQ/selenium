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

import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE;

import java.io.UncheckedIOException;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Tracer;

class SessionCreated implements HttpHandler {
  private final Tracer tracer;
  private final NewSessionQueue queue;
  private final RequestId requestId;

  public SessionCreated(Tracer tracer, NewSessionQueue queue, RequestId requestId) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.queue = Require.nonNull("New Session Queue", queue);
    this.requestId = Require.nonNull("Request ID", requestId);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    try (Span span = newSpanAsChildOf(tracer, req, "sessionqueue.created_ok")) {
      HTTP_REQUEST.accept(span, req);

      CreateSessionResponse response = Contents.fromJson(req, CreateSessionResponse.class);
      queue.complete(requestId, Either.right(response));

      HttpResponse res = new HttpResponse();
      HTTP_RESPONSE.accept(span, res);
      return res;
    }
  }
}
