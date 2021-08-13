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

package org.openqa.selenium.remote.server;

import com.google.common.base.StandardSystemProperty;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.session.ActiveSession;
import org.openqa.selenium.grid.session.SessionFactory;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.File;
import java.io.UncheckedIOException;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.logging.Logger;

class InMemorySession implements ActiveSession {

  private static final Logger LOG = Logger.getLogger(InMemorySession.class.getName());

  private final WebDriver driver;
  private final Map<String, Object> capabilities;
  private final SessionId id;
  private final Dialect downstream;
  private final TemporaryFilesystem filesystem;
  private final JsonHttpCommandHandler handler;

  private InMemorySession(WebDriver driver, Capabilities capabilities, Dialect downstream) {
    this.driver = Require.nonNull("Driver", driver);

    Capabilities caps;
    if (driver instanceof HasCapabilities) {
      caps = ((HasCapabilities) driver).getCapabilities();
    } else {
      caps = capabilities;
    }

    this.capabilities = caps.asMap().entrySet().stream()
        .filter(e -> e.getValue() != null)
        .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));

    this.id = new SessionId(UUID.randomUUID().toString());
    this.downstream = Require.nonNull("Downstream dialect", downstream);

    File tempRoot = new File(StandardSystemProperty.JAVA_IO_TMPDIR.value(), id.toString());
    Require.stateCondition(tempRoot.mkdirs(), "Could not create directory %s", tempRoot);
    this.filesystem = TemporaryFilesystem.getTmpFsBasedOn(tempRoot);

    this.handler = new JsonHttpCommandHandler(
        new PretendDriverSessions(),
        LOG);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    HttpResponse res = new HttpResponse();
    handler.handleRequest(req, res);
    return res;
  }

  @Override
  public SessionId getId() {
    return id;
  }

  @Override
  public Dialect getUpstreamDialect() {
    return Dialect.OSS;
  }

  @Override
  public Dialect getDownstreamDialect() {
    return downstream;
  }

  @Override
  public Map<String, Object> getCapabilities() {
    return capabilities;
  }

  @Override
  public TemporaryFilesystem getFileSystem() {
    return filesystem;
  }

  @Override
  public WebDriver getWrappedDriver() {
    return driver;
  }

  @Override
  public void stop() {
    driver.quit();
  }

  public static class Factory implements SessionFactory {

    private final DriverProvider provider;

    public Factory(DriverProvider provider) {
      this.provider = provider;
    }


    @Override
    public boolean test(Capabilities capabilities) {
      return provider.canCreateDriverInstanceFor(capabilities);
    }

    @Override
    public Optional<ActiveSession> apply(CreateSessionRequest sessionRequest) {
      Require.nonNull("Session creation request", sessionRequest);

      // Assume the blob fits in the available memory.
      try {
        if (!provider.canCreateDriverInstanceFor(sessionRequest.getDesiredCapabilities())) {
          return Optional.empty();
        }

        WebDriver driver = provider.newInstance(sessionRequest.getDesiredCapabilities());

        // Prefer the OSS dialect.
        Set<Dialect> downstreamDialects = sessionRequest.getDownstreamDialects();
        Dialect downstream = downstreamDialects.contains(Dialect.OSS) || downstreamDialects.isEmpty() ?
                             Dialect.OSS :
                             downstreamDialects.iterator().next();
        return Optional.of(
            new InMemorySession(driver, sessionRequest.getDesiredCapabilities(), downstream));
      } catch (IllegalStateException e) {
        return Optional.empty();
      }
    }

    @Override
    public String toString() {
      return getClass() + " (provider: " + provider + ")";
    }

  }

  private class PretendDriverSessions implements DriverSessions {

    private final Session session;

    private PretendDriverSessions() {
      this.session = new ActualSession();
    }

    @Override
    public Session get(SessionId sessionId) {
      return getId().equals(sessionId) ? session : null;
    }

    @Override
    public Set<SessionId> getSessions() {
      return ImmutableSet.of(getId());
    }
  }

  private class ActualSession implements Session {

    private final KnownElements knownElements;
    private volatile String screenshot;

    private ActualSession() {
      knownElements = new KnownElements();
    }

    @Override
    public void close() {
      driver.quit();
    }

    @Override
    public WebDriver getDriver() {
      return driver;
    }

    @Override
    public KnownElements getKnownElements() {
      return knownElements;
    }

    @Override
    public Map<String, Object> getCapabilities() {
      return capabilities;
    }

    @Override
    public void attachScreenshot(String base64EncodedImage) {
      screenshot = base64EncodedImage;
    }

    @Override
    public String getAndClearScreenshot() {
      String toReturn = screenshot;
      screenshot = null;
      return toReturn;
    }

    @Override
    public SessionId getSessionId() {
      return getId();
    }

    @Override
    public TemporaryFilesystem getTemporaryFileSystem() {
      return getFileSystem();
    }
  }
}
