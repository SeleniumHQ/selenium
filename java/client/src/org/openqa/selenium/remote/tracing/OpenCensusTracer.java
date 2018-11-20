package org.openqa.selenium.remote.tracing;

import io.opencensus.trace.SpanBuilder;
import io.opencensus.trace.SpanContext;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.propagation.SpanContextParseException;
import io.opencensus.trace.propagation.TextFormat;

import java.util.Map;
import java.util.Objects;
import java.util.function.Function;

class OpenCensusTracer implements DistributedTracer {

  private final Tracer tracer;

  public OpenCensusTracer(Tracer tracer) {
    this.tracer = Objects.requireNonNull(tracer, "Tracer must be set.");
  }

  @Override
  public Span createSpan(String operation, Span parent) {
    io.opencensus.trace.Span parentSpan = null;
    if (parent instanceof OpenCensusSpan) {
      parentSpan = ((OpenCensusSpan) parent).getSpan();
    }

    return createActiveSpan(tracer.spanBuilderWithExplicitParent(operation, parentSpan));
  }

  @Override
  public <C> Span createSpan(
      String operation,
      C carrier,
      Function<C, Map<String, String>> extractor) {
    Map<String, String> values = extractor.apply(carrier);

    TextFormat format = Tracing.getPropagationComponent().getB3Format();
    SpanContext context;
    try {
      context = format.extract(
          new Object(),
          new TextFormat.Getter<Object>() {
            @Override
            public String get(Object carrier, String key) {
              return values.get(key);
            }
          });
    } catch (SpanContextParseException e) {
      throw new RuntimeException(e);
    }

    return createActiveSpan(tracer.spanBuilderWithRemoteParent(operation, context));
  }

  private Span createActiveSpan(SpanBuilder builder) {
    OpenCensusSpan span = new OpenCensusSpan(builder.startSpan());
    span.activate();
    return span;
  }

  @Override
  public Span getActiveSpan() {
    return OpenCensusSpan.ACTIVE.get();
  }
}
