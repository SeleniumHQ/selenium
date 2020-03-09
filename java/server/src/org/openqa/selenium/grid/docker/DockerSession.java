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

import io.opentelemetry.trace.Tracer;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.docker.Container;
import org.openqa.selenium.grid.node.ProtocolConvertingSession;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;

import java.net.URL;
import java.time.Duration;
import java.util.Objects;

class DockerSession extends ProtocolConvertingSession {

  private final Container container;

  DockerSession(
      Container container,
      Tracer tracer,
      HttpClient client,
      SessionId id,
      URL url,
      Capabilities capabilities,
      Dialect downstream,
      Dialect upstream) {
    super(tracer, client, id, url, downstream, upstream, capabilities);
    this.container = Objects.requireNonNull(container);
  }

  @Override
  public void stop() {
    container.stop(Duration.ofMinutes(1));
    container.delete();
  }
}
