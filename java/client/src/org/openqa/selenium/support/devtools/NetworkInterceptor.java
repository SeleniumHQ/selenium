// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.support.devtools;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.devtools.HasDevTools;
import org.openqa.selenium.devtools.idealized.fetch.model.RequestPaused;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;

import java.io.Closeable;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

/**
 * Provides a mechanism for stubbing out responses to requests in drivers which
 * implement {@link HasDevTools}. Usage is done by specifying a {@link Route},
 * which will be checked for every request to see if that request should be
 * handled or not. Note that the URLs given to the {@code Route} will be fully
 * qualified.
 * <p>
 * Example usage:
 * <p>
 * <code>
 *   Route route = Route.matching(req -&gt; GET == req.getMethod() &amp;&amp; req.getUri().endsWith("/example"))
 *     .to(() -&gt; req -&gt; new HttpResponse().setContent(Contents.utf8String("Hello, World!")));
 *
 *   try (NetworkInterceptor interceptor = new NetworkInterceptor(driver, route)) {
 *     // Your code here.
 *   }
 * </code>
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
    this.route = Require.nonNull("Route", route);

    devTools = ((HasDevTools) driver).getDevTools();
    devTools.createSession();

    devTools.addListener(devTools.getDomains().fetch().requestPaused(), this::handleRequest);

    devTools.send(devTools.getDomains().fetch().enable(Optional.empty(), false));
  }

  @Override
  public void close() {
  }

  private void handleRequest(RequestPaused incoming) {
    if (!incoming.getRequest().isPresent()) {
      continueRequest(incoming);
      return;
    }

    // The incoming request is fully qualified, so try and extract the bits
    // that make sense. We use URI since that doesn't need us to have network
    // handlers for all protocols.
    try {
      HttpRequest req = incoming.getRequest().orElseThrow(() -> new DevToolsException("No request found"));
      LOG.fine(req.toString());

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

      devTools.send(devTools.getDomains().fetch().fulfillRequest(incoming.getRequestId(), res));
    } catch (Exception e) {
      HttpRequest req = incoming.getRequest().orElseGet(() -> new HttpRequest(GET, "/no/request/has/been/found"));

      LOG.log(
        Level.WARNING,
        String.format("Caught exception while handling %s: %s", req, e.getMessage()),
        e);
      continueRequest(incoming);
    }
  }

  private void continueRequest(RequestPaused incoming) {
    devTools.send(devTools.getDomains().fetch().continueRequest(incoming.getRequestId()));
  }
}
