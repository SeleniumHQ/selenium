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


import static java.util.concurrent.TimeUnit.SECONDS;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.InvalidArgumentException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.session.ActiveSession;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.server.jmx.JMXHelper;
import org.openqa.selenium.remote.server.jmx.ManagedService;
import org.openqa.selenium.remote.service.DriverService;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.lang.reflect.Method;
import java.net.URL;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.logging.Level;

import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;

@ManagedService
public class ServicedSession extends RemoteSession {

  private final DriverService service;

  public ServicedSession(
      DriverService service,
      Dialect downstream,
      Dialect upstream,
      HttpHandler codec,
      SessionId id,
      Map<String, Object> capabilities) {
    super(downstream, upstream, codec, id, capabilities);

    this.service = service;

    new JMXHelper().register(this);
  }

  @Override
  public String toString() {
    return getId().toString() + " (" + service.getClass().getName() + ")";
  }

  @Override
  public void stop() {
    // Try and kill the running session. Both W3C and OSS use the same quit endpoint
    try {
      HttpRequest request = new HttpRequest(HttpMethod.DELETE, "/session/" + getId());
      execute(request);
    } catch (UncheckedIOException e) {
      // This is fine.
    }

    service.stop();
  }

  public static class Factory extends RemoteSession.Factory<DriverService> {

    private final Predicate<Capabilities> key;
    private final Function<Capabilities, ? extends DriverService> createService;
    private final String serviceClassName;

    public Factory(Predicate<Capabilities> key, String serviceClassName) {
      this.key = key;

      this.serviceClassName = serviceClassName;
      try {
        Class<? extends DriverService> driverClazz =
            Class.forName(serviceClassName).asSubclass(DriverService.class);

        Function<Capabilities, ? extends DriverService> factory =
            get(driverClazz, Capabilities.class);
        if (factory == null) {
          factory = get(driverClazz);
        }

        if (factory == null) {
          throw new IllegalArgumentException(
              "DriverService has no mechanism to create a default instance: " + serviceClassName);
        }

        this.createService = factory;
      } catch (ReflectiveOperationException e) {
        throw new IllegalArgumentException(
            "DriverService class does not exist: " + serviceClassName);
      }
    }

    private Function<Capabilities, ? extends DriverService> get(
        Class<? extends DriverService> driverServiceClazz,
        Class... args) {
      try {
        Method serviceMethod = driverServiceClazz.getDeclaredMethod("createDefaultService", args);
        serviceMethod.setAccessible(true);
        return caps -> {
          try {
            if (args.length > 0) {
              return (DriverService) serviceMethod.invoke(null, caps);
            } else {
              return (DriverService) serviceMethod.invoke(null);
            }
          } catch (ReflectiveOperationException e) {
            throw new SessionNotCreatedException(
                "Unable to create new service: " + driverServiceClazz.getSimpleName(), e);
          }
        };
      } catch (ReflectiveOperationException e) {
        return null;
      }
    }

    @Override
    public boolean test(Capabilities capabilities) {
      return key.test(capabilities);
    }

    @Override
    public Optional<ActiveSession> apply(CreateSessionRequest sessionRequest) {
      Objects.requireNonNull(sessionRequest);
      DriverService service = createService.apply(sessionRequest.getCapabilities());

      try {
        service.start();

        PortProber.waitForPortUp(service.getUrl().getPort(), 30, SECONDS);

        URL url = service.getUrl();

        return performHandshake(
            service,
            url,
            sessionRequest.getDownstreamDialects(),
            sessionRequest.getCapabilities());
      } catch (IOException | IllegalStateException | NullPointerException | InvalidArgumentException e) {
        log.log(Level.INFO, e.getMessage(), e);
        service.stop();
        return Optional.empty();
      }
    }

    @Override
    protected ServicedSession newActiveSession(
        DriverService service,
        Dialect downstream,
        Dialect upstream,
        HttpHandler codec,
        SessionId id,
        Map<String, Object> capabilities) {
      return new ServicedSession(
          service,
          downstream,
          upstream,
          codec,
          id,
          capabilities);
    }

    @Override
    public String toString() {
      return getClass().getName() + " (provider: " + serviceClassName + ")";
    }
  }

  public ObjectName getObjectName() throws MalformedObjectNameException {
    return new ObjectName(String.format("org.seleniumhq.server:type=Session,browser=\"%s\",id=%s",
                                        getCapabilities().get("browserName"), getId()));
  }
}
