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

import java.net.URI;
import java.time.Instant;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpHandler;

public interface ActiveSession extends HttpHandler {

  SessionId getId();

  Capabilities getStereotype();

  Capabilities getCapabilities();

  Instant getStartTime();

  URI getUri();

  Dialect getUpstreamDialect();

  Dialect getDownstreamDialect();

  /**
   * Indicates whether the browser backing this session runs in a separate environment from the Node
   * process (for example, a Docker container, a Kubernetes Pod, or a relayed remote endpoint) and
   * therefore does not share the Node's local filesystem. When {@code true}, file upload and
   * download commands must be forwarded to the session so files are written to (or read from) the
   * environment where the browser actually runs, instead of being handled on the Node's own
   * filesystem.
   *
   * @return {@code true} if file transfer commands must be forwarded to the browser environment
   */
  default boolean isRemoteFileSystem() {
    return false;
  }

  void stop();
}
