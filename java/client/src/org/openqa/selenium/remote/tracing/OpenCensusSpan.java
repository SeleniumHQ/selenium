package org.openqa.selenium.remote.tracing;

import io.opencensus.trace.AttributeValue;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.propagation.TextFormat;

import java.util.Objects;
import java.util.function.BiConsumer;

public class OpenCensusSpan implements Span {

  private final io.opencensus.trace.Span span;
  public static final ThreadLocal<Span> ACTIVE = new ThreadLocal<>();

  public OpenCensusSpan(io.opencensus.trace.Span span) {
    this.span = Objects.requireNonNull(span, "Span must be set.");
  }

  @Override
  public Span activate() {
    ACTIVE.set(this);
    return this;
  }

  @Override
  public Span addTag(String key, Object value) {
    Objects.requireNonNull(key, "Key must be set");
    if (value == null) {
      return this;
    }
    span.putAttribute(key, AttributeValue.stringAttributeValue(String.valueOf(value)));
    return this;
  }

  @Override
  public Span addTag(String key, boolean value) {
    Objects.requireNonNull(key, "Key must be set");
    span.putAttribute(key, AttributeValue.booleanAttributeValue(value));
    return this;
  }

  @Override
  public Span addTag(String key, Number value) {
    Objects.requireNonNull(key, "Key must be set");
    if (value == null) {
      return this;
    }

    if (value instanceof Double || value instanceof Float) {
      span.putAttribute(key, AttributeValue.doubleAttributeValue(value.doubleValue()));
    } else {
      span.putAttribute(key, AttributeValue.longAttributeValue(value.longValue()));
    }
    return this;
  }

  @Override
  public void inject(BiConsumer<String, String> forEachField) {
    TextFormat format = Tracing.getPropagationComponent().getB3Format();
    format.inject(span.getContext(), new Object(), new TextFormat.Setter<Object>() {
      @Override
      public void put(Object ignored, String key, String value) {
        if (key != null && value != null) {
          forEachField.accept(key, value);
        }
      }
    });
  }

  @Override
  public void close() {
    if (this.equals(ACTIVE.get())) {
      ACTIVE.set(null);
    }
    span.end();
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof OpenCensusSpan)) {
      return false;
    }

    OpenCensusSpan that = (OpenCensusSpan) o;
    return Objects.equals(this.span, that.span);
  }

  @Override
  public int hashCode() {
    return Objects.hash(span);
  }

  io.opencensus.trace.Span getSpan() {
    return span;
  }
}
