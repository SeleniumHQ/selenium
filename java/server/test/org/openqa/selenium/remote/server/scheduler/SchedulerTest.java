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

package org.openqa.selenium.remote.server.scheduler;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.remote.server.scheduler.Host.Status.DOWN;
import static org.openqa.selenium.testing.Assertions.assertException;

import com.google.common.collect.ImmutableSet;

import org.junit.Test;
import org.mockito.Mockito;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.server.ActiveSession;
import org.openqa.selenium.remote.server.SessionFactory;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;

import java.io.IOException;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;

public class SchedulerTest {

  // This is the original behaviour from Grid. Try, and then fail.
  @Test
  public void byDefaultASchedulerDoesNotAttemptToRescheduleSessions() throws IOException {
    SessionFactory factory = mock(SessionFactory.class);
    when(factory.isSupporting(any())).thenReturn(true);
    Mockito.when(factory.apply(any(), any())).thenReturn(Optional.empty());

    Host host = Host.builder()
        .name("localhost")
        .add(factory)
        .create();

    Distributor distributor = new Distributor().add(host);

    Scheduler scheduler = Scheduler.builder()
        .distributeUsing(distributor)
        .create();

    try (NewSessionPayload payload = NewSessionPayload.create(new FirefoxOptions())) {
      assertException(
          () -> scheduler.createSession(payload),
          e -> assertTrue(e instanceof SessionNotCreatedException));
    }

    verify(factory, times(1)).apply(any(), any());
  }

  @Test
  public void shouldAllowATimedFallback() throws IOException {
    SessionFactory factory = mock(SessionFactory.class);
    when(factory.isSupporting(any())).thenReturn(true);
    // Fail the first call, succeed on the second
    when(factory.apply(any(), any()))
        .thenReturn(
            Optional.empty(),
            Optional.of(new FakeActiveSession(ImmutableSet.of(), new FirefoxOptions())));

    Distributor distributor = new Distributor()
        .add(Host.builder().name("localhost").add(factory).create());

    Scheduler scheduler = Scheduler.builder()
        .distributeUsing(distributor)
        .retrySchedule(RetryDelays.immediately())
        .create();

    try (NewSessionPayload payload = NewSessionPayload.create(new FirefoxOptions())) {
      scheduler.createSession(payload);
    }

    verify(factory, times(2)).apply(any(), any());
  }

  @Test
  public void shouldAllowFlakySessionRestartsWithoutNeedingTimeout() throws IOException {
    SessionFactory factory = mock(SessionFactory.class);
    when(factory.isSupporting(any())).thenReturn(true);
    // Fail the first call, succeed on the second
    when(factory.apply(any(), any()))
        .thenReturn(
            Optional.empty(),
            Optional.of(new FakeActiveSession(ImmutableSet.of(), new FirefoxOptions())));

    Distributor distributor = new Distributor()
        .add(Host.builder().name("localhost").add(factory).create());

    Scheduler scheduler = Scheduler.builder()
        .distributeUsing(distributor)
        .retryFlakyStarts(2)
        .create();

    try (NewSessionPayload payload = NewSessionPayload.create(new FirefoxOptions())) {
      scheduler.createSession(payload);
    }

    verify(factory);
  }

  @Test
  public void shouldAHostGoDownAllAssociatedSessionsAreKilled() throws IOException {
    AtomicBoolean isUp = new AtomicBoolean(true);

    SessionFactory factory = new FakeSessionFactory(caps -> "chrome".equals(caps.getBrowserName()));

    Host host = Host.builder()
        .name("localhost")
        .add(factory)
        .add(factory)
        .healthCheck(() -> new HealthCheck.Result(isUp.get(), "canned message"))
        .create();
    Wait<Host> wait = new FluentWait<>(host).withTimeout(2, SECONDS);

    Distributor distributor = new Distributor().add(host);

    Scheduler scheduler = Scheduler.builder()
        .distributeUsing(distributor)
        .create();

    try (NewSessionPayload payload = NewSessionPayload.create(new ChromeOptions())) {
      // Use up all the capacity in the distributor
      ActiveSession firstSession = scheduler.createSession(payload);
      ActiveSession secondSession = scheduler.createSession(payload);

      assertTrue(firstSession.isActive());
      assertTrue(secondSession.isActive());

      // Bring down the host
      isUp.set(false);
      wait.until(h -> h.getStatus() == DOWN);

      assertFalse(firstSession.isActive());
      assertFalse(secondSession.isActive());
    }
  }
}
