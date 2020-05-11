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

package org.openqa.selenium.remote.tracing;

import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.UncheckedIOException;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.logging.Level;
import java.util.logging.Logger;

import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE;
import static org.openqa.selenium.remote.tracing.Tags.KIND;

public class SpanWrappedHttpHandler implements HttpHandler {

  private static final Logger LOG = Logger.getLogger(SpanWrappedHttpHandler.class.getName());
  private final Tracer tracer;
  private final Function<HttpRequest, String> namer;
  private final HttpHandler delegate;

  public SpanWrappedHttpHandler(Tracer tracer, Function<HttpRequest, String> namer, HttpHandler delegate) {
    this.tracer = Objects.requireNonNull(tracer, "Tracer to use must be set.");
    this.namer = Objects.requireNonNull(namer, "Naming function must be set.");
    this.delegate = Objects.requireNonNull(delegate, "Actual handler must be set.");
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    // If there is already a span attached to this request, then do nothing.
    Object possibleSpan = req.getAttribute("selenium.tracing.span");
    if (possibleSpan instanceof Span) {
      return delegate.execute(req);
    }

    String name = Objects.requireNonNull(namer.apply(req), "Operation name must be set for " + req);

    TraceContext before = tracer.getCurrentContext();
    Span span = newSpanAsChildOf(tracer, req, name);
    try {
      TraceContext after = tracer.getCurrentContext();
      span.setAttribute("random.key", UUID.randomUUID().toString());

      req.setAttribute("selenium.tracing.span", span);

      if (!(after.getClass().getName().equals("org.openqa.selenium.remote.tracing.empty.NullContext"))) {
        LOG.fine(String.format("Wrapping request. Before %s and after %s", before, after));
      }

      KIND.accept(span, Span.Kind.SERVER);
      HTTP_REQUEST.accept(span, req);
      HttpTracing.inject(tracer, span, req);

      HttpResponse res = delegate.execute(req);

      HTTP_RESPONSE.accept(span, res);

      return res;
    } catch (Throwable t) {
      span.setAttribute("error", true);
      span.setStatus(Status.UNKNOWN.withDescription(t.getMessage()));
      LOG.log(Level.WARNING, "Unable to execute request: " + t.getMessage(), t);
      throw t;
    } finally {
      span.close();
    }
  }
}
