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
import static java.util.logging.Level.WARNING;
import static org.openqa.selenium.remote.server.scheduler.Host.Status.DOWN;
import static org.openqa.selenium.remote.server.scheduler.Host.Status.UP;

import com.google.common.collect.ImmutableList;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.remote.server.SessionFactory;

import java.time.Instant;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import java.util.logging.Logger;

/**
 * Represents a physical host machine that can run a set of
 * {@link org.openqa.selenium.remote.server.ActiveSession}s. This class is not thread safe, and it
 * is intended that a {@code Host} instance be added to only one {@link Distributor}.
 */
public class Host {

  private final static Logger LOG = Logger.getLogger(Host.class.getName());

  private final ScheduledExecutorService healthCheckService;
  private final String name;
  private final ImmutableList<ScheduledSessionFactory> factories;
  private final int maxConcurrentSessions;

  private volatile Status status;

  private Host(
      String name,
      ImmutableList<SessionFactory> factories,
      int maxConcurrentSessions,
      Health health) {
    this.name = Objects.requireNonNull(name, "Name must be set");
    this.maxConcurrentSessions = maxConcurrentSessions;

    this.factories = factories.stream()
      .map(factory -> {
        if (factory instanceof ScheduledSessionFactory) {
          return (ScheduledSessionFactory) factory;
        }
        return new ScheduledSessionFactory(factory);
      })
    .collect(ImmutableList.toImmutableList());

    // Let the host know whether or not it's up or not
    health.init(this);

    // And now make sure we keep the health status updated.
    healthCheckService = new ScheduledThreadPoolExecutor(
        1,
        r -> new Thread(r, "Health check for " + name));
    healthCheckService.scheduleWithFixedDelay(
        () -> {
          try {
            health.accept(this);
          } catch (Throwable t) {
            LOG.log(
                WARNING,
                String.format("Problem probing health of %s: %s", name, t.getMessage()),
                t);
          }
        },
        0,
        1,
        SECONDS);
  }

  public static Builder builder() {
    return new Builder();
  }

  public String getName() {
    return name;
  }

  public Status getStatus() {
    return status;
  }

  public Host setStatus(Status status) {
    this.status = Objects.requireNonNull(status, "Status must be set");
    return this;
  }

  public boolean isSupporting(Capabilities caps) {
    return factories.stream()
        .map(factory -> factory.isSupporting(caps))
        .reduce(false, Boolean::logicalOr);
  }

  // This should probably be a percentage
  public int getRemainingCapacity() {
    if (factories.isEmpty()) {
      return 0;
    }

    int size = factories.size();
    long free = factories.stream().filter(ScheduledSessionFactory::isAvailable).count();

    return Math.round((free / size) * 100);
  }

  public Optional<SessionFactoryAndCapabilities> match(Capabilities caps) {
    if (getSessionCount() >= maxConcurrentSessions) {
      return Optional.empty();
    }

    return factories.stream()
        .filter(factory -> factory.isSupporting(caps))
        .filter(ScheduledSessionFactory::isAvailable)
        .map(factory -> new SessionFactoryAndCapabilities(factory, caps))
        .findFirst();
  }

  public long getSessionCount() {
    return factories.stream()
        .filter(factory -> !factory.isAvailable())
        .count();
  }

  public long getLastSessionCreated() {
    return factories.stream()
        .map(ScheduledSessionFactory::getLastSessionCreated)
        .reduce(Math::max)
        .orElse(0L);
  }

  @Override
  public String toString() {
    return "Host " + name + " -> " + getStatus() + " (" + getSessionCount() + ")";
  }

  public static class Builder {

    private static final Consumer<Host> ON_UP = host -> {
      Host.LOG.info(host.name + " changing status to up");
      host.setStatus(UP);
    };
    private static final Consumer<Host> ON_DOWN = host -> {
      Host.LOG.info(host.name + " changing status to down");
      host.setStatus(DOWN);
      host.factories.forEach(ScheduledSessionFactory::killSession);
    };

    private String name;
    private ImmutableList.Builder<SessionFactory> factories;
    private int maxSessions = Integer.MAX_VALUE;
    private Health health;

    private Builder() {
      this.factories = ImmutableList.builder();
      this.health = new Health(
          () -> new HealthCheck.Result(true, "Assumed healthy"),
          ON_DOWN,
          ON_UP);
    }

    public Builder name(String name) {
      this.name = Objects.requireNonNull(name, "Name cannot be null");
      return this;
    }

    public Builder add(SessionFactory factory) {
      factories.add(Objects.requireNonNull(factory, "Session factory cannot be null"));
      return this;
    }

    public Host create() {
      return new Host(name, factories.build(), maxSessions, health);
    }

    public Builder maxSessions(int maxSessionCount) {
      if (maxSessionCount < 1) {
        throw new IllegalArgumentException(
            "Maximum session count must allow at least one session: " + maxSessionCount);
      }
      this.maxSessions = maxSessionCount;
      return this;
    }

    public Builder healthCheck(HealthCheck check) {
      Objects.requireNonNull(check);
      health = new Health(check, ON_DOWN, ON_UP);
      return this;
    }

    public Builder healthCheck(HealthCheck check, Consumer<Host> onDown, Consumer<Host> onUp) {
      Objects.requireNonNull(check);
      health = new Health(check, onDown.andThen(ON_DOWN), onUp.andThen(ON_UP));
      return this;
    }
  }

  public enum Status {
    UP,
    DRAINING,
    DOWN
  }

  private static class Health implements Consumer<Host> {

    private final HealthCheck check;
    private final Consumer<Host> onDown;
    private final Consumer<Host> onUp;
    private final AtomicReference<Instant> since;

    private Health(HealthCheck check, Consumer<Host> onDown, Consumer<Host> onUp) {
      this.check = Objects.requireNonNull(check, "Health check cannot be null");
      this.onDown = Objects.requireNonNull(onDown, "Health check on down handler cannot be null");
      this.onUp = Objects.requireNonNull(onUp, "Health check on up handler cannot be null");

      this.since = new AtomicReference<>(Instant.now());
    }

    void init(Host host) {
      HealthCheck.Result result = runCheck();
      since.set(Instant.now());

      if (result.isAlive()) {
        onUp.accept(host);
      } else {
        onDown.accept(host);
      }
    }

    @Override
    public void accept(Host host) {
      HealthCheck.Result result = runCheck();

      // Both "draining" and "up" count as being alive. It's only when it's down that we need do
      // anything.
      boolean previously = host.getStatus() != DOWN;

      if (!result.isAlive() && previously) {
        since.set(Instant.now());
        onDown.accept(host);
      } else if (result.isAlive() && !previously) {
        since.set(Instant.now());
        onUp.accept(host);
      }
    }

    private HealthCheck.Result runCheck() {
      HealthCheck.Result result;
      try {
        result = this.check.check();
      } catch (Throwable t) {
        result = new HealthCheck.Result(false, "Unable to determine health");
      }
      return result;
    }
  }
}
