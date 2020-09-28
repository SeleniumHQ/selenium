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

import static java.net.HttpURLConnection.HTTP_NO_CONTENT;
import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE;

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Tracer;

import java.util.Optional;

public class RemoveFromSessionQueue implements HttpHandler {

  private final Tracer tracer;
  private final NewSessionQueuer newSessionQueuer;

  RemoveFromSessionQueue(Tracer tracer, NewSessionQueuer newSessionQueuer) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.newSessionQueuer = Require.nonNull("New Session Queuer", newSessionQueuer);
  }

  @Override
  public HttpResponse execute(HttpRequest req) {
    try (Span span = newSpanAsChildOf(tracer, req, "sessionqueuer.remove")) {
      HTTP_REQUEST.accept(span, req);

      Optional<HttpRequest> sessionRequest = newSessionQueuer.remove();
      HttpResponse response = new HttpResponse();

      if (sessionRequest.isPresent()) {
        HttpRequest request = sessionRequest.get();
        response.setContent(request.getContent());
        response.setHeader(NewSessionQueue.SESSIONREQUEST_TIMESTAMP_HEADER,
                           request.getHeader(NewSessionQueue.SESSIONREQUEST_TIMESTAMP_HEADER));
      } else {
        response.setStatus(HTTP_NO_CONTENT);
      }

      HTTP_RESPONSE.accept(span, response);
      return response;
    }
  }
}

