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

package org.openqa.selenium.grid.docker;

import static org.openqa.selenium.docker.ContainerInfo.image;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.docker.Container;
import org.openqa.selenium.docker.Docker;
import org.openqa.selenium.docker.Image;
import org.openqa.selenium.docker.Port;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.node.ActiveSession;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ProtocolHandshake;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

public class DockerSessionFactory implements SessionFactory {

  public static final Logger LOG = Logger.getLogger(DockerSessionFactory.class.getName());
  private final HttpClient.Factory clientFactory;
  private final Docker docker;
  private final Image image;
  private final Capabilities stereotype;

  public DockerSessionFactory(
      HttpClient.Factory clientFactory,
      Docker docker,
      Image image,
      Capabilities stereotype) {
    this.clientFactory = Objects.requireNonNull(clientFactory, "HTTP client must be set.");
    this.docker = Objects.requireNonNull(docker, "Docker command must be set.");
    this.image = Objects.requireNonNull(image, "Docker image to use must be set.");
    this.stereotype = ImmutableCapabilities.copyOf(
        Objects.requireNonNull(stereotype, "Stereotype must be set."));
  }

  @Override
  public boolean test(Capabilities capabilities) {
    return stereotype.getCapabilityNames().stream()
        .map(name -> Objects.equals(stereotype.getCapability(name), capabilities.getCapability(name)))
        .reduce(Boolean::logicalAnd)
        .orElse(false);
  }

  @Override
  public Optional<ActiveSession> apply(CreateSessionRequest sessionRequest) {
    LOG.info("Starting session for " + sessionRequest.getCapabilities());
    int port = PortProber.findFreePort();
    URL remoteAddress = getUrl(port);
    HttpClient client = clientFactory.createClient(remoteAddress);

    LOG.info("Creating container, mapping container port 4444 to " + port);
    Container container = docker.create(image(image).map(Port.tcp(4444), Port.tcp(port)));
    container.start();

    LOG.info(String.format("Waiting for server to start (container id: %s)", container.getId()));
    try {
      waitForServerToStart(client, Duration.ofMinutes(1));
    } catch (TimeoutException e) {
      container.stop(Duration.ofMinutes(1));
      container.delete();
      LOG.warning(String.format(
          "Unable to connect to docker server (container id: %s)", container.getId()));
      return Optional.empty();
    }
    LOG.info(String.format("Server is ready (container id: %s)", container.getId()));

    Command command = new Command(
        null,
        DriverCommand.NEW_SESSION(sessionRequest.getCapabilities()));
    ProtocolHandshake.Result result;
    Response response;
    try {
      result = new ProtocolHandshake().createSession(client, command);
      response = result.createResponse();
    } catch (IOException | RuntimeException e) {
      container.stop(Duration.ofMinutes(1));
      container.delete();
      LOG.log(Level.WARNING, "Unable to create session: " + e.getMessage(), e);
      return Optional.empty();
    }

    SessionId id = new SessionId(response.getSessionId());
    Capabilities capabilities = new ImmutableCapabilities((Map<?, ?>) response.getValue());

    Dialect downstream = sessionRequest.getDownstreamDialects().contains(result.getDialect()) ?
                         result.getDialect() :
                         W3C;

    LOG.info(String.format(
        "Created session: %s - %s (container id: %s)",
        id,
        capabilities,
        container.getId()));
    return Optional.of(new DockerSession(
        container,
        client,
        id,
        remoteAddress,
        capabilities,
        downstream,
        result.getDialect()));
  }

  private void waitForServerToStart(HttpClient client, Duration duration) {
    Wait<Object> wait = new FluentWait<>(new Object())
        .withTimeout(duration)
        .ignoring(UncheckedIOException.class);

    wait.until(obj -> {
      HttpResponse response = client.execute(new HttpRequest(GET, "/status"));
      LOG.fine(string(response));
      return 200 == response.getStatus();
    });
  }

  private URL getUrl(int port) {
    try {
      return new URL(String.format("http://localhost:%s/wd/hub", port));
    } catch (MalformedURLException e) {
      throw new SessionNotCreatedException(e.getMessage(), e);
    }
  }
}
