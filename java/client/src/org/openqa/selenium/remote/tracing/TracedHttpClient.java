package org.openqa.selenium.remote.tracing;

import io.opentracing.Tracer;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.WebSocket;

import java.io.UncheckedIOException;
import java.net.URL;
import java.util.Objects;

public class TracedHttpClient implements HttpClient {

  private final Tracer tracer;
  private final HttpClient delegate;

  private TracedHttpClient(Tracer tracer, HttpClient delegate) {
    this.tracer = Objects.requireNonNull(tracer);
    this.delegate = Objects.requireNonNull(delegate);
  }

  @Override
  public WebSocket openSocket(HttpRequest request, WebSocket.Listener listener) {
    return delegate.openSocket(request, listener);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    return delegate.execute(req);
  }

  public static class Factory implements HttpClient.Factory {

    private final Tracer tracer;
    private final HttpClient.Factory delegate;

    public Factory(Tracer tracer, HttpClient.Factory delegate) {
      this.tracer = Objects.requireNonNull(tracer);
      this.delegate = Objects.requireNonNull(delegate);
    }

    public HttpClient createClient(ClientConfig config) {
      HttpClient client = delegate.createClient(config);
      return new TracedHttpClient(tracer, client);
    }

    @Override
    public HttpClient createClient(URL url) {
      HttpClient client = delegate.createClient(url);
      return new TracedHttpClient(tracer, client);
    }
  }

}
