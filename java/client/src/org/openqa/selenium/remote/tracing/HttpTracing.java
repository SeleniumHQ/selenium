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

import io.opentelemetry.trace.Span;
import io.opentelemetry.trace.SpanContext;
import io.opentelemetry.trace.SpanId;
import io.opentelemetry.trace.TraceFlags;
import io.opentelemetry.trace.TraceId;
import io.opentelemetry.trace.TraceState;
import io.opentelemetry.trace.Tracer;
import org.openqa.selenium.remote.http.HttpRequest;

import java.util.Objects;
import java.util.logging.Logger;

public class HttpTracing {

  private static final Logger LOG = Logger.getLogger(HttpTracing.class.getName());
  private static final SpanContext NO_OP_CONTEXT = SpanContext.create(
    TraceId.getInvalid(),
    SpanId.getInvalid(),
    TraceFlags.getDefault(),
    TraceState.getDefault());

  private HttpTracing() {
    // Utility classes
  }

  private static SpanContext extract(Tracer tracer, HttpRequest request) {
    Objects.requireNonNull(tracer, "Tracer to use must be set.");
    Objects.requireNonNull(request, "Request must be set.");

    try {
      return tracer.getHttpTextFormat().extract(request, (req, key) -> req.getHeader(key));
    } catch (IllegalArgumentException ignored) {
      // See: https://github.com/open-telemetry/opentelemetry-java/issues/767
      // Fall through
    }
    return NO_OP_CONTEXT;
  }

  public static Span.Builder newSpanAsChildOf(Tracer tracer, HttpRequest request, String name) {
    Objects.requireNonNull(tracer, "Tracer to use must be set.");
    Objects.requireNonNull(request, "Request must be set.");
    Objects.requireNonNull(name, "Name to use must be set.");

    SpanContext parent = extract(tracer, request);

    Span.Builder builder = tracer.spanBuilder(name);
    if (parent != null) {
      builder.setParent(parent);
    } else {
      // This should never happen, but you never know, right?
      builder.setNoParent();
    }

    return builder;
  }

  public static void inject(Tracer tracer, Span span, HttpRequest request) {
    if (span == null) {
      // Do nothing.
      return;
    }

    Objects.requireNonNull(tracer, "Tracer to use must be set.");
    Objects.requireNonNull(request, "Request must be set.");

    StackTraceElement caller = Thread.currentThread().getStackTrace()[2];
    LOG.fine(String.format("Injecting %s into %s at %s:%d", request, span, caller.getClassName(), caller.getLineNumber()));

    span.setAttribute("http.method", request.getMethod().toString());
    span.setAttribute("http.url", request.getUri());
    tracer.getHttpTextFormat().inject(span.getContext(), request, (req, key, value) -> req.setHeader(key, value));
  }
}
