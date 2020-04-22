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

package org.openqa.selenium.remote.tracing.opentelemetry;

import com.google.common.annotations.VisibleForTesting;
import io.opentelemetry.context.Scope;
import io.opentelemetry.trace.Span;
import io.opentelemetry.trace.SpanContext;
import io.opentelemetry.trace.Tracer;
import org.openqa.selenium.remote.tracing.SpanId;
import org.openqa.selenium.remote.tracing.TraceContext;

import java.util.Objects;
import java.util.concurrent.Callable;

public class OpenTelemetryContext implements TraceContext {
  private final Tracer tracer;
  private final SpanContext spanContext;

  public OpenTelemetryContext(Tracer tracer, SpanContext spanContext) {
    this.tracer = Objects.requireNonNull(tracer);
    this.spanContext = Objects.requireNonNull(spanContext);
  }

  @SuppressWarnings("MustBeClosedChecker")
  @Override
  public OpenTelemetrySpan createSpan(String name) {
    Objects.requireNonNull(name, "Name to use must be set.");

    Span span = tracer.spanBuilder(name).setParent(this.spanContext).startSpan();

    // Now update the context
    Scope scope = tracer.withSpan(span);

    return new OpenTelemetrySpan(tracer, span, scope);
  }

  @Override
  public SpanId getId() {
    return new SpanId(getContext().getSpanId());
  }

  @VisibleForTesting
  SpanContext getContext() {
    return spanContext;
  }

  @Override
  public Runnable wrap(Runnable runnable) {
    Objects.requireNonNull(runnable, "Runnable to use must be set");

    throw new UnsupportedOperationException("wrap");
  }

  @Override
  public <V> Callable<V> wrap(Callable<V> callable) {
    Objects.requireNonNull(callable, "Callable to use must be set");

    throw new UnsupportedOperationException("wrap");
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof OpenTelemetryContext)) {
      return false;
    }
    OpenTelemetryContext that = (OpenTelemetryContext) o;
    return Objects.equals(this.spanContext, that.spanContext);
  }

  @Override
  public int hashCode() {
    return Objects.hash(spanContext);
  }

  @Override
  public String toString() {
    SpanContext context = spanContext;

    return "OpenTelemetryContext{" +
      "tracer=" + tracer +
      ", span id=" + context.getSpanId() +
      ", trace id=" + context.getTraceId() +
      '}';
  }
}
