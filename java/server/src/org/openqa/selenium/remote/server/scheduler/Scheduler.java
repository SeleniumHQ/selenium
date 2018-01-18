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

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static java.util.logging.Level.WARNING;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.server.ActiveSession;

import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Queue;
import java.util.Set;
import java.util.concurrent.BlockingDeque;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Scheduler {

  private final Logger LOG = Logger.getLogger(Scheduler.class.getName());

  private final AtomicInteger sessionStarterCount = new AtomicInteger(0);
  private final ExecutorService sessionStarter = Executors.newCachedThreadPool(
      r -> new Thread(r, "Selenium scheduler: " + sessionStarterCount.getAndIncrement()));
  private final ScheduledExecutorService delayedRequests = Executors.newScheduledThreadPool(
      1,
      r -> new Thread(r,"Selenium scheduled delayed requests"));

  private final Distributor distributor;
  private final int flakyRetryCount;

  private final ReentrantLock lock = new ReentrantLock(true);
  private final BlockingDeque<NewSessionRequest> requests;
  private final Queue<NewSessionRequest> delayed = new ConcurrentLinkedQueue<>();
  private final RetryDelay schedule;

  private Scheduler(
      Distributor distributor,
      int flakyRetryCount,
      RetryDelay schedule) {
    this.distributor = Objects.requireNonNull(distributor, "Distributor cannot be null");
    this.flakyRetryCount = flakyRetryCount;
    this.schedule = schedule;

    this.requests = new LinkedBlockingDeque<>();

    for (int i = 0; i < Runtime.getRuntime().availableProcessors(); i++) {
      sessionStarter.execute(() -> endlesslyCreateSessions(requests));
    }
  }

  public ActiveSession createSession(NewSessionPayload payload) throws SessionNotCreatedException {
    NewSessionRequest request = new NewSessionRequest(payload, schedule);

    requests.add(request);
    Optional<ActiveSession> session = request.getResult();
    return session.orElseThrow(
        () -> new SessionNotCreatedException("Unable to create a new session for " + payload));
  }

  public void stop() {
    sessionStarter.shutdownNow();
    delayedRequests.shutdownNow();

    // Clear out the list of requests
    delayed.forEach(request -> request.setResult(Optional.empty()));
    requests.forEach(request -> request.setResult(Optional.empty()));
  }

  private void endlesslyCreateSessions(BlockingDeque<NewSessionRequest> requests) {
    try {
      while (true) {
        NewSessionRequest request = requests.take();
        attemptToStartSession(request);
      }
    } catch (InterruptedException e) {
      LOG.info("Interrupted. No longer attempting to pull requests");
      Thread.currentThread().interrupt();
    }
  }

  public static Builder builder() {
    return new Builder();
  }

  private void attemptToStartSession(NewSessionRequest request) {
    try {
      // Track the entries to ignore
      List<ScheduledSessionFactory> toIgnore = new LinkedList<>();
      Iterator<Capabilities> allCapabilities = request.getCapabilities();

      while (allCapabilities.hasNext()) {
        Capabilities caps = allCapabilities.next();

        Optional<SessionFactoryAndCapabilities> match = findFactory(toIgnore, caps);
        while (match.isPresent()) {
          Optional<ActiveSession> session = startSession(
              match.get(),
              request.getDownstreamDialects());

          if (session.isPresent()) {
            request.setResult(session);
            return;
          }

          // We didn't succeed with this session factory. Maybe there's another one? Mark the
          // factory as being free so someone else can try and use it, and add it to our ignore list
          // before looping around again
          match.map(SessionFactoryAndCapabilities::getSessionFactory).ifPresent(factory -> {
            factory.setAvailable(true);
            toIgnore.add(factory);
          });

          match = findFactory(toIgnore, caps);
        }
      }

      RetryDelay retryDelay = request.getRetrySchedule();
      if (retryDelay != null) {
        delayed.add(request);
        delayedRequests.schedule(
            () -> {
              delayed.remove(request);
              try {
                requests.putFirst(request);
              } catch (InterruptedException e) {
                request.setResult(Optional.empty());
                Thread.currentThread().interrupt();
              }
              return request;
            },
            retryDelay.getDelay().toMillis(), MILLISECONDS);
        return;
      }
    } catch (Throwable t) {
      LOG.log(
          WARNING,
          "Something unexpected happened when starting the session: " + t.getMessage(),
          t);
    }

    // We failed to start the session. Notify the user.
    request.setResult(Optional.empty());
  }

  private Optional<ActiveSession> startSession(
      SessionFactoryAndCapabilities factory,
      Set<Dialect> downstreamDialects) {
    // Go through the loop at least once.
    for (int count = 0; count <= flakyRetryCount; count++) {
      try {
        Optional<ActiveSession> session = factory.newSession(downstreamDialects);

        if (session.isPresent()) {
          return session;
        }
      } catch (Exception e) {
        LOG.log(Level.WARNING, "Unable to start session: " + e.getMessage(), e);
      }
    }
    return Optional.empty();
  }

  private Optional<SessionFactoryAndCapabilities> findFactory(
      List<ScheduledSessionFactory> toIgnore,
      Capabilities capabilities) {
    lock.lock();
    try {
      return distributor.match(
          capabilities,
          stream -> {
            Optional<SessionFactoryAndCapabilities> toReturn = stream
                .filter(m -> !toIgnore.contains(m.getSessionFactory()))
                .findFirst();
            toReturn.ifPresent(m -> {
              // Make sure we never use this factory again for this session
              toIgnore.add(m.getSessionFactory());
              // And mark it as being used.
              m.getSessionFactory().setAvailable(false);
            });
            return toReturn;
          });
    } finally {
      lock.unlock();
    }
  }


  public static class Builder {
    private Distributor distributor;
    private int flakyRetryCount;
    private RetryDelay schedule;

    private Builder() {
      // no-op
    }

    public Builder distributeUsing(Distributor distributor) {
      this.distributor = Objects.requireNonNull(distributor, "Distributor cannot be null");
      return this;
    }

    public Scheduler create() {
      return new Scheduler(distributor, flakyRetryCount, schedule);
    }

    /**
     * When creating a new session, allow the session to attempt to be started this many times
     * before scheduling the session for a retry. It's possible the underlying implementation isn't
     * stable, which is why this method is provided.
     */
    public Builder retryFlakyStarts(int flakyRestartCount) {
      if (flakyRestartCount < 0) {
        throw new IllegalArgumentException(
            "Retry count must be greater than 0: " + flakyRestartCount);
      }
      this.flakyRetryCount = flakyRestartCount;
      return this;
    }

    public Builder retrySchedule(RetryDelay schedule) {
      this.schedule = Objects.requireNonNull(schedule, "Retry schedule cannot be null");
      return this;
    }
  }
}
