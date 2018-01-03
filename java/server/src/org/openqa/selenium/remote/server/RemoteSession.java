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

import static org.openqa.selenium.remote.Dialect.OSS;

import com.google.common.base.Preconditions;
import com.google.common.base.StandardSystemProperty;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandCodec;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ProtocolHandshake;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.ResponseCodec;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.JsonHttpCommandCodec;
import org.openqa.selenium.remote.http.JsonHttpResponseCodec;
import org.openqa.selenium.remote.http.W3CHttpCommandCodec;
import org.openqa.selenium.remote.http.W3CHttpResponseCodec;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Abstract class designed to do things like protocol conversion.
 */
public abstract class RemoteSession implements ActiveSession {

  protected static Logger log = Logger.getLogger(ActiveSession.class.getName());

  private final SessionId id;
  private final Dialect downstream;
  private final Dialect upstream;
  private final SessionCodec codec;
  private final Map<String, Object> capabilities;
  private final TemporaryFilesystem filesystem;
  private final WebDriver driver;
  private volatile boolean active;

  protected RemoteSession(
      Dialect downstream,
      Dialect upstream,
      SessionCodec codec,
      SessionId id,
      Map<String, Object> capabilities) {
    this.downstream = downstream;
    this.upstream = upstream;
    this.codec = codec;
    this.id = id;
    this.capabilities = capabilities;

    File tempRoot = new File(StandardSystemProperty.JAVA_IO_TMPDIR.value(), id.toString());
    Preconditions.checkState(tempRoot.mkdirs());
    this.filesystem = TemporaryFilesystem.getTmpFsBasedOn(tempRoot);

    CommandExecutor executor = new ActiveSessionCommandExecutor(this);
    this.driver = new Augmenter().augment(new RemoteWebDriver(
        executor,
        new ImmutableCapabilities(getCapabilities())));
    this.active = true;
  }

  @Override
  public SessionId getId() {
    return id;
  }

  @Override
  public Dialect getUpstreamDialect() {
    return upstream;
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
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    codec.handle(req, resp);
  }

  @Override
  public final void stop() {
    try {
      doStop();
    } finally {
      active = false;
    }
  }

  protected abstract void doStop();

  @Override
  public boolean isActive() {
    return active;
  }

  public abstract static class Factory<X> implements SessionFactory {

    protected Optional<ActiveSession> performHandshake(
        X additionalData,
        URL url,
        Set<Dialect> downstreamDialects,
        Capabilities capabilities) {
      try {
        HttpClient client = HttpClient.Factory.createDefault().createClient(url);

        Command command = new Command(
            null,
            DriverCommand.NEW_SESSION,
            ImmutableMap.of("desiredCapabilities", capabilities));

        ProtocolHandshake.Result result = new ProtocolHandshake().createSession(client, command);

        SessionCodec codec;
        Dialect upstream = result.getDialect();
        Dialect downstream;
        if (downstreamDialects.contains(result.getDialect())) {
          codec = new Passthrough(url);
          downstream = upstream;
        } else {
          downstream = downstreamDialects.isEmpty() ? OSS : downstreamDialects.iterator().next();

          codec = new ProtocolConverter(
              url,
              getCommandCodec(downstream),
              getResponseCodec(downstream),
              getCommandCodec(upstream),
              getResponseCodec(upstream));
        }

        Response response = result.createResponse();
        //noinspection unchecked
        Optional<ActiveSession> activeSession = Optional.of(newActiveSession(
            additionalData,
            downstream,
            upstream,
            codec,
            new SessionId(response.getSessionId()),
            (Map<String, Object>) response.getValue()));
        activeSession.ifPresent(session -> log.info("Started new session " + session));
        return activeSession;
      } catch (IOException | IllegalStateException | NullPointerException e) {
        log.log(Level.WARNING, e.getMessage(), e);
        return Optional.empty();
      }
    }

    protected abstract ActiveSession newActiveSession(
        X additionalData,
        Dialect downstream,
        Dialect upstream,
        SessionCodec codec,
        SessionId id,
        Map<String, Object> capabilities);

    private CommandCodec<HttpRequest> getCommandCodec(Dialect dialect) {
      switch (dialect) {
        case OSS:
          return new JsonHttpCommandCodec();

        case W3C:
          return new W3CHttpCommandCodec();

        default:
          throw new IllegalStateException("Unknown dialect: " + dialect);
      }
    }

    private ResponseCodec<HttpResponse> getResponseCodec(Dialect dialect) {
      switch (dialect) {
        case OSS:
          return new JsonHttpResponseCodec();

        case W3C:
          return new W3CHttpResponseCodec();

        default:
          throw new IllegalStateException("Unknown dialect: " + dialect);
      }
    }
  }
}
