package org.openqa.selenium.remote.tracing;

import io.opentracing.Span;
import io.opentracing.Tracer;

import java.util.concurrent.Callable;

public class TracedCallable<T> implements Callable<T> {

  private final Tracer tracer;
  private final Span span;
  private final Callable<T> delegate;

  public TracedCallable(Tracer tracer, Span span, Callable<T> delegate) {
    this.tracer = tracer;
    this.span = span;
    this.delegate = delegate;
  }

  @Override
  public T call() throws Exception {
    Span previousSpan = tracer.scopeManager().activeSpan();
    tracer.scopeManager().activate(this.span);
    try {
      return delegate.call();
    } finally {
      tracer.scopeManager().activate(previousSpan);
    }
  }
}
