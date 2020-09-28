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

import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Tracer;

import java.util.UUID;

class AddBackToSessionQueue implements HttpHandler {

  private final Tracer tracer;
  private final NewSessionQueuer newSessionQueuer;
  private final RequestId id;

  AddBackToSessionQueue(Tracer tracer, NewSessionQueuer newSessionQueuer, RequestId id) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.newSessionQueuer = Require.nonNull("New Session Queuer", newSessionQueuer);
    this.id = id;
  }

  @Override
  public HttpResponse execute(HttpRequest req) {
    try (Span span = newSpanAsChildOf(tracer, req, "sessionqueuer.retry")) {
      HTTP_REQUEST.accept(span, req);
      span.setAttribute(AttributeKey.REQUEST_ID.getKey(), id.toString());

      boolean value = newSessionQueuer.retryAddToQueue(req, id);

      span.setAttribute("request.retry", value);

      HttpResponse response = new HttpResponse().setContent(
          asJson(ImmutableMap.of("value", value)));

      HTTP_RESPONSE.accept(span, response);

      return response;
    }
  }
}

