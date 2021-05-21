package org.openqa.selenium.grid.data;

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.tracing.HttpTracing;
import org.openqa.selenium.remote.tracing.TraceContext;
import org.openqa.selenium.remote.tracing.Tracer;

import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class TraceSessionRequest {

  private TraceSessionRequest() {
    // Utility methods
  }

  public static TraceContext extract(Tracer tracer, SessionRequest sessionRequest) {
    Require.nonNull("Tracer", tracer);
    Require.nonNull("Session request", sessionRequest);

    return tracer.getPropagator()
      .extractContext(
        tracer.getCurrentContext(),
        sessionRequest,
        SessionRequest::getTraceHeader);
  }
}
