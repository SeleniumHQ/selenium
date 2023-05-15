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
import java.net.URISyntaxException;
import java.net.URL;
import java.time.Instant;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;

public abstract class BaseActiveSession implements ActiveSession {

  private final Session session;
  private final Dialect downstream;
  private final Dialect upstream;

  protected BaseActiveSession(
      SessionId id,
      URL url,
      Dialect downstream,
      Dialect upstream,
      Capabilities stereotype,
      Capabilities capabilities,
      Instant startTime) {
    URI uri;
    try {
      uri = Require.nonNull("URL", url).toURI();
    } catch (URISyntaxException e) {
      throw new IllegalArgumentException(e);
    }

    this.session =
        new Session(
            Require.nonNull("Session id", id),
            uri,
            ImmutableCapabilities.copyOf(Require.nonNull("Stereotype", stereotype)),
            ImmutableCapabilities.copyOf(Require.nonNull("Capabilities", capabilities)),
            Require.nonNull("Start time", startTime));

    this.downstream = Require.nonNull("Downstream dialect", downstream);
    this.upstream = Require.nonNull("Upstream dialect", upstream);
  }

  @Override
  public SessionId getId() {
    return session.getId();
  }

  @Override
  public Capabilities getStereotype() {
    return session.getStereotype();
  }

  @Override
  public Capabilities getCapabilities() {
    return session.getCapabilities();
  }

  @Override
  public Instant getStartTime() {
    return session.getStartTime();
  }

  @Override
  public URI getUri() {
    return session.getUri();
  }

  @Override
  public Dialect getUpstreamDialect() {
    return upstream;
  }

  @Override
  public Dialect getDownstreamDialect() {
    return downstream;
  }

  public Session asSession() {
    return session;
  }
}
