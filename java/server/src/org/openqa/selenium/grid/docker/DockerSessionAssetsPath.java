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

import org.openqa.selenium.remote.SessionId;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

public class DockerSessionAssetsPath {

  private static final Logger LOG = Logger.getLogger(DockerSessionAssetsPath.class.getName());

  private final String hostAssetsPath;
  private final String containerAssetsPath;

  public DockerSessionAssetsPath(String hostAssetsPath, String containerAssetsPath) {
    this.hostAssetsPath = hostAssetsPath;
    this.containerAssetsPath = containerAssetsPath;
  }

  public Optional<Path> createHostSessionAssetsPath(SessionId id) {
    return createSessionAssetsPath(this.hostAssetsPath, id);
  }

  public Optional<Path> createContainerSessionAssetsPath(SessionId id) {
    return createSessionAssetsPath(this.containerAssetsPath, id);
  }

  private Optional<Path> createSessionAssetsPath(String assetsPath, SessionId id) {
    if (assetsPath == null || assetsPath.isEmpty()) {
      return Optional.empty();
    }
    try {
      return Optional.of(Files.createDirectories(Paths.get(assetsPath, id.toString())));
    } catch (IOException e) {
      LOG.log(Level.WARNING,
              "Failed to create path to store session assets, no assets will be stored: " +
              assetsPath, e);
    }
    return Optional.empty();
  }
}
