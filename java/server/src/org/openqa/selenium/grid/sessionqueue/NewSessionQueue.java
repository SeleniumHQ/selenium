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

package org.openqa.selenium.grid.sessionqueue;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.status.HasReadyState;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public abstract class NewSessionQueue implements HasReadyState {

  protected final Tracer tracer;
  protected final Duration retryInterval;
  protected final Duration requestTimeout;

  protected NewSessionQueue(Tracer tracer, Duration retryInterval, Duration requestTimeout) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.retryInterval = Require.nonNull("Session request retry interval", retryInterval);
    this.requestTimeout = Require.nonNull("Session request timeout", requestTimeout);
  }

  public abstract boolean offerLast(SessionRequest request);

  public abstract boolean offerFirst(SessionRequest request);

  public abstract Optional<SessionRequest> remove(RequestId requestId);

  public abstract int clear();

  public abstract int getQueueSize();

  public abstract List<Set<Capabilities>> getQueuedRequests();

  public boolean hasRequestTimedOut(SessionRequest request) {
    Instant enque = request.getEnqueued();
    Instant deque = Instant.now();
    Duration duration = Duration.between(enque, deque);

    return duration.compareTo(requestTimeout) > 0;
  }

}
