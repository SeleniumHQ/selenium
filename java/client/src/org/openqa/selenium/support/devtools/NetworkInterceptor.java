package org.openqa.selenium.support.devtools;

import com.google.common.collect.ImmutableList;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.HasDevTools;
import org.openqa.selenium.devtools.fetch.Fetch;
import org.openqa.selenium.devtools.fetch.model.HeaderEntry;
import org.openqa.selenium.devtools.fetch.model.RequestPattern;
import org.openqa.selenium.devtools.fetch.model.RequestPaused;
import org.openqa.selenium.devtools.network.model.Request;
import org.openqa.selenium.devtools.network.model.ResourceType;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;

import java.io.Closeable;
import java.util.Base64;
import java.util.Objects;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

import static org.openqa.selenium.devtools.fetch.model.RequestStage.REQUEST;
import static org.openqa.selenium.remote.http.Contents.utf8String;


/**
 * Provides a mechanism for stubbing out responses to requests in drivers which
 * implement {@link HasDevTools}. Usage is done by specifying a {@link Route},
 * which will be checked for every request to see if that request should be
 * handled or not. Note that the URLs given to the {@code Route} will be fully
 * qualified.
 * <p>
 * Example usage:
 * <p>
 * <code><pre>
 *   Route route = Route.matching(req -> GET == req.getMethod() && req.getUri().endsWith("/example"))
 *     .to(() -> req -> new HttpResponse().setContent(Contents.utf8String("Hello, World!")));
 *
 *   try (NetworkInterceptor interceptor = new NetworkInterceptor(driver, route)) {
 *     // Your code here.
 *   }
 * </pre></code>
 */
public class NetworkInterceptor implements Closeable {

  private static final Logger LOG = Logger.getLogger(NetworkInterceptor.class.getName());

  public static final HttpResponse PROCEED_WITH_REQUEST = new HttpResponse()
    .addHeader("Selenium-Interceptor", "Continue")
    .setContent(utf8String("Original request should proceed"));
  private final Route route;
  private final DevTools devTools;

  public NetworkInterceptor(WebDriver driver, Route route) {
    if (!(driver instanceof HasDevTools)) {
      throw new IllegalArgumentException("WebDriver instance must implement HasDevTools");
    }
    this.route = Objects.requireNonNull(route, "Route to use must be set.");

    devTools = ((HasDevTools) driver).getDevTools();
    devTools.createSession();

    devTools.addListener(Fetch.requestPaused(), this::handleRequest);

    devTools.send(Fetch.enable(
      Optional.of(
        ImmutableList.of(
          new RequestPattern(Optional.empty(), Optional.of(ResourceType.Document), Optional.of(REQUEST)))),
      Optional.of(false)));
  }

  @Override
  public void close() {
  }

  private void handleRequest(RequestPaused incoming) {
    // Only handle incoming requests. Diligently ignore responses.
    if (incoming.getResponseStatusCode().isPresent() || incoming.getResponseErrorReason().isPresent()) {
      return;
    }

    // The incoming request is fully qualified, so try and extract the bits
    // that make sense. We use URI since that doesn't need us to have network
    // handlers for all protocols.
    HttpRequest req;
    try {
      Request cdpReq = incoming.getRequest();
      req = new HttpRequest(
        HttpMethod.valueOf(cdpReq.getMethod()),
        cdpReq.getUrl() + (cdpReq.getUrlFragment() != null ? cdpReq.getUrlFragment() : ""));

      cdpReq.getHeaders().forEach((key, value) -> req.addHeader(key, String.valueOf(value)));

      if (!route.matches(req)) {
        continueRequest(incoming);
        return;
      }

      HttpResponse res = route.execute(req);

      // Yes! We are using an instance equality check. This is a magic value
      if (res == PROCEED_WITH_REQUEST) {
        continueRequest(incoming);
        return;
      }

      ImmutableList.Builder<HeaderEntry> headers = ImmutableList.builder();
      res.getHeaderNames().forEach(
        name -> res.getHeaders(name).forEach(value -> headers.add(new HeaderEntry(name, value))));

      byte[] bytes = Contents.bytes(res.getContent());
      String body = bytes.length > 0 ? Base64.getEncoder().encodeToString(bytes) : null;

      devTools.send(Fetch.fulfillRequest(
        incoming.getRequestId(),
        res.getStatus(),
        headers.build(),
        Optional.ofNullable(body),
        Optional.empty()));
    } catch (Exception e) {
      LOG.log(
        Level.WARNING,
        String.format("Caught exception while handling %s: %s", incoming.getRequest().getUrl(), e.getMessage()),
        e);
      continueRequest(incoming);
    }
  }

  private void continueRequest(RequestPaused incoming) {
    devTools.send(Fetch.continueRequest(
      incoming.getRequestId(),
      Optional.empty(),
      Optional.empty(),
      Optional.empty(),
      Optional.empty()));
  }
}
