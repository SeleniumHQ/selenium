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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Objects;

public abstract class BaseActiveSession implements ActiveSession {

  private final Session session;
  private final Dialect downstream;
  private final Dialect upstream;

  protected BaseActiveSession(
      SessionId id,
      URL url,
      Dialect downstream,
      Dialect upstream,
      Capabilities capabilities) {
    URI uri = null;
    try {
      uri = Objects.requireNonNull(url).toURI();
    } catch (URISyntaxException e) {
      throw new IllegalArgumentException(e);
    }

    this.session = new Session(
        Objects.requireNonNull(id),
        uri,
        ImmutableCapabilities.copyOf(Objects.requireNonNull(capabilities)));

    this.downstream = Objects.requireNonNull(downstream);
    this.upstream = Objects.requireNonNull(upstream);
  }

  @Override
  public SessionId getId() {
    return session.getId();
  }

  @Override
  public Capabilities getCapabilities() {
    return session.getCapabilities();
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
