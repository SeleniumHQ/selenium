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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.docker.Container;
import org.openqa.selenium.docker.ContainerInfo;
import org.openqa.selenium.docker.Docker;
import org.openqa.selenium.docker.Image;
import org.openqa.selenium.docker.Port;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.node.ActiveSession;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.internal.Require;
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
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

import static org.openqa.selenium.docker.ContainerConfig.image;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;

public class DockerSessionFactory implements SessionFactory {

  private static final Logger LOG = Logger.getLogger(DockerSessionFactory.class.getName());

  private final Tracer tracer;
  private final HttpClient.Factory clientFactory;
  private final Docker docker;
  private final URI dockerUri;
  private final Image browserImage;
  private final Capabilities stereotype;
  private boolean isVideoRecordingAvailable;
  private Image videoImage;
  private Path storagePath;

  public DockerSessionFactory(
      Tracer tracer,
      HttpClient.Factory clientFactory,
      Docker docker,
      URI dockerUri,
      Image browserImage,
      Capabilities stereotype) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.clientFactory = Require.nonNull("HTTP client", clientFactory);
    this.docker = Require.nonNull("Docker command", docker);
    this.dockerUri = Require.nonNull("Docker URI", dockerUri);
    this.browserImage = Require.nonNull("Docker browser image", browserImage);
    this.stereotype = ImmutableCapabilities.copyOf(
        Require.nonNull("Stereotype", stereotype));
    this.isVideoRecordingAvailable = false;
  }

  public DockerSessionFactory(Tracer tracer, HttpClient.Factory clientFactory, Docker docker, URI dockerUri,
    Image browserImage, Capabilities stereotype, Image videoImage, Path storagePath) {
    this(tracer, clientFactory, docker, dockerUri, browserImage, stereotype);
    this.isVideoRecordingAvailable = true;
    this.videoImage = videoImage;
    this.storagePath = storagePath;
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

    try (Span span = tracer.getCurrentContext().createSpan("docker_session_factory.apply")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(AttributeKey.LOGGER_CLASS.getKey(),
                       EventAttribute.setValue(this.getClass().getName()));
      LOG.info("Creating container, mapping container port 4444 to " + port);
      Container container = docker.create(image(browserImage).map(Port.tcp(4444), Port.tcp(port)));
      container.start();
      ContainerInfo containerInfo = container.inspect();

      attributeMap.put("docker.browser.image", EventAttribute.setValue(browserImage.toString()));
      attributeMap.put("container.port", EventAttribute.setValue(port));
      attributeMap.put("container.id", EventAttribute.setValue(container.getId().toString()));
      attributeMap.put("container.ip", EventAttribute.setValue(containerInfo.getIp()));
      attributeMap.put("docker.server.url", EventAttribute.setValue(remoteAddress.toString()));

      LOG.info(String.format("Waiting for server to start (container id: %s)", container.getId()));
      try {
        waitForServerToStart(client, Duration.ofMinutes(1));
      } catch (TimeoutException e) {
        span.setAttribute("error", true);
        span.setStatus(Status.CANCELLED);

        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                         EventAttribute.setValue("Unable to connect to docker server. Stopping container: " + e.getMessage()));
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

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
        attributeMap.put(AttributeKey.DRIVER_RESPONSE.getKey(), EventAttribute.setValue(response.toString()));
      } catch (IOException | RuntimeException e) {
        span.setAttribute("error", true);
        span.setStatus(Status.CANCELLED);

        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                         EventAttribute.setValue("Unable to create session. Stopping and  container: " + e.getMessage()));
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

        container.stop(Duration.ofMinutes(1));
        container.delete();
        LOG.log(Level.WARNING, "Unable to create session: " + e.getMessage(), e);
        return Optional.empty();
      }

      SessionId id = new SessionId(response.getSessionId());
      Capabilities capabilities = new ImmutableCapabilities((Map<?, ?>) response.getValue());
      Container videoContainer = null;
      if (isVideoRecordingAvailable && recordVideoForSession(sessionRequest.getCapabilities())) {
        Map<String, String> envVars = new HashMap<>();
        envVars.put("DISPLAY_CONTAINER_NAME", containerInfo.getIp());
        envVars.put("FILE_NAME", String.format("%s.mp4", id));
        Map<String, String> volumeBinds = new HashMap<>();
        volumeBinds.put(storagePath.toString(), "/videos");
        videoContainer = docker.create(image(videoImage).env(envVars).bind(volumeBinds));
        videoContainer.start();
      }

      Dialect downstream = sessionRequest.getDownstreamDialects().contains(result.getDialect()) ?
                           result.getDialect() :
                           W3C;
      attributeMap.put(AttributeKey.DOWNSTREAM_DIALECT.getKey(), EventAttribute.setValue(downstream.toString()));
      attributeMap.put(AttributeKey.DRIVER_RESPONSE.getKey(), EventAttribute.setValue(response.toString()));

      span.addEvent("Docker driver service created session", attributeMap);
      LOG.fine(String.format(
          "Created session: %s - %s (container id: %s)",
          id,
          capabilities,
          container.getId()));
      return Optional.of(new DockerSession(
        container,
        videoContainer,
        tracer,
        client,
        id,
        remoteAddress,
        stereotype,
        capabilities,
        downstream,
        result.getDialect(),
        Instant.now()));
    }
  }

  private boolean recordVideoForSession(Capabilities sessionRequestCapabilities) {
      Object rawSeleniumOptions = sessionRequestCapabilities.getCapability("se:options");
      if (rawSeleniumOptions instanceof Map) {
          @SuppressWarnings("unchecked") Map<String, Object> seleniumOptions = (Map<String, Object>) rawSeleniumOptions;
          return Boolean.parseBoolean(seleniumOptions.getOrDefault("recordVideo", false).toString());
      }
      return false;
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
      String host = "localhost";
      if (dockerUri.getScheme().startsWith("tcp") || dockerUri.getScheme().startsWith("http")) {
        host = dockerUri.getHost();
      }
      return new URL(String.format("http://%s:%s/wd/hub", host, port));
    } catch (MalformedURLException e) {
      throw new SessionNotCreatedException(e.getMessage(), e);
    }
  }
}
