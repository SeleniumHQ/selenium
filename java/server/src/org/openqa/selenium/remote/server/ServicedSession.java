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

import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.CommandCodec;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.ProtocolHandshake;
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
import org.openqa.selenium.remote.internal.ApacheHttpClient;
import org.openqa.selenium.remote.service.DriverService;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

class ServicedSession implements ActiveSession {

  private final static Logger LOG = Logger.getLogger(ActiveSession.class.getName());

  private final DriverService service;
  private final SessionId id;
  private Dialect downstream;
  private Dialect upstream;
  private final SessionCodec codec;
  private final Map<String, Object> capabilities;

  public ServicedSession(
      DriverService service,
      Dialect downstream,
      Dialect upstream,
      SessionCodec codec,
      SessionId id,
      Map<String, Object> capabilities) {
    this.service = service;
    this.downstream = downstream;
    this.upstream = upstream;
    this.codec = codec;
    this.id = id;
    this.capabilities = capabilities;
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
  public void stop() {
    service.stop();
  }

  public static class Factory implements SessionFactory {

    private final Supplier<? extends DriverService> createService;
    private final String serviceClassName;

    public Factory(String serviceClassName) {
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
    public ActiveSession apply(Path path, Set<Dialect> downstreamDialects) {
      DriverService service = createService.get();

      try (InputStream in = new BufferedInputStream(Files.newInputStream(path))) {
        service.start();

        PortProber.waitForPortUp(service.getUrl().getPort(), 30, SECONDS);

        URL url = service.getUrl();

        HttpClient client = new ApacheHttpClient.Factory().createClient(url);

        ProtocolHandshake.Result result = new ProtocolHandshake()
            .createSession(client, in, Files.size(path))
            .orElseThrow(() -> new SessionNotCreatedException("Unable to create session"));

        SessionCodec codec;
        Dialect upstream = result.getDialect();
        Dialect downstream;
        if (downstreamDialects.contains(result.getDialect())) {
          codec = new Passthrough(url);
          downstream = upstream;
        } else {
          downstream = downstreamDialects.iterator().next();

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
      } catch (IOException e) {
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
