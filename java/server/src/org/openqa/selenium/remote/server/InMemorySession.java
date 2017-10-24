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


import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.common.base.Preconditions;
import com.google.common.base.StandardSystemProperty;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.io.CharStreams;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.logging.Logger;
import java.util.stream.Stream;

class InMemorySession implements ActiveSession {

  private static final Logger LOG = Logger.getLogger(InMemorySession.class.getName());

  private final WebDriver driver;
  private final Map<String, Object> capabilities;
  private final SessionId id;
  private final Dialect downstream;
  private final TemporaryFilesystem filesystem;
  private final JsonHttpCommandHandler handler;

  private InMemorySession(WebDriver driver, Capabilities capabilities, Dialect downstream)
      throws IOException {
    this.driver = Preconditions.checkNotNull(driver);

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
    this.downstream = Preconditions.checkNotNull(downstream);

    File tempRoot = new File(StandardSystemProperty.JAVA_IO_TMPDIR.value(), id.toString());
    Preconditions.checkState(tempRoot.mkdirs());
    this.filesystem = TemporaryFilesystem.getTmpFsBasedOn(tempRoot);

    this.handler = new JsonHttpCommandHandler(
        new PretendDriverSessions(),
        LOG);
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    handler.handleRequest(req, resp);
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

    private final JsonToBeanConverter toBean = new JsonToBeanConverter();
    private final DriverProvider provider;

    public Factory(DriverProvider provider) {
      this.provider = provider;
    }

    @Override
    public ActiveSession apply(NewSessionPayload payload) {
      // Assume the blob fits in the available memory.
      try (
          InputStream is = payload.getPayload().get();
          Reader ir = new InputStreamReader(is, UTF_8);
          Reader reader = new BufferedReader(ir)) {
        Map<?, ?> raw = toBean.convert(Map.class, CharStreams.toString(reader));
        Object desired = raw.get("desiredCapabilities");

        if (!(desired instanceof Map)) {
          return null;
        }

        @SuppressWarnings("unchecked") ImmutableCapabilities caps =
            new ImmutableCapabilities((Map<String, ?>) desired);

        if (!provider.canCreateDriverInstanceFor(caps)) {
          return null;
        }

        WebDriver driver = provider.newInstance(caps);

        // Prefer the OSS dialect.
        Dialect downstream = payload.getDownstreamDialects().contains(Dialect.OSS) ?
                             Dialect.OSS :
                             payload.getDownstreamDialects().iterator().next();
        return new InMemorySession(driver, caps, downstream);
      } catch (IOException|IllegalStateException e) {
        throw new SessionNotCreatedException("Cannot establish new session", e);
      }
    }

    @Override
    public String toString() {
      return getClass() + " (provider: " + provider + ")";
    }

  }

  private class PretendDriverSessions implements DriverSessions {

    private final Session session;

    private PretendDriverSessions() throws IOException {
      this.session = new ActualSession();
    }

    @Override
    public SessionId newSession(Stream<Capabilities> desiredCapabilities) throws Exception {
      throw new UnsupportedOperationException("newSession");
    }

    @Override
    public Session get(SessionId sessionId) {
      return getId().equals(sessionId) ? session : null;
    }

    @Override
    public void deleteSession(SessionId sessionId) {
      // no-op
    }

    @Override
    public void registerDriver(
        Capabilities capabilities,
        Class<? extends WebDriver> implementation) {
      throw new UnsupportedOperationException("registerDriver");
    }

    @Override
    public Set<SessionId> getSessions() {
      return ImmutableSet.of(getId());
    }
  }

  private class ActualSession implements Session {

    private final KnownElements knownElements;
    private volatile String screenshot;

    private ActualSession() throws IOException {
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
