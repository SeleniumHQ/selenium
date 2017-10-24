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


import static java.util.concurrent.TimeUnit.SECONDS;

import com.google.common.base.Preconditions;
import com.google.common.base.StandardSystemProperty;

import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.remote.CommandCodec;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.ProtocolHandshake;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.ResponseCodec;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.JsonHttpCommandCodec;
import org.openqa.selenium.remote.http.JsonHttpResponseCodec;
import org.openqa.selenium.remote.http.W3CHttpCommandCodec;
import org.openqa.selenium.remote.http.W3CHttpResponseCodec;
import org.openqa.selenium.remote.internal.ApacheHttpClient;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.net.URL;
import java.util.Map;
import java.util.function.Supplier;

class ServicedSession implements ActiveSession {

  private final DriverService service;
  private final SessionId id;
  private final Dialect downstream;
  private final Dialect upstream;
  private final SessionCodec codec;
  private final Map<String, Object> capabilities;
  private final TemporaryFilesystem filesystem;
  private final WebDriver driver;

  public ServicedSession(
      DriverService service,
      Dialect downstream,
      Dialect upstream,
      SessionCodec codec,
      SessionId id,
      Map<String, Object> capabilities) throws IOException {
    this.service = service;
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
  }


  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    codec.handle(req, resp);
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
  public WebDriver getWrappedDriver() {
    return driver;
  }

  @Override
  public TemporaryFilesystem getFileSystem() {
    return filesystem;
  }

  @Override
  public void stop() {
    // Try and kill the running session. Both W3C and OSS use the same quit endpoint
    try {
      HttpRequest request = new HttpRequest(HttpMethod.DELETE, "/session/" + getId());
      HttpResponse ignored = new HttpResponse();
      execute(request, ignored);
    } catch (IOException e) {
      // This is fine.
    }

    service.stop();
  }

  public static class Factory implements SessionFactory {

    private final Supplier<? extends DriverService> createService;
    private final String serviceClassName;

    Factory(String serviceClassName) {
      this.serviceClassName = serviceClassName;
      try {
        Class<? extends DriverService> driverClazz =
            Class.forName(serviceClassName).asSubclass(DriverService.class);

        Method serviceMethod = driverClazz.getMethod("createDefaultService");
        serviceMethod.setAccessible(true);

        this.createService = () -> {
          try {
            return (DriverService) serviceMethod.invoke(null);
          } catch (ReflectiveOperationException e) {
            throw new SessionNotCreatedException(
                "Unable to create new service: " + driverClazz.getSimpleName(), e);
          }
        };
      } catch (ReflectiveOperationException e) {
        throw new SessionNotCreatedException("Cannot find service factory method", e);
      }
    }

    @Override
    public ActiveSession apply(NewSessionPayload payload) {
      DriverService service = createService.get();

      try (InputStream in = payload.getPayload().get()) {
        service.start();

        PortProber.waitForPortUp(service.getUrl().getPort(), 30, SECONDS);

        URL url = service.getUrl();

        HttpClient client = new ApacheHttpClient.Factory().createClient(url);

        ProtocolHandshake.Result result = new ProtocolHandshake()
            .createSession(client, in, payload.getPayloadSize())
            .orElseThrow(() -> new SessionNotCreatedException("Unable to create session"));

        SessionCodec codec;
        Dialect upstream = result.getDialect();
        Dialect downstream;
        if (payload.getDownstreamDialects().contains(result.getDialect())) {
          codec = new Passthrough(url);
          downstream = upstream;
        } else {
          downstream = payload.getDownstreamDialects().iterator().next();

          codec = new ProtocolConverter(
              url,
              getCommandCodec(downstream),
              getResponseCodec(downstream),
              getCommandCodec(upstream),
              getResponseCodec(upstream));
        }

        Response response = result.createResponse();
        //noinspection unchecked
        return new ServicedSession(
            service,
            downstream,
            upstream,
            codec,
            new SessionId(response.getSessionId()),
            (Map<String, Object>) response.getValue());
      } catch (IOException|IllegalStateException|NullPointerException e) {
        throw new SessionNotCreatedException("Cannot establish new session", e);
      }
    }

    @Override
    public String toString() {
      return getClass() + " (provider: " + serviceClassName + ")";
    }

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
