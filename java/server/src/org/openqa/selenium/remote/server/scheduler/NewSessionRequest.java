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

import static java.util.concurrent.TimeUnit.MINUTES;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.server.ActiveSession;

import java.io.IOException;
import java.util.Collections;
import java.util.Iterator;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

class NewSessionRequest {

  private final NewSessionPayload payload;
  private final Iterator<RetryDelay> scheduleIterator;
  private final CountDownLatch latch;
  private volatile Optional<ActiveSession> result;

  NewSessionRequest(
      NewSessionPayload payload,
      RetryDelay schedule) {
    this.payload = Objects.requireNonNull(payload, "New session payload cannot be null");
    this.scheduleIterator = schedule == null ? Collections.emptyIterator() : schedule.iterator();
    this.latch = new CountDownLatch(1);
  }

  void setResult(Optional<ActiveSession> result) {
    this.result = result;
    latch.countDown();
  }

  Optional<ActiveSession> getResult() {
    try {
      latch.await(5, MINUTES);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new SessionNotCreatedException("Interrupted while creating session", e);
    }

    if (result == null) {
      throw new IllegalStateException("Result has not been set.");
    }

    return result;
  }

  public Iterator<Capabilities> getCapabilities() {
    try {
      return payload.stream().iterator();
    } catch (IOException e) {
      throw new SessionNotCreatedException(
          "Unable to read capabilities from payload: " + e.getMessage(),
          e);
    }
  }

  public Set<Dialect> getDownstreamDialects() {
    return payload.getDownstreamDialects();
  }

  public RetryDelay getRetrySchedule() {
    if (scheduleIterator.hasNext()) {
      return scheduleIterator.next();
    }
    return null;
  }
}
