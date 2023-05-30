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

import static org.openqa.selenium.remote.HttpSessionId.getSessionId;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.Route.combine;
import static org.openqa.selenium.remote.http.Route.delete;
import static org.openqa.selenium.remote.http.Route.get;
import static org.openqa.selenium.remote.http.Route.matching;
import static org.openqa.selenium.remote.http.Route.post;

import com.google.common.collect.ImmutableMap;
import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.ServiceLoader;
import java.util.Set;
import java.util.UUID;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.security.RequiresSecretFilter;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.locators.CustomLocator;
import org.openqa.selenium.remote.tracing.SpanDecorator;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.status.HasReadyState;

/**
 * A place where individual webdriver sessions are running. Those sessions may be in-memory, or only
 * reachable via localhost and a network. Or they could be something else entirely.
 *
 * <p>This class responds to the following URLs:
 *
 * <table summary="HTTP commands the Node understands">
 * <tr>
 * <th>Verb</th>
 * <th>URL Template</th>
 * <th>Meaning</th>
 * </tr>
 * <tr>
 * <td>POST</td>
 * <td>/se/grid/node/session</td>
 * <td>Attempts to start a new session for the given node. The posted data should be a
 * json-serialized {@link Capabilities} instance. Returns a serialized {@link Session}.
 * Subclasses of {@code Node} are expected to register the session with the
 * {@link org.openqa.selenium.grid.sessionmap.SessionMap}.</td>
 * </tr>
 * <tr>
 * <td>GET</td>
 * <td>/se/grid/node/session/{sessionId}</td>
 * <td>Finds the {@link Session} identified by {@code sessionId} and returns the JSON-serialized
 * form.</td>
 * </tr>
 * <tr>
 * <td>DELETE</td>
 * <td>/se/grid/node/session/{sessionId}</td>
 * <td>Stops the {@link Session} identified by {@code sessionId}. It is expected that this will
 * also cause the session to removed from the
 * {@link org.openqa.selenium.grid.sessionmap.SessionMap}.</td>
 * </tr>
 * <tr>
 * <td>GET</td>
 * <td>/se/grid/node/owner/{sessionId}</td>
 * <td>Allows the node to be queried about whether or not it owns the {@link Session} identified
 * by {@code sessionId}. This returns a boolean.</td>
 * </tr>
 * <tr>
 * <td>*</td>
 * <td>/session/{sessionId}/*</td>
 * <td>The request is forwarded to the {@link Session} identified by {@code sessionId}. When the
 * Quit command is called, the {@link Session} should remove itself from the
 * {@link org.openqa.selenium.grid.sessionmap.SessionMap}.</td>
 * </tr>
 * </table>
 */
public abstract class Node implements HasReadyState, Routable {

  private static final Logger LOG = Logger.getLogger(Node.class.getName());
  private static final BuildInfo INFO = new BuildInfo();
  private static final ImmutableMap<String, String> OS_INFO = loadOsInfo();
  protected final Tracer tracer;
  private final NodeId id;
  private final URI uri;
  private final Route routes;
  protected boolean draining;

  protected Node(Tracer tracer, NodeId id, URI uri, Secret registrationSecret) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.id = Require.nonNull("Node id", id);
    this.uri = Require.nonNull("URI", uri);
    Require.nonNull("Registration secret", registrationSecret);

    RequiresSecretFilter requiresSecret = new RequiresSecretFilter(registrationSecret);

    Set<CustomLocator> customLocators =
        StreamSupport.stream(ServiceLoader.load(CustomLocator.class).spliterator(), false)
            .collect(Collectors.toSet());

    if (!customLocators.isEmpty()) {
      String names =
          customLocators.stream()
              .map(CustomLocator::getLocatorName)
              .collect(Collectors.joining(", "));
      LOG.info("Binding additional locator mechanisms: " + names);
    }

    Json json = new Json();
    routes =
        combine(
            // "getSessionId" is aggressive about finding session ids, so this needs to be the last
            // route that is checked.
            matching(
                    req ->
                        getSessionId(req.getUri())
                            .map(SessionId::new)
                            .map(this::isSessionOwner)
                            .orElse(false))
                .to(() -> new ForwardWebDriverCommand(this))
                .with(spanDecorator("node.forward_command")),
            new CustomLocatorHandler(this, registrationSecret, customLocators),
            post("/session/{sessionId}/file")
                .to(params -> new UploadFile(this, sessionIdFrom(params)))
                .with(spanDecorator("node.upload_file")),
            post("/session/{sessionId}/se/file")
                .to(params -> new UploadFile(this, sessionIdFrom(params)))
                .with(spanDecorator("node.upload_file")),
            get("/session/{sessionId}/se/files")
                .to(params -> new DownloadFile(this, sessionIdFrom(params)))
                .with(spanDecorator("node.download_file")),
            post("/session/{sessionId}/se/files")
                .to(params -> new DownloadFile(this, sessionIdFrom(params)))
                .with(spanDecorator("node.download_file")),
            get("/se/grid/node/owner/{sessionId}")
                .to(params -> new IsSessionOwner(this, sessionIdFrom(params)))
                .with(spanDecorator("node.is_session_owner").andThen(requiresSecret)),
            delete("/se/grid/node/session/{sessionId}")
                .to(params -> new StopNodeSession(this, sessionIdFrom(params)))
                .with(spanDecorator("node.stop_session").andThen(requiresSecret)),
            get("/se/grid/node/session/{sessionId}")
                .to(params -> new GetNodeSession(this, sessionIdFrom(params)))
                .with(spanDecorator("node.get_session").andThen(requiresSecret)),
            post("/se/grid/node/session")
                .to(() -> new NewNodeSession(this, json))
                .with(spanDecorator("node.new_session").andThen(requiresSecret)),
            post("/se/grid/node/drain")
                .to(() -> new Drain(this, json))
                .with(spanDecorator("node.drain").andThen(requiresSecret)),
            get("/se/grid/node/status")
                .to(() -> req -> new HttpResponse().setContent(asJson(getStatus())))
                .with(spanDecorator("node.node_status")),
            get("/status").to(() -> new StatusHandler(this)).with(spanDecorator("node.status")));
  }

  private static ImmutableMap<String, String> loadOsInfo() {
    return ImmutableMap.of(
        "arch", System.getProperty("os.arch"),
        "name", System.getProperty("os.name"),
        "version", System.getProperty("os.version"));
  }

  private SessionId sessionIdFrom(Map<String, String> params) {
    return new SessionId(params.get("sessionId"));
  }

  private SpanDecorator spanDecorator(String name) {
    return new SpanDecorator(tracer, req -> name);
  }

  public NodeId getId() {
    return id;
  }

  public URI getUri() {
    return uri;
  }

  public String getNodeVersion() {
    return String.format("%s (revision %s)", INFO.getReleaseLabel(), INFO.getBuildRevision());
  }

  public ImmutableMap<String, String> getOsInfo() {
    return OS_INFO;
  }

  public abstract Either<WebDriverException, CreateSessionResponse> newSession(
      CreateSessionRequest sessionRequest);

  public abstract HttpResponse executeWebDriverCommand(HttpRequest req);

  public abstract Session getSession(SessionId id) throws NoSuchSessionException;

  public TemporaryFilesystem getUploadsFilesystem(SessionId id) throws IOException {
    throw new UnsupportedOperationException();
  }

  public TemporaryFilesystem getDownloadsFilesystem(UUID uuid) throws IOException {
    throw new UnsupportedOperationException();
  }

  public abstract HttpResponse uploadFile(HttpRequest req, SessionId id);

  public abstract HttpResponse downloadFile(HttpRequest req, SessionId id);

  public abstract void stop(SessionId id) throws NoSuchSessionException;

  public abstract boolean isSessionOwner(SessionId id);

  public abstract boolean isSupporting(Capabilities capabilities);

  public abstract NodeStatus getStatus();

  public abstract HealthCheck getHealthCheck();

  public boolean isDraining() {
    return draining;
  }

  public abstract void drain();

  @Override
  public boolean matches(HttpRequest req) {
    return routes.matches(req);
  }

  @Override
  public HttpResponse execute(HttpRequest req) {
    return routes.execute(req);
  }
}
