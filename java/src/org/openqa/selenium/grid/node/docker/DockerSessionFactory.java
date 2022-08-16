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

package org.openqa.selenium.grid.node.docker;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.PersistentCapabilities;
import org.openqa.selenium.RetrySessionRequestException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.docker.Container;
import org.openqa.selenium.docker.ContainerConfig;
import org.openqa.selenium.docker.ContainerInfo;
import org.openqa.selenium.docker.Device;
import org.openqa.selenium.docker.Docker;
import org.openqa.selenium.docker.Image;
import org.openqa.selenium.docker.Port;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.SlotMatcher;
import org.openqa.selenium.grid.node.ActiveSession;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ProtocolHandshake;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.ClientConfig;
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
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TimeZone;
import java.util.logging.Level;
import java.util.logging.Logger;

import static java.util.Optional.ofNullable;
import static org.openqa.selenium.docker.ContainerConfig.image;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;

public class DockerSessionFactory implements SessionFactory {

  private static final Logger LOG = Logger.getLogger(DockerSessionFactory.class.getName());

  private final Tracer tracer;
  private final HttpClient.Factory clientFactory;
  private final Duration sessionTimeout;
  private final Docker docker;
  private final URI dockerUri;
  private final Image browserImage;
  private final Capabilities stereotype;
  private final List<Device> devices;
  private final Image videoImage;
  private final DockerAssetsPath assetsPath;
  private final String networkName;
  private final boolean runningInDocker;
  private final SlotMatcher slotMatcher;

  public DockerSessionFactory(
    Tracer tracer,
    HttpClient.Factory clientFactory,
    Duration sessionTimeout,
    Docker docker,
    URI dockerUri,
    Image browserImage,
    Capabilities stereotype,
    List<Device> devices,
    Image videoImage,
    DockerAssetsPath assetsPath,
    String networkName,
    boolean runningInDocker) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.clientFactory = Require.nonNull("HTTP client", clientFactory);
    this.sessionTimeout = Require.nonNull("Session timeout", sessionTimeout);
    this.docker = Require.nonNull("Docker command", docker);
    this.dockerUri = Require.nonNull("Docker URI", dockerUri);
    this.browserImage = Require.nonNull("Docker browser image", browserImage);
    this.networkName = Require.nonNull("Docker network name", networkName);
    this.stereotype = ImmutableCapabilities.copyOf(
      Require.nonNull("Stereotype", stereotype));
    this.devices = Require.nonNull("Container devices", devices);
    this.videoImage = videoImage;
    this.assetsPath = assetsPath;
    this.runningInDocker = runningInDocker;
    this.slotMatcher = new DefaultSlotMatcher();
  }

  @Override
  public boolean test(Capabilities capabilities) {
    return slotMatcher.matches(stereotype, capabilities);
  }

  @Override
  public Either<WebDriverException, ActiveSession> apply(CreateSessionRequest sessionRequest) {
    LOG.info("Starting session for " + sessionRequest.getDesiredCapabilities());

    int port = runningInDocker ? 4444 : PortProber.findFreePort();
    try (Span span = tracer.getCurrentContext().createSpan("docker_session_factory.apply")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(AttributeKey.LOGGER_CLASS.getKey(),
                       EventAttribute.setValue(this.getClass().getName()));
      String logMessage = runningInDocker ? "Creating container..." :
                          "Creating container, mapping container port 4444 to " + port;
      LOG.info(logMessage);
      Container container = createBrowserContainer(port, sessionRequest.getDesiredCapabilities());
      container.start();
      ContainerInfo containerInfo = container.inspect();

      String containerIp = containerInfo.getIp();
      URL remoteAddress = getUrl(port, containerIp);
      ClientConfig clientConfig = ClientConfig
        .defaultConfig()
        .baseUrl(remoteAddress)
        .readTimeout(sessionTimeout);
      HttpClient client = clientFactory.createClient(clientConfig);

      attributeMap.put("docker.browser.image", EventAttribute.setValue(browserImage.toString()));
      attributeMap.put("container.port", EventAttribute.setValue(port));
      attributeMap.put("container.id", EventAttribute.setValue(container.getId().toString()));
      attributeMap.put("container.ip", EventAttribute.setValue(containerIp));
      attributeMap.put("docker.server.url", EventAttribute.setValue(remoteAddress.toString()));

      LOG.info(
        String.format("Waiting for server to start (container id: %s, url %s)",
                      container.getId(),
                      remoteAddress));
      try {
        waitForServerToStart(client, Duration.ofMinutes(1));
      } catch (TimeoutException e) {
        span.setAttribute(AttributeKey.ERROR.getKey(), true);
        span.setStatus(Status.CANCELLED);

        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                         EventAttribute.setValue(
                           "Unable to connect to docker server. Stopping container: " +
                           e.getMessage()));
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

        container.stop(Duration.ofMinutes(1));
        String message = String.format(
          "Unable to connect to docker server (container id: %s)", container.getId());
        LOG.warning(message);
        return Either.left(new RetrySessionRequestException(message));
      }
      LOG.info(String.format("Server is ready (container id: %s)", container.getId()));

      Command command = new Command(
          null,
          DriverCommand.NEW_SESSION(sessionRequest.getDesiredCapabilities()));
      ProtocolHandshake.Result result;
      Response response;
      try {
        result = new ProtocolHandshake().createSession(client, command);
        response = result.createResponse();
        attributeMap.put(AttributeKey.DRIVER_RESPONSE.getKey(),
                         EventAttribute.setValue(response.toString()));
      } catch (IOException | RuntimeException e) {
        span.setAttribute(AttributeKey.ERROR.getKey(), true);
        span.setStatus(Status.CANCELLED);

        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(
          AttributeKey.EXCEPTION_MESSAGE.getKey(),
          EventAttribute
            .setValue("Unable to create session. Stopping and  container: " + e.getMessage()));
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

        container.stop(Duration.ofMinutes(1));
        String message = "Unable to create session: " + e.getMessage();
        LOG.log(Level.WARNING, message, e);
        return Either.left(new SessionNotCreatedException(message));
      }

      SessionId id = new SessionId(response.getSessionId());
      Capabilities capabilities = new ImmutableCapabilities((Map<?, ?>) response.getValue());
      Capabilities mergedCapabilities = sessionRequest.getDesiredCapabilities().merge(capabilities);
      mergedCapabilities = addForwardCdpEndpoint(mergedCapabilities,
                                                 containerIp,
                                                 port,
                                                 id.toString());

      Container videoContainer = null;
      Optional<DockerAssetsPath> path = ofNullable(this.assetsPath);
      if (path.isPresent()) {
        // Seems we can store session assets
        String containerPath = path.get().getContainerPath(id);
        saveSessionCapabilities(mergedCapabilities, containerPath);
        String hostPath = path.get().getHostPath(id);
        videoContainer = startVideoContainer(mergedCapabilities, containerIp, hostPath);
      }

      Dialect downstream = sessionRequest.getDownstreamDialects().contains(result.getDialect()) ?
                           result.getDialect() :
                           W3C;
      attributeMap.put(
        AttributeKey.DOWNSTREAM_DIALECT.getKey(),
        EventAttribute.setValue(downstream.toString()));
      attributeMap.put(
        AttributeKey.DRIVER_RESPONSE.getKey(),
        EventAttribute.setValue(response.toString()));

      span.addEvent("Docker driver service created session", attributeMap);
      LOG.fine(String.format(
        "Created session: %s - %s (container id: %s)",
        id,
        mergedCapabilities,
        container.getId()));
      return Either.right(new DockerSession(
        container,
        videoContainer,
        tracer,
        client,
        id,
        remoteAddress,
        stereotype,
        mergedCapabilities,
        downstream,
        result.getDialect(),
        Instant.now(),
        assetsPath));
    }
  }

  private Capabilities addForwardCdpEndpoint(Capabilities sessionCapabilities, String containerIp,
                                             int port, String sessionId) {
    // We add this endpoint to go around the situation where a user wants to do CDP over
    // Dynamic Grid. In a conventional Grid setup, this is not needed because the browser will
    // be running on the same host where the Node is running. However, in Dynamic Grid, the Docker
    // Node is running on a different host/container. Therefore, we need to forward the websocket
    // connection to the container where the actual browser is running.
    String forwardCdpPath = String.format(
      "ws://%s:%s/session/%s/se/fwd",
      containerIp,
      port,
      sessionId);
    return new PersistentCapabilities(sessionCapabilities)
      .setCapability("se:forwardCdp", forwardCdpPath);
  }

  private Container createBrowserContainer(int port, Capabilities sessionCapabilities) {
    Map<String, String> browserContainerEnvVars = getBrowserContainerEnvVars(sessionCapabilities);
    long browserContainerShmMemorySize = 2147483648L; //2GB
    ContainerConfig containerConfig = image(browserImage)
      .env(browserContainerEnvVars)
      .shmMemorySize(browserContainerShmMemorySize)
      .network(networkName)
      .devices(devices);
    if (!runningInDocker) {
      containerConfig = containerConfig.map(Port.tcp(4444), Port.tcp(port));
    }
    return docker.create(containerConfig);
  }

  private Map<String, String> getBrowserContainerEnvVars(Capabilities sessionRequestCapabilities) {
    Optional<Dimension> screenResolution =
      ofNullable(getScreenResolution(sessionRequestCapabilities));
    Map<String, String> envVars = new HashMap<>();
    if (screenResolution.isPresent()) {
      envVars.put("SE_SCREEN_WIDTH", String.valueOf(screenResolution.get().getWidth()));
      envVars.put("SE_SCREEN_HEIGHT", String.valueOf(screenResolution.get().getHeight()));
    }
    Optional<TimeZone> timeZone = ofNullable(getTimeZone(sessionRequestCapabilities));
    timeZone.ifPresent(zone -> envVars.put("TZ", zone.getID()));
    // Passing env vars set to the child container
    Map<String, String> seEnvVars = System.getenv();
    seEnvVars.entrySet()
      .stream().filter(entry -> entry.getKey().startsWith("SE_"))
      .forEach(entry -> envVars.put(entry.getKey(), entry.getValue()));
    return envVars;
  }

  private Container startVideoContainer(Capabilities sessionCapabilities,
                                        String browserContainerIp, String hostPath) {
    if (!recordVideoForSession(sessionCapabilities)) {
      return null;
    }
    int videoPort = 9000;
    Map<String, String> envVars = getVideoContainerEnvVars(
      sessionCapabilities,
      browserContainerIp);
    Map<String, String> volumeBinds = Collections.singletonMap(hostPath, "/videos");
    ContainerConfig containerConfig = image(videoImage)
      .env(envVars)
      .bind(volumeBinds)
      .network(networkName);
    if (!runningInDocker) {
      videoPort = PortProber.findFreePort();
      containerConfig = containerConfig.map(Port.tcp(9000), Port.tcp(videoPort));
    }
    Container videoContainer = docker.create(containerConfig);
    videoContainer.start();
    String videoContainerIp = runningInDocker ? videoContainer.inspect().getIp() : "localhost";
    try {
      URL videoContainerUrl = new URL(String.format("http://%s:%s", videoContainerIp, videoPort));
      HttpClient videoClient = clientFactory.createClient(videoContainerUrl);
      LOG.fine(String.format("Waiting for video recording... (id: %s)", videoContainer.getId()));
      waitForServerToStart(videoClient, Duration.ofMinutes(1));
    } catch (Exception e) {
      videoContainer.stop(Duration.ofSeconds(10));
      String message = String.format(
        "Unable to verify video recording started (container id: %s), %s", videoContainer.getId(),
        e.getMessage());
      LOG.warning(message);
    }
    LOG.info(String.format("Video container started (id: %s)", videoContainer.getId()));
    return videoContainer;
  }

  private Map<String, String> getVideoContainerEnvVars(Capabilities sessionRequestCapabilities,
    String containerIp) {
    Map<String, String> envVars = new HashMap<>();
    envVars.put("DISPLAY_CONTAINER_NAME", containerIp);
    Optional<Dimension> screenResolution =
      ofNullable(getScreenResolution(sessionRequestCapabilities));
    screenResolution.ifPresent(dimension -> {
      envVars.put("SE_SCREEN_WIDTH", String.valueOf(dimension.getWidth()));
      envVars.put("SE_SCREEN_HEIGHT", String.valueOf(dimension.getHeight()));
    });
    return envVars;
  }

  private TimeZone getTimeZone(Capabilities sessionRequestCapabilities) {
    Optional<Object> timeZone =
      ofNullable(sessionRequestCapabilities.getCapability("se:timeZone"));
    if (timeZone.isPresent()) {
      String tz =  timeZone.get().toString();
      if (Arrays.asList(TimeZone.getAvailableIDs()).contains(tz)) {
        return TimeZone.getTimeZone(tz);
      }
    }
    return null;
  }

  private Dimension getScreenResolution(Capabilities sessionRequestCapabilities) {
    Optional<Object> screenResolution =
      ofNullable(sessionRequestCapabilities.getCapability("se:screenResolution"));
    if (!screenResolution.isPresent()) {
      return null;
    }
    try {
      String[] resolution = screenResolution.get().toString().split("x");
      int screenWidth = Integer.parseInt(resolution[0]);
      int screenHeight = Integer.parseInt(resolution[1]);
      if (screenWidth > 0 && screenHeight > 0) {
        return new Dimension(screenWidth, screenHeight);
      } else {
        LOG.warning("One of the values provided for screenResolution is negative, " +
          "defaults will be used. Received value: " + screenResolution);
      }
    } catch (Exception e) {
      LOG.warning("Values provided for screenResolution are not valid integers or " +
                  "either width or height are missing, defaults will be used." +
                  "Received value: " + screenResolution);
    }
    return null;
  }

  private boolean recordVideoForSession(Capabilities sessionRequestCapabilities) {
    Optional<Object> recordVideo =
      ofNullable(sessionRequestCapabilities.getCapability("se:recordVideo"));
    return recordVideo.isPresent() && Boolean.parseBoolean(recordVideo.get().toString());
  }

  private void saveSessionCapabilities(Capabilities sessionRequestCapabilities, String path) {
    String capsToJson = new Json().toJson(sessionRequestCapabilities);
    try {
      Files.createDirectories(Paths.get(path));
      Files.write(
        Paths.get(path, "sessionCapabilities.json"),
        capsToJson.getBytes(Charset.defaultCharset()));
    } catch (IOException e) {
      LOG.log(Level.WARNING, "Failed to save session capabilities", e);
    }
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

  private URL getUrl(int port, String containerIp) {
    try {
      String host = "localhost";
      if (runningInDocker) {
        host = containerIp;
      } else {
        if (dockerUri.getScheme().startsWith("tcp") || dockerUri.getScheme().startsWith("http")) {
          host = dockerUri.getHost();
        }
      }
      return new URL(String.format("http://%s:%s/wd/hub", host, port));
    } catch (MalformedURLException e) {
      throw new SessionNotCreatedException(e.getMessage(), e);
    }
  }
}
