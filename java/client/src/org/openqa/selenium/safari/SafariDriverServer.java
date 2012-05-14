/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.safari;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkState;

import com.google.common.base.Joiner;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.net.PortProber;

import org.webbitserver.HttpControl;
import org.webbitserver.HttpHandler;
import org.webbitserver.HttpRequest;
import org.webbitserver.HttpResponse;
import org.webbitserver.WebServer;
import org.webbitserver.WebServers;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.logging.Logger;

/**
 * The server responsible for communicating with the SafariDriver extension.
 *
 * <p>This class is not thread safe.
 */
class SafariDriverServer {
  
  private static final Logger LOG = Logger.getLogger(SafariDriverServer.class.getName());

  private final int port;

  private final BlockingQueue<SafariDriverConnection> connections =
      new SynchronousQueue<SafariDriverConnection>();

  private WebServer server;

  /**
   * @param port The port the server should be started on, or 0 to use any
   *     free port.
   */
  public SafariDriverServer(int port) {
    checkArgument(port >= 0, "Port must be >= 0: %d", port);
    this.port = port;
  }

  /**
   * Starts the server if it is not already running.
   */
  public void start() {
    start(port);
  }

  private void start(int port) {
    if (server != null) {
      return;
    }

    if (port == 0) {
      port = PortProber.findFreePort();
    }

    server = WebServers.createWebServer(port)
        .add("/favicon.ico", new FaviconHandler())
        .add("/", new RootHttpHandler(port))
        .add("/wd", new SafariDriverWebSocketHandler(connections));

    server.start();
    LOG.info("Server started at " + server.getUri());
  }

  /**
   * Stops the server if it is running.
   */
  public void stop() {
    if (server != null) {
      LOG.info("Stopping server");
      try {
        server.stop().get(30, TimeUnit.SECONDS);
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new WebDriverException(e);
      } catch (ExecutionException e) {
        throw new WebDriverException(e);
      } catch (TimeoutException e) {
        throw new WebDriverException("timed out stopping server", e);
      }
      server = null;
    }
  }

  public String getUri() {
    checkState(server != null, "The server is not running; call #start()!");
    return "http://localhost:" + server.getPort();
  }

  /**
   * Waits for a new SafariDriverConnection.
   *
   * @param timeout How long to wait for the new connection.
   * @param unit Unit of time for {@code timeout}.
   * @return The new connection.
   * @throws InterruptedException If the timeout expires.
   */
  public SafariDriverConnection getConnection(long timeout, TimeUnit unit)
      throws InterruptedException {
    return connections.poll(timeout, unit);
  }
  
  private static class FaviconHandler implements HttpHandler {

    public void handleHttpRequest(HttpRequest request, HttpResponse response,
        HttpControl control) {
      response.status(204).end();
    }
  }

  /**
   * A simple {@link HttpHandler} installed at the root of the server. Returns
   * a static page that posts a message to the SafariDriver extension's
   * injected script, requesting it to connect to this server.
   *
   * <p>This initial step must be handled by a HttpHandler on the server instead
   * of a simple file because Safari extensions do not run for file:// URLs.
   */
  private static class RootHttpHandler implements HttpHandler {

    // TODO: To ensure the message stays in sync, this script should be compiled
    // using the //javascript/safari-driver source and saved as a resource in
    // the JAR. This woud also allow this logic to be shared with the other
    // language bindings.
    private static final String CONNECT_TEMPLATE = Joiner.on("\n").join(
        "<!DOCTYPE html>",
        "<h2>SafariDriver requesting connection at ws://localhost:%d/wd</h2>",
        "<script>",
        "// Must wait for onload so the injected script is loaded by the",
        "// SafariDriver extension.",
        "window.onload = function() {",
        "  window.postMessage({",
        "    'type': 'connect',",
        "    'origin': 'webdriver',",
        "    'url': 'ws://localhost:%d/wd'",
        "  }, '*');",
        "};",
        "</script>");

    private final int port;

    public RootHttpHandler(int port) {
      this.port = port;
    }

    public void handleHttpRequest(HttpRequest request, HttpResponse response,
        HttpControl control) {
      response.header("Content-type", "text/html")
          .content(String.format(CONNECT_TEMPLATE, port, port))
          .end();
    }
  }
}
