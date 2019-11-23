package org.openqa.selenium.remote.tracing;

import io.opentracing.Tracer;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.Routable;

import java.util.Objects;
import java.util.function.Function;

public class SpanWrappedRoutable extends SpanWrappedHttpHandler implements Routable {
  private final Routable delegate;

  public SpanWrappedRoutable(Tracer tracer, Function<HttpRequest, String> namer, Routable delegate) {
    super(tracer, namer, delegate);

    this.delegate = Objects.requireNonNull(delegate, "Routable to use must be set.");
  }

  @Override
  public boolean matches(HttpRequest req) {
    return delegate.matches(req);
  }
}
