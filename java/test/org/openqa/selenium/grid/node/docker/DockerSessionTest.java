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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InOrder;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.docker.Container;
import org.openqa.selenium.docker.ContainerId;
import org.openqa.selenium.docker.ContainerLogs;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Tracer;

@Tag("UnitTests")
class DockerSessionTest {

  @TempDir Path tempDir;

  private Container browserContainer;
  private Container videoContainer;
  private Tracer tracer;
  private HttpClient httpClient;
  private SessionId sessionId;
  private DockerAssetsPath assetsPath;

  @BeforeEach
  void setUp() throws Exception {
    browserContainer = mock(Container.class);
    videoContainer = mock(Container.class);
    tracer = mock(Tracer.class);
    httpClient = mock(HttpClient.class);

    when(httpClient.execute(any(HttpRequest.class))).thenReturn(new HttpResponse());
    when(browserContainer.isRunning()).thenReturn(true);

    sessionId = new SessionId("test-session-id");
    assetsPath = new DockerAssetsPath(tempDir.toString(), tempDir.toString());

    when(browserContainer.getLogs())
        .thenReturn(new ContainerLogs(new ContainerId("browser-id"), Contents.empty()));
  }

  private DockerSession createSession(Container video) throws Exception {
    return createSession(video, Duration.ofMinutes(1), Duration.ofSeconds(10));
  }

  private DockerSession createSession(
      Container video, Duration containerStopTimeout, Duration videoContainerStopTimeout)
      throws Exception {
    return new DockerSession(
        browserContainer,
        video,
        tracer,
        httpClient,
        sessionId,
        new URL("http://localhost:4444"),
        new ImmutableCapabilities(),
        new ImmutableCapabilities(),
        Dialect.W3C,
        Dialect.W3C,
        Instant.now(),
        assetsPath,
        containerStopTimeout,
        videoContainerStopTimeout);
  }

  @Test
  void stopWithVideo_videoContainerStoppedBeforeLogs() throws Exception {
    DockerSession session = createSession(videoContainer);

    InOrder order = inOrder(videoContainer, browserContainer);
    session.stop();

    order.verify(videoContainer).stop(any(Duration.class));
    order.verify(browserContainer).getLogs();
    order.verify(browserContainer).stop(any(Duration.class));
  }

  @Test
  void stopWithoutVideo_logsAndBrowserContainerStopped() throws Exception {
    DockerSession session = createSession(null);

    session.stop();

    verify(videoContainer, never()).stop(any(Duration.class));
    verify(browserContainer).getLogs();
    verify(browserContainer).stop(any(Duration.class));
  }

  @Test
  void stop_logsWrittenBeforeBrowserContainerStopped() throws Exception {
    byte[] logBytes = "INFO: Session started\nINFO: Session ended\n".getBytes();
    // Docker multiplexed stream format: [stream-type(1)][padding(3)][payload-size(4)][payload]
    ByteArrayOutputStream buf = new ByteArrayOutputStream();
    DataOutputStream header = new DataOutputStream(buf);
    header.writeByte(1); // stdout
    header.write(new byte[3]); // padding
    header.writeInt(logBytes.length);
    header.flush();
    buf.write(logBytes);
    byte[] multiplexed = buf.toByteArray();
    when(browserContainer.getLogs())
        .thenReturn(
            new ContainerLogs(
                new ContainerId("browser-id"),
                Contents.fromStream(new ByteArrayInputStream(multiplexed), multiplexed.length)));

    // saveLogs() writes to sessionAssetsPath/selenium-server.log; parent dir must exist
    Path sessionDir = tempDir.resolve(sessionId.toString());
    Files.createDirectories(sessionDir);

    DockerSession session = createSession(null);
    session.stop();

    assertThat(sessionDir.resolve("selenium-server.log")).exists();
  }

  @Test
  void stop_browserContainerAlwaysStoppedEvenIfVideoStopFails() throws Exception {
    doThrow(new RuntimeException("video stop failed")).when(videoContainer).stop(any());

    DockerSession session = createSession(videoContainer);

    try {
      session.stop();
    } catch (RuntimeException ignored) {
      // video stop failure propagates, but browser container must still be cleaned up
    }

    verify(browserContainer).stop(any(Duration.class));
  }

  @Test
  void stop_browserContainerStoppedEvenIfLogFetchThrows() throws Exception {
    when(browserContainer.getLogs()).thenThrow(new RuntimeException("log fetch failed"));

    DockerSession session = createSession(null);

    // A RuntimeException from getLogs() propagates through saveLogs(), but the try-finally in
    // stop() guarantees container.stop() is still called via the finally block.
    try {
      session.stop();
    } catch (RuntimeException ignored) {
      // expected
    }

    verify(browserContainer).stop(any(Duration.class));
  }

  @Test
  void stop_configuredStopGracePeriodIsPassedToBothContainers() throws Exception {
    Duration gracePeriod = Duration.ofSeconds(42);
    DockerSession session = createSession(videoContainer, gracePeriod, gracePeriod);

    session.stop();

    verify(videoContainer).stop(gracePeriod);
    verify(browserContainer).stop(gracePeriod);
  }
}
