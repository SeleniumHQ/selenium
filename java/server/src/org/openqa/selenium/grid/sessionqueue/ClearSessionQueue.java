package org.openqa.selenium.grid.sessionqueue;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_REQUEST;
import static org.openqa.selenium.remote.tracing.Tags.HTTP_RESPONSE;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Tracer;

public class ClearSessionQueue implements HttpHandler {

  private final Tracer tracer;
  private final NewSessionQueuer newSessionQueuer;

  ClearSessionQueue(Tracer tracer, NewSessionQueuer newSessionQueuer) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.newSessionQueuer = Require.nonNull("New Session Queuer", newSessionQueuer);
  }

  @Override
  public HttpResponse execute(HttpRequest req) {
    Span span = newSpanAsChildOf(tracer, req, "sessionqueuer.clear");
    HTTP_REQUEST.accept(span, req);

    try {
      int value = newSessionQueuer.clearQueue();
      span.setAttribute("cleared", value);

      HttpResponse response = new HttpResponse();
      if (value != 0) {
        response.setContent(
            asJson(ImmutableMap.of("value", value,
                                   "message", "Cleared the new session request queue",
                                   "cleared_requests", value)));
      } else {
        response.setContent(
            asJson(ImmutableMap.of("value", value,
                                   "message",
                                   "New session request queue empty. Nothing to clear.")));
      }

      span.setAttribute("requests.cleared", value);
      HTTP_RESPONSE.accept(span, response);
      return response;
    } catch (Exception e) {
      HttpResponse response = new HttpResponse().setStatus((HTTP_INTERNAL_ERROR)).setContent(
          asJson(ImmutableMap.of("value", 0,
                                 "message",
                                 "Error while clearing the queue. Full queue may not have been cleared.")));

      HTTP_RESPONSE.accept(span, response);
      return response;
    } finally {
      span.close();
    }
  }
}
