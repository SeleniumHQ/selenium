package org.openqa.selenium.remote.tracing;

import io.opentracing.Tracer;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;

import java.util.Objects;
import java.util.function.Function;

public class SpanDecorator implements Filter {

  private final Tracer tracer;
  private final Function<HttpRequest, String> namer;

  public SpanDecorator(Tracer tracer, Function<HttpRequest, String> namer) {
    this.tracer = Objects.requireNonNull(tracer, "Tracer to use must be set.");
    this.namer = Objects.requireNonNull(namer, "Naming function must be set.");
  }

  @Override
  public HttpHandler apply(HttpHandler handler) {
    return new SpanWrappedHttpHandler(tracer, namer, handler);
  }
}
