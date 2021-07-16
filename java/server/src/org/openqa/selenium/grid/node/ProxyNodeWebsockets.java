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

import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.devtools.CdpEndpointFinder;
import org.openqa.selenium.grid.data.Session;
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

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Objects;
import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.logging.Level;
import java.util.logging.Logger;

import static org.openqa.selenium.internal.Debug.getDebugLogLevel;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class ProxyNodeWebsockets implements BiFunction<String, Consumer<Message>,
  Optional<Consumer<Message>>> {

  private static final UrlTemplate CDP_TEMPLATE = new UrlTemplate("/session/{sessionId}/se/cdp");
  private static final UrlTemplate VNC_TEMPLATE = new UrlTemplate("/session/{sessionId}/se/vnc");
  private static final Logger LOG = Logger.getLogger(ProxyNodeWebsockets.class.getName());
  private static final ImmutableSet<String> CDP_ENDPOINT_CAPS =
    ImmutableSet.of("goog:chromeOptions",
                    "moz:debuggerAddress",
                    "ms:edgeOptions");
  private final HttpClient.Factory clientFactory;
  private final Node node;


  public ProxyNodeWebsockets(HttpClient.Factory clientFactory, Node node) {
    this.clientFactory = Objects.requireNonNull(clientFactory);
    this.node = Objects.requireNonNull(node);
  }

  @Override
  public Optional<Consumer<Message>> apply(String uri, Consumer<Message> downstream) {
    UrlTemplate.Match cdpMatch = CDP_TEMPLATE.match(uri);
    UrlTemplate.Match vncMatch = VNC_TEMPLATE.match(uri);

    if (cdpMatch == null && vncMatch == null) {
      return Optional.empty();
    }

    String sessionId = cdpMatch != null ?
                       cdpMatch.getParameters().get("sessionId") :
                       vncMatch.getParameters().get("sessionId");

    LOG.fine("Matching websockets for session id: " + sessionId);
    SessionId id = new SessionId(sessionId);

    if (!node.isSessionOwner(id)) {
      LOG.info("Not owner of " + id);
      return Optional.empty();
    }

    Session session = node.getSession(id);
    Capabilities caps = session.getCapabilities();
    LOG.fine("Scanning for endpoint: " + caps);

    if (cdpMatch != null) {
      return findCdpEndpoint(downstream, caps);
    }
    return findVncEndpoint(downstream, caps);
  }

  private Optional<Consumer<Message>> findCdpEndpoint(Consumer<Message> downstream,
                                                      Capabilities caps) {
    // Using strings here to avoid Node depending upon specific drivers.
    for (String cdpEndpointCap : CDP_ENDPOINT_CAPS) {
      Optional<URI> cdpUri = CdpEndpointFinder.getReportedUri(cdpEndpointCap, caps)
        .flatMap(reported -> CdpEndpointFinder.getCdpEndPoint(clientFactory, reported));
      if (cdpUri.isPresent()) {
        LOG.log(getDebugLogLevel(), String.format("Endpoint found in %s", cdpEndpointCap));
        return cdpUri.map(cdp -> createWsEndPoint(cdp, downstream));
      }
    }
    return Optional.empty();
  }

  private Optional<Consumer<Message>> findVncEndpoint(Consumer<Message> downstream,
                                                      Capabilities caps) {
    String vncLocalAddress = (String) caps.getCapability("se:vncLocalAddress");
    Optional<URI> vncUri;
    try {
      vncUri = Optional.of(new URI(vncLocalAddress));
    } catch (URISyntaxException e) {
      LOG.warning("Invalid URI for endpoint " + vncLocalAddress);
      return Optional.empty();
    }
    LOG.log(getDebugLogLevel(), String.format("Endpoint found in %s", "se:vncLocalAddress"));
    return vncUri.map(vnc -> createWsEndPoint(vnc, downstream));
  }

  private Consumer<Message> createWsEndPoint(URI uri, Consumer<Message> downstream) {
    Objects.requireNonNull(uri);

    LOG.info("Establishing connection to " + uri);

    HttpClient client = clientFactory.createClient(ClientConfig.defaultConfig().baseUri(uri));
    WebSocket upstream = client.openSocket(
      new HttpRequest(GET, uri.toString()), new ForwardingListener(downstream));
    return upstream::send;
  }

  private static class ForwardingListener implements WebSocket.Listener {
    private final Consumer<Message> downstream;

    public ForwardingListener(Consumer<Message> downstream) {
      this.downstream = Objects.requireNonNull(downstream);
    }

    @Override
    public void onBinary(byte[] data) {
      downstream.accept(new BinaryMessage(data));
    }

    @Override
    public void onClose(int code, String reason) {
      downstream.accept(new CloseMessage(code, reason));
    }

    @Override
    public void onText(CharSequence data) {
      downstream.accept(new TextMessage(data));
    }

    @Override
    public void onError(Throwable cause) {
      LOG.log(Level.WARNING, "Error proxying websocket command", cause);
    }
  }
}
