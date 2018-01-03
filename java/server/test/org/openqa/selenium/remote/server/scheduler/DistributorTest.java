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
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.remote.Dialect.OSS;
import static org.openqa.selenium.remote.server.scheduler.Host.Status.DOWN;
import static org.openqa.selenium.remote.server.scheduler.Host.Status.DRAINING;
import static org.openqa.selenium.remote.server.scheduler.Host.Status.UP;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;

import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.server.ActiveSession;
import org.openqa.selenium.remote.server.SessionFactory;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.testing.Assertions;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

public class DistributorTest {

  @Test
  public void shouldListHostsWithLightestLoadedFirst() {
    // Create enough hosts so that we avoid the scheduler returning hosts in:
    // * insertion order
    // * reverse insertion order
    // * sorted with most heavily used first
    Host lightest = spy(Host.builder().name("light").create());
    when(lightest.getRemainingCapacity()).thenReturn(10);
    when(lightest.isSupporting(any())).thenReturn(true);

    Host medium = spy(Host.builder().name("medium").create());
    when(medium.getRemainingCapacity()).thenReturn(30);
    when(medium.isSupporting(any())).thenReturn(true);

    Host heavy = spy(Host.builder().name("heavy").create());
    when(heavy.getRemainingCapacity()).thenReturn(50);
    when(heavy.isSupporting(any())).thenReturn(true);

    Host massive = spy(Host.builder().name("massive").create());
    when(massive.getRemainingCapacity()).thenReturn(80);
    when(massive.isSupporting(any())).thenReturn(true);

    Distributor distributor = new Distributor()
        .add(heavy)
        .add(medium)
        .add(lightest)
        .add(massive);

    ImmutableList<Host> results = distributor.getHosts().collect(ImmutableList.toImmutableList());

    assertEquals(ImmutableList.of(lightest, medium, heavy, massive), results);
  }

  @Test
  public void shouldUseLastSessionCreatedTimeAsTieBreaker() {
    Host leastRecent = spy(Host.builder().name("first").create());
    when(leastRecent.getLastSessionCreated()).thenReturn(50L);

    Host middle = spy(Host.builder().name("middle").create());
    when(middle.getLastSessionCreated()).thenReturn(100L);

    Host mostRecent = spy(Host.builder().name("latest").create());
    when(mostRecent.getLastSessionCreated()).thenReturn(150L);

    Distributor distributor = new Distributor().add(middle).add(mostRecent).add(leastRecent);

    List<Host> hosts = distributor.getHosts().collect(Collectors.toList());

    assertEquals(ImmutableList.of(mostRecent, middle, leastRecent), hosts);
  }

  @Test
  public void shouldForbidAddingIdenticallyNamedHostsToScheduler() {
    Host first = Host.builder().name("hello").create();
    Host second = Host.builder().name("hello").create();

    Distributor distributor = new Distributor().add(first);

    Assertions.assertException(
        () -> distributor.add(second),
        e -> assertTrue(e instanceof IllegalArgumentException));
  }

  @Test
  public void shouldIncludeHostsThatAreUpInHostList() {
    // It's okay to use the same factory repeatedly
    SessionFactory factory = new FakeSessionFactory(
        caps -> "firefox".equals(caps.getBrowserName()));

    Host up = Host.builder().name("up").add(factory).create().setStatus(UP);
    Host down = Host.builder()
        .name("down")
        .add(factory)
        .healthCheck(
            () -> new HealthCheck.Result(false, "Always down"),
            h -> h.setStatus(DOWN),
            h -> h.setStatus(UP))
        .create();
    Host draining = Host.builder().name("draining").add(factory).create().setStatus(DRAINING);

    Distributor distributor = new Distributor().add(up).add(down).add(draining);

    ImmutableList<SessionFactoryAndCapabilities> matches =
        distributor.match(new FirefoxOptions()).collect(ImmutableList.toImmutableList());

    assertEquals(1, matches.size());
  }

  @Test
  public void canScheduleAJobIfThereIsAFactoryThatMatches() {
    SessionFactory factory = new FakeSessionFactory(caps -> "chrome".equals(caps.getBrowserName()));
    Host host = Host.builder().name("localhost").add(factory).create();

    Distributor distributor = new Distributor().add(host);

    assertEquals(100, host.getRemainingCapacity());

    SessionFactoryAndCapabilities match = distributor.match(new ChromeOptions())
        .findFirst()
        .orElseThrow(() -> new AssertionError("Unable to create session"));

    // We don't actually care about the session
    Optional<ActiveSession> activeSession = match.newSession(ImmutableSet.of(OSS));

    assertTrue(activeSession.isPresent());
    assertEquals(0, host.getRemainingCapacity());
  }

  @Test
  public void shouldNotScheduleAJobOnASessionFactoryThatIsAlreadyBeingUsed() {
    SessionFactory factory = new FakeSessionFactory(caps -> "chrome".equals(caps.getBrowserName()));
    Host host = Host.builder().name("localhost").add(factory).create();

    Distributor distributor = new Distributor().add(host);

    SessionFactoryAndCapabilities match = distributor.match(new ChromeOptions())
        .findFirst()
        .orElseThrow(() -> new AssertionError("Unable to create session"));

    match.newSession(ImmutableSet.of(OSS));

    assertEquals(0, host.getRemainingCapacity());

    List<SessionFactoryAndCapabilities> matches =
        distributor.match(new ChromeOptions()).collect(Collectors.toList());

    assertTrue(matches.toString(), matches.isEmpty());
  }

  @Test
  public void factoryShouldBeMarkedAvailableOnceASessionStops() {
    SessionFactory factory = new FakeSessionFactory(caps -> "chrome".equals(caps.getBrowserName()));
    Host host = Host.builder().name("localhost").add(factory).create();

    Distributor distributor = new Distributor().add(host);

    SessionFactoryAndCapabilities match = distributor.match(new ChromeOptions())
        .findFirst()
        .orElseThrow(() -> new AssertionError("Unable to create session"));

    Optional<ActiveSession> session = match.newSession(ImmutableSet.of(OSS));
    assertEquals(0, host.getRemainingCapacity());
    session.get().stop();
    assertEquals(100, host.getRemainingCapacity());
  }

  @Test
  public void shouldGiveAnEmptyThereAreNoHostsThatSupportTheGivenSessionType() {
    SessionFactory factory = new FakeSessionFactory(caps -> "chrome".equals(caps.getBrowserName()));
    Host host = Host.builder().name("localhost").add(factory).create();

    Distributor distributor = new Distributor().add(host);

    List<SessionFactoryAndCapabilities> matches = distributor.match(new FirefoxOptions())
        .collect(Collectors.toList());

    assertTrue(matches.toString(), matches.isEmpty());
  }

  @Test
  public void shouldNotBeAbleToScheduleMoreSessionsThanAvailableCapacity() {
    // There are two session factories added, but we limit the host to only running 1 session at
    // most.

    // The factory gets wrapped and the delegate is stateless. This is fine to do.
    SessionFactory factory = new FakeSessionFactory(caps -> "chrome".equals(caps.getBrowserName()));
    Host host = Host.builder()
        .name("localhost")
        .add(factory)
        .add(factory)
        .maxSessions(1)
        .create();

    Distributor distributor = new Distributor().add(host);

    // Start the first session. We can ignore it safely since all we want to do is use up the
    // capacity of the host
    distributor.match(new ChromeOptions())
        .findFirst()
        .map(match -> match.newSession(ImmutableSet.of(OSS)))
        .orElseThrow(() -> new AssertionError("New session should have been created."));

    // We now expect the stream of matches to be empty, since the host has no additional capacity
    long count = distributor.match(new ChromeOptions()).count();
    assertEquals(0, count);
  }

  @Test
  public void attemptingToStartASessionWhichFailsMarksTheSessionFactoryAsAvailable() {
    SessionFactory delegate = mock(SessionFactory.class);
    // We want to throw an exception that shouldn't happen to ensure edge cases are okay
    when(delegate.apply(any(), any())).thenThrow(new IllegalArgumentException("Ouch"));
    when(delegate.isSupporting(any())).thenReturn(true);
    SessionFactory factory = new ScheduledSessionFactory(delegate);

    Distributor distributor = new Distributor()
        .add(Host.builder().name("localhost").add(factory).create());

    List<SessionFactoryAndCapabilities> matches =
        distributor.match(new FirefoxOptions()).collect(Collectors.toList());

    assertEquals(1, matches.size());

    Optional<ActiveSession> session = matches.get(0).newSession(ImmutableSet.of(OSS));
    assertFalse(session.isPresent());
  }

  @Test
  public void selfHealingRemoteHostsAreRegisteredOnceTheyAreOkay() {
    AtomicBoolean status = new AtomicBoolean(true);

    Host host = Host.builder()
        .name("localhost")
        .add(new FakeSessionFactory(caps -> "firefox".equals(caps.getBrowserName())))
        .healthCheck(() -> new HealthCheck.Result(status.get(), "It's down"))
        .create();

    // Check the host is up.
    assertEquals(UP, host.getStatus());

    // Toggle the status
    status.set(false);

    Wait<Host> wait = new FluentWait<>(host).withTimeout(2, SECONDS);
    wait.until(h -> h.getStatus() == DOWN);

    // Now bring the server up again
    status.set(true);
    wait.until(h -> h.getStatus() == UP);
  }

  @Test
  @Ignore
  public void shouldPriotizeHostsWithTheMostSlotsAvailableForASessionType() {
    // Consider the case where you have 1 Windows machine and 5 linux machines. All of these hosts
    // can run Chrome and Firefox sessions, but only one can run Edge sessions. Ideally, the machine
    // able to run Edge would be sorted last.

    fail("Write me");
  }

}
