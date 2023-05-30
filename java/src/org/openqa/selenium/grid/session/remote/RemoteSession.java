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

package org.openqa.selenium.grid.session.remote;

import com.google.common.base.StandardSystemProperty;
import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URL;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.grid.session.ActiveSession;
import org.openqa.selenium.grid.session.SessionFactory;
import org.openqa.selenium.grid.web.ReverseProxyHandler;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ProtocolHandshake;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Tracer;

/** Abstract class designed to do things like protocol conversion. */
public abstract class RemoteSession implements ActiveSession {

  private static final Logger LOG = Logger.getLogger(ActiveSession.class.getName());

  private final SessionId id;
  private final Dialect downstream;
  private final Dialect upstream;
  private final HttpHandler codec;
  private final Map<String, Object> capabilities;
  private final TemporaryFilesystem filesystem;
  private final WebDriver driver;

  protected RemoteSession(
      Dialect downstream,
      Dialect upstream,
      HttpHandler codec,
      SessionId id,
      Map<String, Object> capabilities) {
    this.downstream = Require.nonNull("Downstream dialect", downstream);
    this.upstream = Require.nonNull("Upstream dialect", upstream);
    this.codec = Require.nonNull("Codec", codec);
    this.id = Require.nonNull("Session id", id);
    this.capabilities = Require.nonNull("Capabilities", capabilities);

    File tempRoot = new File(StandardSystemProperty.JAVA_IO_TMPDIR.value(), id.toString());
    Require.stateCondition(tempRoot.mkdirs(), "Could not create directory %s", tempRoot);
    this.filesystem = TemporaryFilesystem.getTmpFsBasedOn(tempRoot);

    CommandExecutor executor = new ActiveSessionCommandExecutor(this);
    this.driver =
        new Augmenter()
            .augment(new RemoteWebDriver(executor, new ImmutableCapabilities(getCapabilities())));
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
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    return codec.execute(req);
  }

  public abstract static class Factory<X> implements SessionFactory {

    protected Optional<ActiveSession> performHandshake(
        Tracer tracer,
        X additionalData,
        URL url,
        Set<Dialect> downstreamDialects,
        Capabilities capabilities) {
      try {
        HttpClient client = HttpClient.Factory.createDefault().createClient(url);

        Command command = new Command(null, DriverCommand.NEW_SESSION(capabilities));

        ProtocolHandshake.Result result = new ProtocolHandshake().createSession(client, command);

        HttpHandler codec;
        Dialect upstream = result.getDialect();
        Dialect downstream;
        if (downstreamDialects.contains(result.getDialect())) {
          codec = new ReverseProxyHandler(tracer, client);
          downstream = upstream;
        } else {
          LOG.warning(
              String.format(
                  "Unable to match protocol versions. Found %s upstream but can handle %s",
                  upstream, downstreamDialects));
          return Optional.empty();
        }

        Response response = result.createResponse();
        //noinspection unchecked
        Optional<ActiveSession> activeSession =
            Optional.of(
                newActiveSession(
                    additionalData,
                    downstream,
                    upstream,
                    codec,
                    new SessionId(response.getSessionId()),
                    (Map<String, Object>) response.getValue()));
        activeSession.ifPresent(session -> LOG.info("Started new session " + session));
        return activeSession;
      } catch (IOException | IllegalStateException | NullPointerException e) {
        LOG.log(Level.WARNING, e.getMessage(), e);
        return Optional.empty();
      }
    }

    protected abstract ActiveSession newActiveSession(
        X additionalData,
        Dialect downstream,
        Dialect upstream,
        HttpHandler codec,
        SessionId id,
        Map<String, Object> capabilities);
  }
}
