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
import org.openqa.selenium.docker.Container;
import org.openqa.selenium.grid.node.ProtocolConvertingSession;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.Tracer;

import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

public class DockerSession extends ProtocolConvertingSession {

  private static final Logger LOG = Logger.getLogger(DockerSession.class.getName());
  private final Container container;
  private final Container videoContainer;
  private final DockerAssetsPath assetsPath;

  DockerSession(
    Container container,
    Container videoContainer,
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
  }

  private void saveLogs() {
    String sessionAssetsPath = assetsPath.getContainerPath(getId());
    String seleniumServerLog = String.format("%s/selenium-server.log", sessionAssetsPath);
    try {
      List<String> logs = container.getLogs().getLogLines();
      Files.write(Paths.get(seleniumServerLog), logs);
    } catch (Exception e) {
      LOG.log(Level.WARNING, "Error saving logs", e);
    }
  }
}
