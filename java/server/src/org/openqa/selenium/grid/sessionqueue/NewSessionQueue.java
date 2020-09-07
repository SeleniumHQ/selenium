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

import org.openqa.selenium.internal.Require;

import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.status.HasReadyState;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public abstract class NewSessionQueue implements HasReadyState {

  protected final Tracer tracer;

  protected final int retryInterval;

  public static String SESSIONREQUEST_TIMESTAMP_HEADER = "new-session-request-timestamp";

  public abstract boolean offerLast(HttpRequest request, UUID requestId);

  public abstract boolean offerFirst(HttpRequest request, UUID requestId);

  public abstract Optional<HttpRequest> poll();

  public void addTimestampHeader(HttpRequest request) {
    long timestamp = Instant.now().getEpochSecond();
    request.addHeader(SESSIONREQUEST_TIMESTAMP_HEADER, Long.toString(timestamp));
  }

  public NewSessionQueue(Tracer tracer, int retryInterval) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.retryInterval = Require.nonNull("Session request retry interval", retryInterval);
  }

}