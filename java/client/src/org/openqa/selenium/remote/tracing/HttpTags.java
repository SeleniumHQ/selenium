package org.openqa.selenium.remote.tracing;

import io.opentelemetry.trace.Span;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.util.function.BiConsumer;

public class HttpTags {

  private HttpTags() {
    // Utility class
  }

  public static BiConsumer<Span, HttpRequest> HTTP_REQUEST = (span, req) -> {
    span.setAttribute("http.method", req.getMethod().toString());
    span.setAttribute("http.url", req.getUri());
  };

  public static BiConsumer<Span, HttpResponse> HTTP_RESPONSE = (span, res) -> {
    span.setAttribute("http.status_code", res.getStatus());
  };

}
