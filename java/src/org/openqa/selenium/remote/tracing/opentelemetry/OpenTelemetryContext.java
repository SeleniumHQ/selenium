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
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.SpanContext;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Context;
import io.opentelemetry.context.Scope;
import java.util.Objects;
import java.util.concurrent.Callable;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.tracing.TraceContext;

public class OpenTelemetryContext implements TraceContext {
  private final Tracer tracer;
  private final Context context;
  private final SpanContext spanContext;

  public OpenTelemetryContext(Tracer tracer, Context context) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.context = Require.nonNull("Context", context);

    spanContext = Span.fromContext(context).getSpanContext();
  }

  @Override
  public String getId() {
    return spanContext.getSpanId();
  }

  @SuppressWarnings("MustBeClosedChecker")
  @Override
  public OpenTelemetrySpan createSpan(String name) {
    Require.nonNull("Name", name);

    Span span = tracer.spanBuilder(name).setParent(context).startSpan();
    Context prev = Context.current();

    // Now update the context
    Scope scope = span.makeCurrent();

    if (prev.equals(Context.current())) {
      throw new IllegalStateException("Context has not been changed");
    }

    return new OpenTelemetrySpan(tracer, Context.current(), span, scope);
  }

  @VisibleForTesting
  Context getContext() {
    return context;
  }

  @Override
  public Runnable wrap(Runnable runnable) {
    return context.wrap(runnable);
  }

  @Override
  public <V> Callable<V> wrap(Callable<V> callable) {
    return context.wrap(callable);
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof OpenTelemetryContext)) {
      return false;
    }
    OpenTelemetryContext that = (OpenTelemetryContext) o;
    return Objects.equals(this.context, that.context);
  }

  @Override
  public int hashCode() {
    return Objects.hash(context);
  }

  @Override
  public String toString() {
    return "OpenTelemetryContext{"
        + "tracer="
        + tracer
        + ", context="
        + this.context
        + ", span id="
        + spanContext.getSpanId()
        + ", trace id="
        + spanContext.getTraceId()
        + '}';
  }
}
