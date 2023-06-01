package org.openqa.selenium.grid.node;

import static org.openqa.selenium.remote.http.HttpMethod.DELETE;

import java.io.UncheckedIOException;
import java.net.URL;
import java.time.Instant;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.web.ReverseProxyHandler;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Tracer;

public class DefaultActiveSession extends BaseActiveSession {

  private final HttpHandler handler;
  private final String killUrl;

  protected DefaultActiveSession(
      Tracer tracer,
      HttpClient client,
      SessionId id,
      URL url,
      Dialect downstream,
      Dialect upstream,
      Capabilities stereotype,
      Capabilities capabilities,
      Instant startTime) {
    super(id, url, downstream, upstream, stereotype, capabilities, startTime);

    Require.nonNull("HTTP client", client);

    this.handler = new ReverseProxyHandler(tracer, client);
    this.killUrl = "/session/" + id;
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    String host = "host";
    StreamSupport.stream(req.getHeaderNames().spliterator(), true)
        .filter(host::equalsIgnoreCase)
        .collect(Collectors.toList())
        .forEach(req::removeHeader);
    req.addHeader(host, String.format("%s:%s", getUri().getHost(), getUri().getPort()));
    HttpResponse res = handler.execute(req);
    if (req.getMethod() == DELETE && killUrl.equals(req.getUri())) {
      stop();
    }
    return res;
  }

  @Override
  public void stop() {
    // no-op
  }
}
