package org.openqa.selenium.remote.tracing;

import io.opentracing.SpanContext;
import io.opentracing.Tracer;
import io.opentracing.util.GlobalTracer;

import java.util.Objects;

class OpenTracingTracer implements DistributedTracer {

  private final Tracer delegate;

  public OpenTracingTracer(Tracer delegate) {
    this.delegate = Objects.requireNonNull(delegate);
  }

  @Override
  public Span createSpan(String operation, Span parent) {
    SpanContext context = null;
    if (parent instanceof OpenTracingSpan) {
      context = ((OpenTracingSpan) parent).getContext();
    }

    io.opentracing.Span span = delegate.buildSpan(operation).asChildOf(context).start();
    delegate.scopeManager().activate(span, false);
    OpenTracingSpan toReturn = new OpenTracingSpan(delegate, span);
    toReturn.activate();
    return toReturn;
  }

  @Override
  public Span getActiveSpan() {
    io.opentracing.Span span = delegate.activeSpan();
    return new OpenTracingSpan(delegate, span);
  }
}
