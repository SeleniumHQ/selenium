package org.openqa.selenium.remote.tracing;

import io.opencensus.trace.Tracer;

import java.util.Objects;

class OpenCensusTracer implements DistributedTracer {

  private final Tracer tracer;

  public OpenCensusTracer(Tracer tracer) {
    this.tracer = Objects.requireNonNull(tracer, "Tracer must be set.");
    System.out.println(tracer);
  }

  @Override
  public Span createSpan(String operation, Span parent) {
    io.opencensus.trace.Span parentSpan = null;
    if (parent instanceof OpenCensusSpan) {
      parentSpan = ((OpenCensusSpan) parent).getSpan();
    }

    OpenCensusSpan toReturn = new OpenCensusSpan(
        tracer.spanBuilderWithExplicitParent(operation, parentSpan).startSpan());
    toReturn.activate();
    return toReturn;
  }

  @Override
  public Span getActiveSpan() {
    return OpenCensusSpan.ACTIVE.get();
  }
}
