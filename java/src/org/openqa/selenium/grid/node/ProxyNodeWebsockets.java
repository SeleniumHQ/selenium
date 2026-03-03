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

package org.openqa.selenium.grid.node;

import static org.openqa.selenium.internal.Debug.getDebugLogLevel;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Stream;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.devtools.CdpEndpointFinder;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.BinaryMessage;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.CloseMessage;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.TextMessage;
import org.openqa.selenium.remote.http.UrlTemplate;
import org.openqa.selenium.remote.http.WebSocket;

public class ProxyNodeWebsockets
    implements BiFunction<String, Consumer<Message>, Optional<Consumer<Message>>> {

  private static final UrlTemplate CDP_TEMPLATE = new UrlTemplate("/session/{sessionId}/se/cdp");
  private static final UrlTemplate BIDI_TEMPLATE = new UrlTemplate("/session/{sessionId}/se/bidi");
  private static final UrlTemplate FWD_TEMPLATE = new UrlTemplate("/session/{sessionId}/se/fwd");
  private static final UrlTemplate VNC_TEMPLATE = new UrlTemplate("/session/{sessionId}/se/vnc");
  private static final Logger LOG = Logger.getLogger(ProxyNodeWebsockets.class.getName());
  private static final Set<String> CDP_ENDPOINT_CAPS =
      Set.of("goog:chromeOptions", "ms:edgeOptions");
  private final HttpClient.Factory clientFactory;
  private final Node node;
  private final String gridSubPath;

  public ProxyNodeWebsockets(HttpClient.Factory clientFactory, Node node, String gridSubPath) {
    this.clientFactory = Objects.requireNonNull(clientFactory);
    this.node = Objects.requireNonNull(node);
    this.gridSubPath = gridSubPath;
  }

  @Override
  public Optional<Consumer<Message>> apply(String uri, Consumer<Message> downstream) {
    UrlTemplate.Match fwdMatch = FWD_TEMPLATE.match(uri, gridSubPath);
    UrlTemplate.Match cdpMatch = CDP_TEMPLATE.match(uri, gridSubPath);
    UrlTemplate.Match bidiMatch = BIDI_TEMPLATE.match(uri, gridSubPath);
    UrlTemplate.Match vncMatch = VNC_TEMPLATE.match(uri, gridSubPath);

    if (bidiMatch == null && cdpMatch == null && vncMatch == null && fwdMatch == null) {
      return Optional.empty();
    }

    Optional<UrlTemplate.Match> firstMatch =
        Stream.of(fwdMatch, cdpMatch, bidiMatch, vncMatch).filter(Objects::nonNull).findFirst();

    if (firstMatch.isEmpty()) {
      LOG.warning("No session id found in uri " + uri);
      return Optional.empty();
    }

    String sessionId = firstMatch.get().getParameters().get("sessionId");

    LOG.fine("Matching websockets for session id: " + sessionId);
    SessionId id = new SessionId(sessionId);

    if (!node.isSessionOwner(id)) {
      LOG.warning("Not owner of " + id);
      return Optional.empty();
    }

    // ensure one session does not open to many connections, this might have a negative impact on
    // the grid health
    if (!node.tryAcquireConnection(id)) {
      LOG.warning("Too many websocket connections initiated by " + id);
      return Optional.empty();
    }

    try {
      Session session = node.getSession(id);
      Capabilities caps = session.getCapabilities();
      LOG.fine("Scanning for endpoint: " + caps);

      // Used by the ForwardingListener to notify the node that the session is still active
      Consumer<SessionId> sessionConsumer = node::isSessionOwner;

      Optional<Consumer<Message>> endpoint;
      if (bidiMatch != null) {
        endpoint = findBiDiEndpoint(downstream, caps, sessionConsumer, id);
      } else if (vncMatch != null) {
        // Passing a fake consumer to the ForwardingListener to avoid sending a session notification
        // when VNC is used.
        sessionConsumer = fakeConsumer -> {};
        endpoint = findVncEndpoint(downstream, caps, sessionConsumer, id);
      } else if (fwdMatch != null) {
        // This match happens when a user wants to do CDP over Dynamic Grid
        LOG.info("Matched endpoint where CDP connection is being forwarded");
        endpoint = findCdpEndpoint(downstream, caps, sessionConsumer, id);
      } else if (caps.getCapabilityNames().contains("se:forwardCdp")) {
        LOG.info("Found endpoint where CDP connection needs to be forwarded");
        endpoint = findForwardCdpEndpoint(downstream, caps, sessionConsumer, id);
      } else {
        endpoint = findCdpEndpoint(downstream, caps, sessionConsumer, id);
      }

      // If no endpoint could be established the connection slot must be released;
      if (endpoint.isEmpty()) {
        node.releaseConnection(id);
      }

      return endpoint;
    } catch (Exception e) {
      node.releaseConnection(id);
      LOG.log(Level.WARNING, "Failed to establish WebSocket endpoint for session " + id, e);
      return Optional.empty();
    }
  }

  private Optional<Consumer<Message>> findCdpEndpoint(
      Consumer<Message> downstream,
      Capabilities caps,
      Consumer<SessionId> sessionConsumer,
      SessionId sessionId) {

    for (String cdpEndpointCap : CDP_ENDPOINT_CAPS) {
      Optional<URI> reportedUri = CdpEndpointFinder.getReportedUri(cdpEndpointCap, caps);
      Optional<HttpClient> client =
          reportedUri.map(
              uri ->
                  CdpEndpointFinder.getHttpClient(
                      clientFactory, uri, ClientConfig.defaultConfig()));
      Optional<URI> cdpUri;

      try {
        cdpUri = client.flatMap(CdpEndpointFinder::getCdpEndPoint);
      } catch (Exception e) {
        try {
          client.ifPresent(HttpClient::close);
        } catch (Exception ex) {
          e.addSuppressed(ex);
        }
        throw e;
      }

      if (cdpUri.isPresent()) {
        LOG.log(getDebugLogLevel(), String.format("Endpoint found in %s", cdpEndpointCap));
        return cdpUri.map(cdp -> createWsEndPoint(cdp, downstream, sessionConsumer, sessionId));
      } else {
        try {
          client.ifPresent(HttpClient::close);
        } catch (Exception e) {
          LOG.log(
              Level.FINE,
              "failed to close the http client used to check the reported CDP endpoint: "
                  + reportedUri.get(),
              e);
        }
      }
    }
    return Optional.empty();
  }

  private Optional<Consumer<Message>> findBiDiEndpoint(
      Consumer<Message> downstream,
      Capabilities caps,
      Consumer<SessionId> sessionConsumer,
      SessionId sessionId) {
    try {
      URI uri = new URI(String.valueOf(caps.getCapability("se:gridWebSocketUrl")));
      return Optional.of(uri)
          .map(bidi -> createWsEndPoint(bidi, downstream, sessionConsumer, sessionId));
    } catch (URISyntaxException e) {
      LOG.warning("Unable to create URI from: " + caps.getCapability("webSocketUrl"));
      return Optional.empty();
    }
  }

  private Optional<Consumer<Message>> findForwardCdpEndpoint(
      Consumer<Message> downstream,
      Capabilities caps,
      Consumer<SessionId> sessionConsumer,
      SessionId sessionId) {
    // When using Dynamic Grid, we need to connect to a container before using the debuggerAddress
    try {
      URI uri = new URI(String.valueOf(caps.getCapability("se:forwardCdp")));
      return Optional.of(uri)
          .map(cdp -> createWsEndPoint(cdp, downstream, sessionConsumer, sessionId));
    } catch (URISyntaxException e) {
      LOG.warning("Unable to create URI from: " + caps.getCapability("se:forwardCdp"));
      return Optional.empty();
    }
  }

  private Optional<Consumer<Message>> findVncEndpoint(
      Consumer<Message> downstream,
      Capabilities caps,
      Consumer<SessionId> sessionConsumer,
      SessionId sessionId) {
    String vncLocalAddress = (String) caps.getCapability("se:vncLocalAddress");
    if (vncLocalAddress == null || vncLocalAddress.trim().isEmpty()) {
      LOG.warning("No VNC endpoint address in capabilities");
      return Optional.empty();
    }
    Optional<URI> vncUri;
    try {
      vncUri = Optional.of(new URI(vncLocalAddress));
    } catch (URISyntaxException e) {
      LOG.warning("Invalid URI for endpoint " + vncLocalAddress);
      return Optional.empty();
    }
    LOG.log(getDebugLogLevel(), String.format("Endpoint found in %s", "se:vncLocalAddress"));
    return vncUri.map(vnc -> createWsEndPoint(vnc, downstream, sessionConsumer, sessionId));
  }

  private Consumer<Message> createWsEndPoint(
      URI uri,
      Consumer<Message> downstream,
      Consumer<SessionId> sessionConsumer,
      SessionId sessionId) {
    Require.nonNull("downstream", downstream);
    Require.nonNull("uri", uri);
    Require.nonNull("sessionConsumer", sessionConsumer);
    Require.nonNull("sessionId", sessionId);

    LOG.info("Establishing connection to " + uri);

    AtomicBoolean connectionReleased = new AtomicBoolean(false);
    // Set to true as soon as the browser signals it is closing so the send lambda can stop
    // forwarding data frames without racing against the JDK WebSocket output stream being closed.
    AtomicBoolean upstreamClosing = new AtomicBoolean(false);

    HttpClient client = clientFactory.createClient(ClientConfig.defaultConfig().baseUri(uri));
    try {
      WebSocket upstream =
          client.openSocket(
              new HttpRequest(GET, uri.toString()),
              new ForwardingListener(
                  node,
                  downstream,
                  sessionConsumer,
                  sessionId,
                  connectionReleased,
                  client,
                  upstreamClosing));

      return (msg) -> {
        // Fast path: once the browser has signalled close, there is no point sending further
        // data frames — the JDK WebSocket output is already closing and the send would either
        // be dropped or throw "Output closed".  For the CloseMessage echo we skip the actual
        // network write (the JDK stack handles the protocol-level echo internally when it fires
        // onClose) and go straight to resource cleanup.
        if (upstreamClosing.get()) {
          if (msg instanceof CloseMessage) {
            if (connectionReleased.compareAndSet(false, true)) {
              node.releaseConnection(sessionId);
              try {
                client.close();
              } catch (Exception e) {
                LOG.log(Level.FINE, "Failed to close client after upstream close for " + uri, e);
              }
            }
          } else {
            LOG.log(Level.FINE, "Dropping in-flight data frame for closing session " + sessionId);
          }
          return;
        }

        // Slow path: upstream is (was) open — attempt the send and catch the narrow race where
        // the browser closes between the upstreamClosing check above and the actual write.
        try {
          upstream.send(msg);
        } catch (Exception e) {
          LOG.log(
              Level.FINE,
              "Could not forward message to browser WebSocket for session "
                  + sessionId
                  + " (connection likely closed concurrently)",
              e);
          if (connectionReleased.compareAndSet(false, true)) {
            node.releaseConnection(sessionId);
            try {
              client.close();
            } catch (Exception ce) {
              LOG.log(Level.FINE, "Failed to close client after send error for " + uri, ce);
            }
          }
          return;
        }
        if (msg instanceof CloseMessage) {
          if (connectionReleased.compareAndSet(false, true)) {
            node.releaseConnection(sessionId);
          }
          try {
            client.close();
          } catch (Exception e) {
            LOG.log(Level.WARNING, "Failed to shutdown the client of " + uri, e);
          }
        }
      };
    } catch (Exception e) {
      LOG.log(Level.WARNING, "Connecting to upstream websocket failed", e);
      client.close();
      throw e;
    }
  }

  private static class ForwardingListener implements WebSocket.Listener {
    private final Node node;
    private final Consumer<Message> downstream;
    private final Consumer<SessionId> sessionConsumer;
    private final SessionId sessionId;
    private final AtomicBoolean connectionReleased;
    private final HttpClient client;
    private final AtomicBoolean upstreamClosing;

    public ForwardingListener(
        Node node,
        Consumer<Message> downstream,
        Consumer<SessionId> sessionConsumer,
        SessionId sessionId,
        AtomicBoolean connectionReleased,
        HttpClient client,
        AtomicBoolean upstreamClosing) {
      this.node = node;
      this.downstream = Objects.requireNonNull(downstream);
      this.sessionConsumer = Objects.requireNonNull(sessionConsumer);
      this.sessionId = Objects.requireNonNull(sessionId);
      this.connectionReleased = Objects.requireNonNull(connectionReleased);
      this.client = Objects.requireNonNull(client);
      this.upstreamClosing = Objects.requireNonNull(upstreamClosing);
    }

    @Override
    public void onBinary(byte[] data) {
      downstream.accept(new BinaryMessage(data));
      sessionConsumer.accept(sessionId);
    }

    @Override
    public void onClose(int code, String reason) {
      // Signal the send lambda before forwarding the close downstream so that any data frames
      // still queued in the Netty pipeline are discarded rather than attempted on a closing stream.
      upstreamClosing.set(true);
      downstream.accept(new CloseMessage(code, reason));
      if (connectionReleased.compareAndSet(false, true)) {
        node.releaseConnection(sessionId);
        // Close the HttpClient eagerly so the connection slot is freed even if the client-side
        // Close echo never arrives (e.g. the client dropped the TCP connection).
        try {
          client.close();
        } catch (Exception e) {
          LOG.log(Level.FINE, "Failed to close client on upstream WebSocket close", e);
        }
      }
    }

    @Override
    public void onText(CharSequence data) {
      downstream.accept(new TextMessage(data));
      sessionConsumer.accept(sessionId);
    }

    @Override
    public void onError(Throwable cause) {
      upstreamClosing.set(true);
      LOG.log(Level.WARNING, "Error proxying websocket command", cause);
      if (connectionReleased.compareAndSet(false, true)) {
        node.releaseConnection(sessionId);
        try {
          client.close();
        } catch (Exception e) {
          LOG.log(Level.FINE, "Failed to close client after WebSocket error", e);
        }
      }
    }
  }
}
