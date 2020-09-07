package org.openqa.selenium.grid.sessionqueue;

import static java.net.HttpURLConnection.HTTP_NO_CONTENT;

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Tracer;

import java.util.Optional;

public class RemoveFromSessionQueue implements HttpHandler {

  private final Tracer tracer;
  private final NewSessionQueuer newSessionQueuer;

  RemoveFromSessionQueue(Tracer tracer, NewSessionQueuer newSessionQueuer) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.newSessionQueuer = Require.nonNull("New Session Queuer", newSessionQueuer);
  }

  @Override
  public HttpResponse execute(HttpRequest req) {
    Optional<HttpRequest> sessionRequest = newSessionQueuer.remove();
    HttpResponse response = new HttpResponse();

    if (sessionRequest.isPresent()) {
      HttpRequest request = sessionRequest.get();
      response.setContent(request.getContent());
      response.setHeader(NewSessionQueue.SESSIONREQUEST_TIMESTAMP_HEADER,
                         request.getHeader(NewSessionQueue.SESSIONREQUEST_TIMESTAMP_HEADER));
      return response;
    }

    return new HttpResponse().setStatus(HTTP_NO_CONTENT);
  }
}