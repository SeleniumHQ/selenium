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

package org.openqa.selenium.grid.sessionqueue.config;

import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.remote.server.jmx.JMXHelper;
import org.openqa.selenium.remote.server.jmx.ManagedAttribute;
import org.openqa.selenium.remote.server.jmx.ManagedService;

import java.time.Duration;
import java.time.temporal.ChronoUnit;

@ManagedService(objectName = "org.seleniumhq.grid:type=Config,name=NewSessionQueueConfig",
    description = "New session queue config")
public class NewSessionQueueOptions {

  private static final String SESSIONS_QUEUE_SECTION = "sessionqueue";
  private static final String DEFAULT_NEWSESSION_QUEUE =
    "org.openqa.selenium.grid.sessionmap.remote.LocalNewSessionQueue";
  private static final int DEFAULT_REQUEST_TIMEOUT = 300;
  private static final int DEFAULT_RETRY_INTERVAL = 5;


  private final Config config;

  public NewSessionQueueOptions(Config config) {
    this.config = config;
    new JMXHelper().register(this);
  }

  public Duration getSessionRequestTimeout() {
    int timeout = config.getInt(SESSIONS_QUEUE_SECTION, "session-request-timeout")
      .orElse(DEFAULT_REQUEST_TIMEOUT);

    if (timeout <= 0) {
      return Duration.ofSeconds(DEFAULT_REQUEST_TIMEOUT);
    }
    return Duration.ofSeconds(timeout);
  }

  public Duration getSessionRequestRetryInterval() {
    int interval = config.getInt(SESSIONS_QUEUE_SECTION, "session-retry-interval")
      .orElse(DEFAULT_RETRY_INTERVAL);

    if (interval <= 0) {
      return Duration.ofSeconds(DEFAULT_RETRY_INTERVAL);
    }
    return Duration.ofSeconds(interval);
  }

  @ManagedAttribute(name = "RequestTimeoutSeconds")
  public long getRequestTimeoutSeconds() {
    return getSessionRequestTimeout().get(ChronoUnit.SECONDS);
  }

  @ManagedAttribute(name = "RetryIntervalSeconds")
  public long getRetryIntervalSeconds() {
    return getSessionRequestRetryInterval().get(ChronoUnit.SECONDS);
  }

  public NewSessionQueue getSessionQueue() {
    return config
      .getClass(SESSIONS_QUEUE_SECTION, "implementation", NewSessionQueue.class,
        DEFAULT_NEWSESSION_QUEUE);
  }
}
