package org.openqa.selenium.remote.tracing;

import io.opentracing.Span;
import io.opentracing.SpanContext;
import io.opentracing.Tracer;
import io.opentracing.tag.Tags;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.UncheckedIOException;
import java.util.Objects;
import java.util.function.Function;
import java.util.logging.Logger;

public class SpanWrappedHttpHandler implements HttpHandler {

  private static final Logger LOG = Logger.getLogger(SpanWrappedHttpHandler.class.getName());
  private final Tracer tracer;
  private final Function<HttpRequest, String> namer;
  private final HttpHandler delegate;

  public SpanWrappedHttpHandler(Tracer tracer, Function<HttpRequest, String> namer, HttpHandler delegate) {
    this.tracer = Objects.requireNonNull(tracer, "Tracer to use must be set.");
    this.namer = Objects.requireNonNull(namer, "Naming function must be set.");
    this.delegate = Objects.requireNonNull(delegate, "Actual handler must be set.");
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    String name = Objects.requireNonNull(namer.apply(req), "Operation name must be set for " + req);

    Span previousSpan = tracer.scopeManager().activeSpan();
    SpanContext context = HttpTracing.extract(tracer, req);
    Span span = tracer.buildSpan(name).asChildOf(context).ignoreActiveSpan().start();
    tracer.scopeManager().activate(span);

    try {
      span.setTag(Tags.SPAN_KIND, Tags.SPAN_KIND_SERVER)
        .setTag(Tags.HTTP_METHOD, req.getMethod().toString())
        .setTag(Tags.HTTP_URL, req.getUri());
      HttpTracing.inject(tracer, span, req);

      HttpResponse res = delegate.execute(req);

      span.setTag(Tags.HTTP_STATUS, res.getStatus());

      return res;
    } catch (Throwable t) {
      span.setTag(Tags.ERROR, true);
      throw t;
    } finally {
      span.finish();
      tracer.scopeManager().activate(previousSpan);
    }
  }
}
