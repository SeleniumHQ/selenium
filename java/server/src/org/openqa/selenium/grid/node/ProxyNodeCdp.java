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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.chromium.ChromiumDevToolsLocator;
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
import java.util.Objects;
import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.logging.Level;
import java.util.logging.Logger;

import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class ProxyNodeCdp implements BiFunction<String, Consumer<Message>, Optional<Consumer<Message>>> {

  private static final UrlTemplate CDP_TEMPLATE = new UrlTemplate("/session/{sessionId}/se/cdp");
  private static final Logger LOG = Logger.getLogger(ProxyNodeCdp.class.getName());
  private final HttpClient.Factory clientFactory;
  private final Node node;

  public ProxyNodeCdp(HttpClient.Factory clientFactory, Node node) {
    this.clientFactory = Objects.requireNonNull(clientFactory);
    this.node = Objects.requireNonNull(node);
  }

  @Override
  public Optional<Consumer<Message>> apply(String uri, Consumer<Message> downstream) {
    UrlTemplate.Match match = CDP_TEMPLATE.match(uri);
    if (match == null) {
      return Optional.empty();
    }

    LOG.fine("Matching CDP session for " + match.getParameters().get("sessionId"));

    SessionId id = new SessionId(match.getParameters().get("sessionId"));

    if (!node.isSessionOwner(id)) {
      LOG.info("Not owner of " + id);
      return Optional.empty();
    }

    Session session = node.getSession(id);
    Capabilities caps = session.getCapabilities();

    LOG.fine("Scanning for CDP endpoint: " + caps);

    // Using strings here to avoid Node depending upon specific drivers.
    Optional<URI> cdpUri = ChromiumDevToolsLocator.getReportedUri("goog:chromeOptions", caps)
      .flatMap(reported -> ChromiumDevToolsLocator.getCdpEndPoint(clientFactory, reported));
    if (cdpUri.isPresent()) {
      LOG.fine("Chrome endpoint found");
      return cdpUri.map(cdp -> createCdpEndPoint(cdp, downstream));
    }

    LOG.fine("Searching for edge options");
    cdpUri = ChromiumDevToolsLocator.getReportedUri("ms:edgeOptions", caps)
      .flatMap(reported -> ChromiumDevToolsLocator.getCdpEndPoint(clientFactory, reported));
    return cdpUri.map(cdp -> createCdpEndPoint(cdp, downstream));
  }

  private Consumer<Message> createCdpEndPoint(URI uri, Consumer<Message> downstream) {
    Objects.requireNonNull(uri);

    LOG.info("Establishing CDP connection to " + uri);

    HttpClient client = clientFactory.createClient(ClientConfig.defaultConfig().baseUri(uri));
    WebSocket upstream = client.openSocket(new HttpRequest(GET, uri.toString()), new ForwardingListener(downstream));
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
      LOG.log(Level.WARNING, "Error proxying CDP command", cause);
    }
  }
}
