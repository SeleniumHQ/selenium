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

import static java.util.logging.Level.FINE;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.docker.Container;
import org.openqa.selenium.docker.ContainerLogs;
import org.openqa.selenium.grid.node.DefaultActiveSession;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.Tracer;

public class DockerSession extends DefaultActiveSession {

  private static final Logger LOG = Logger.getLogger(DockerSession.class.getName());
  private final Container container;
  private final @Nullable Container videoContainer;
  private final DockerAssetsPath assetsPath;

  DockerSession(
      Container container,
      @Nullable Container videoContainer,
      Tracer tracer,
      HttpClient client,
      SessionId id,
      URL url,
      Capabilities stereotype,
      Capabilities capabilities,
      Dialect downstream,
      Dialect upstream,
      Instant startTime,
      DockerAssetsPath assetsPath) {
    super(tracer, client, id, url, downstream, upstream, stereotype, capabilities, startTime);
    this.container = Require.nonNull("Container", container);
    this.videoContainer = videoContainer;
    this.assetsPath = Require.nonNull("Assets path", assetsPath);
  }

  @Override
  public void stop() {
    if (videoContainer != null) {
      videoContainer.stop(Duration.ofSeconds(10));
    }
    saveLogs();
    container.stop(Duration.ofMinutes(1));
    super.stop();
  }

  private void saveLogs() {
    if (!container.isRunning()) {
      LOG.log(
          FINE, () -> "Skip saving logs because container is not running: " + container.getId());
      return;
    }

    String sessionAssetsPath = assetsPath.getContainerPath(getId());
    File seleniumServerLog = new File(sessionAssetsPath, "selenium-server.log");
    ContainerLogs containerLogs = container.getLogs();

    try (InputStream in = new BufferedInputStream(containerLogs.getLogs())) {
      // We could just use method `Files.copy(in, seleniumServerLog)`, but it can fail on Java 11.
      // See JDK bug https://bugs.openjdk.org/browse/JDK-8228970

      try (OutputStream out = new BufferedOutputStream(new FileOutputStream(seleniumServerLog))) {
        byte[] buffer = new byte[1024];

        int readCount;
        while ((readCount = in.read(buffer)) != -1) {
          out.write(buffer, 0, readCount);
        }
      }

      LOG.log(
          FINE,
          () ->
              String.format(
                  "Saved container %s logs to file %s",
                  container.getId(), seleniumServerLog.getAbsolutePath()));
    } catch (Exception e) {
      LOG.log(Level.WARNING, "Error saving logs", e);
    }
  }
}
