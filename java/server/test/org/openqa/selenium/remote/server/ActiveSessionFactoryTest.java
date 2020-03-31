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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertSame;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.junit.Test;
import org.mockito.Mockito;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.session.ActiveSession;
import org.openqa.selenium.grid.session.SessionFactory;
import org.openqa.selenium.remote.Dialect;

import io.opentelemetry.OpenTelemetry;

import java.util.Optional;

public class ActiveSessionFactoryTest {

  @Test
  public void factoriesFoundViaServiceLoadersAreUsedFirst() {
    WebDriver driver = Mockito.mock(WebDriver.class);
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");
    DriverProvider provider = new StubbedProvider(caps, driver);

    ActiveSessionFactory sessionFactory = new ActiveSessionFactory(OpenTelemetry.getTracerProvider().get("default")) {
      @Override
      protected Iterable<DriverProvider> loadDriverProviders() {
        return ImmutableSet.of(provider);
      }
    };

    ActiveSession session = sessionFactory.apply(
        new CreateSessionRequest(ImmutableSet.of(Dialect.W3C), caps, ImmutableMap.of()))
        .get();
    assertEquals(driver, session.getWrappedDriver());
  }

  @Test
  public void canBindNewFactoriesAtRunTime() {
    ActiveSession session = Mockito.mock(ActiveSession.class);

    ActiveSessionFactory sessionFactory = new ActiveSessionFactory(OpenTelemetry.getTracerProvider().get("default"))
        .bind(caps ->
                  "cheese".equals(caps.getBrowserName()),
              new SessionFactory() {
                @Override
                public boolean test(Capabilities capabilities) {
                  return true;
                }

                @Override
                public Optional<ActiveSession> apply(CreateSessionRequest sessionRequest) {
                  return Optional.of(session);
                }
              });

    ActiveSession created = sessionFactory.apply(
        new CreateSessionRequest(
            ImmutableSet.copyOf(Dialect.values()),
            toPayload("cheese"),
            ImmutableMap.of()))
        .get();

    assertSame(session, created);
  }

  private Capabilities toPayload(String browserName) {
    return new ImmutableCapabilities("browserName", browserName);
  }

  private static class StubbedProvider implements DriverProvider {

    private final Capabilities caps;
    private final WebDriver instance;

    private StubbedProvider(Capabilities caps, WebDriver instance) {
      this.caps = caps;
      this.instance = instance;
    }

    @Override
    public Capabilities getProvidedCapabilities() {
      return caps;
    }

    @Override
    public boolean canCreateDriverInstanceFor(Capabilities capabilities) {
      return this.caps.getBrowserName().equals(capabilities.getBrowserName());
    }

    @Override
    public WebDriver newInstance(Capabilities capabilities) {
      return instance;
    }
  }
}
