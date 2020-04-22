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

import com.google.common.base.Throwables;
import com.google.common.primitives.Primitives;
import io.opentelemetry.context.Scope;
import io.opentelemetry.trace.SpanContext;
import io.opentelemetry.trace.Tracer;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;

import java.util.Objects;
import java.util.concurrent.Callable;
import java.util.logging.Level;
import java.util.logging.Logger;

class OpenTelemetrySpan extends OpenTelemetryContext implements AutoCloseable, Span {

  private static final Logger LOG = Logger.getLogger(OpenTelemetrySpan.class.getName());
  private final io.opentelemetry.trace.Tracer tracer;
  private final io.opentelemetry.trace.Span span;
  private final Scope scope;
  private Throwable stackTraceOfClose;

  public OpenTelemetrySpan(Tracer tracer, io.opentelemetry.trace.Span span, Scope scope) {
    super(tracer, span.getContext());
    this.tracer = Objects.requireNonNull(tracer);
    this.span = Objects.requireNonNull(span);
    this.scope = Objects.requireNonNull(scope);

    span.setAttribute("thread.id", Thread.currentThread().getId());

    LOG.log(Level.INFO, String.format("New span %d - %s", System.identityHashCode(this), span), new Throwable());
  }

  @Override
  public Span setName(String name) {
    Objects.requireNonNull(name, "Name to update to must be set.");
    span.updateName(name);

    return this;
  }

  @Override
  public Span setAttribute(String key, boolean value) {
    Objects.requireNonNull(key, "Key to use must be set.");
    span.setAttribute(key, value);
    return this;
  }

  @Override
  public Span setAttribute(String key, Number value) {
    Objects.requireNonNull(key, "Key to use must be set.");
    Objects.requireNonNull(value, "Value to use must be set.");

    Class<? extends Number> unwrapped = Primitives.unwrap(value.getClass());
    if (double.class.equals(unwrapped) || float.class.equals(unwrapped)) {
      span.setAttribute(key, value.doubleValue());
    } else {
      span.setAttribute(key, value.longValue());
    }

    return this;
  }

  @Override
  public Span setAttribute(String key, String value) {
    Objects.requireNonNull(key, "Key to use must be set.");
    Objects.requireNonNull(value, "Value to use must be set.");
    span.setAttribute(key, value);
    return this;
  }

  @Override
  public Span setStatus(Status status) {
    Objects.requireNonNull(status, "Status to use must be set.");

    io.opentelemetry.trace.Status otStatus = null;

    switch (status.getKind()) {
      case ABORTED:
        otStatus = io.opentelemetry.trace.Status.ABORTED;
        break;

      case CANCELLED:
        otStatus = io.opentelemetry.trace.Status.CANCELLED;
        break;

      case NOT_FOUND:
        otStatus = io.opentelemetry.trace.Status.NOT_FOUND;
        break;

      case OK:
        otStatus = io.opentelemetry.trace.Status.OK;
        break;

      case RESOURCE_EXHAUSTED:
        otStatus = io.opentelemetry.trace.Status.RESOURCE_EXHAUSTED;
        break;

      case UNKNOWN:
        otStatus = io.opentelemetry.trace.Status.UNKNOWN;
        break;

      default:
        throw new IllegalArgumentException("Unrecognized status kind: " + status.getKind());
    }

    otStatus.withDescription(status.getDescription());

    span.setStatus(otStatus);

    return this;
  }

  @Override
  public Runnable wrap(Runnable runnable) {
    Objects.requireNonNull(runnable, "Runnable to use must be set.");

    return () -> {
      try (Scope scope = tracer.withSpan(span)) {
        runnable.run();
      }
    };
  }

  @Override
  public <V> Callable<V> wrap(Callable<V> callable) {
    Objects.requireNonNull(callable, "Callable to use must be set.");

    return () -> {
      try (Scope scope = tracer.withSpan(span)) {
        return callable.call();
      }
    };
  }

  @Override
  public void close() {
    if (stackTraceOfClose != null) {
      String message = String.format(
        "Closing span more than once. Original stacktrace of close:\n%s",
        Throwables.getStackTraceAsString(stackTraceOfClose));

      LOG.log(Level.WARNING, message, new Throwable());
      throw new IllegalStateException(message);
    }

    scope.close();
    span.end();

    stackTraceOfClose = new Throwable();
  }

  @Override
  public String toString() {
    SpanContext context = span.getContext();

    return "OpenTelemetrySpan{traceId=" +
      context.getTraceId() +
      ",spanId=" +
      context.getSpanId() +
      "}";
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof OpenTelemetrySpan)) {
      return false;
    }

    OpenTelemetrySpan that = (OpenTelemetrySpan) o;
    SpanContext thisContext = this.span.getContext();
    SpanContext thatContext = that.span.getContext();

    return Objects.equals(thisContext.getSpanId(), thatContext.getSpanId()) &&
      Objects.equals(thisContext.getTraceId(), thatContext.getTraceId());
  }

  @Override
  public int hashCode() {
    return Objects.hash(span);
  }
}
