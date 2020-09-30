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

package org.openqa.selenium.grid.distributor.local;

import org.junit.Test;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueuer;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import java.time.Duration;
import java.time.temporal.ChronoUnit;

public class GridModelTest {

  private final Tracer tracer = DefaultTestTracer.createTracer();
  private final EventBus events = new GuavaEventBus();
  private final HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();
  private final SessionMap sessions = new LocalSessionMap(tracer, events);
  private final Secret secret = new Secret("cheese");
  LocalNewSessionQueue localNewSessionQueue = new LocalNewSessionQueue(
      tracer,
      events,
      Duration.of(2, ChronoUnit.SECONDS));
  LocalNewSessionQueuer queuer = new LocalNewSessionQueuer(tracer, events, localNewSessionQueue);
  private final Distributor distributor = new LocalDistributor(
      tracer,
      events,
      clientFactory,
      sessions,
      queuer,
      secret,
      Duration.of(2, ChronoUnit.SECONDS));

  @Test
  public void shouldNotChangeTheStateOfANodeMarkedAsDownWhenNodeStatusEventFires() {

  }

}
