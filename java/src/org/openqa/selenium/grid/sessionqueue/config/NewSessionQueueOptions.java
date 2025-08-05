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

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.util.Optional;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.jmx.JMXHelper;
import org.openqa.selenium.grid.jmx.ManagedAttribute;
import org.openqa.selenium.grid.jmx.ManagedService;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;

@ManagedService(
    objectName = "org.seleniumhq.grid:type=Config,name=NewSessionQueueConfig",
    description = "New session queue config")
public class NewSessionQueueOptions {

  static final String SESSION_QUEUE_SECTION = "sessionqueue";
  static final String DEFAULT_SESSION_QUEUE =
      "org.openqa.selenium.grid.sessionqueue.remote.RemoteNewSessionQueue";
  static final int DEFAULT_MAXIMUM_RESPONSE_DELAY = 8;
  static final int DEFAULT_REQUEST_TIMEOUT = 300;
  static final int DEFAULT_REQUEST_TIMEOUT_PERIOD = 10;
  static final int DEFAULT_RETRY_INTERVAL = 15;
  static final int DEFAULT_BATCH_SIZE = Runtime.getRuntime().availableProcessors() * 3;

  private final Config config;

  public NewSessionQueueOptions(Config config) {
    this.config = config;
    new JMXHelper().register(this);
  }

  public URI getSessionQueueUri() {

    BaseServerOptions serverOptions = new BaseServerOptions(config);
    String scheme =
        config
            .get(SESSION_QUEUE_SECTION, "scheme")
            .orElse((serverOptions.isSecure() || serverOptions.isSelfSigned()) ? "https" : "http");

    Optional<URI> host =
        config
            .get(SESSION_QUEUE_SECTION, "host")
            .map(
                str -> {
                  try {
                    URI sessionQueueUri = new URI(str);
                    if (sessionQueueUri.getHost() == null || sessionQueueUri.getPort() == -1) {
                      throw new ConfigException(
                          "Undefined host or port in SessionQueue server URI: " + str);
                    }
                    return sessionQueueUri;
                  } catch (URISyntaxException e) {
                    throw new ConfigException(
                        "Session queue server URI is not a valid URI: " + str);
                  }
                });

    if (host.isPresent()) {
      return host.get();
    }

    Optional<Integer> port = config.getInt(SESSION_QUEUE_SECTION, "port");
    Optional<String> hostname = config.get(SESSION_QUEUE_SECTION, "hostname");

    if (!(port.isPresent() && hostname.isPresent())) {
      throw new ConfigException("Unable to determine host and port for the session queue server");
    }

    try {
      return new URI(scheme, null, hostname.get(), port.get(), "", null, null);
    } catch (URISyntaxException e) {
      throw new ConfigException(
          "Session queue server uri configured through host (%s) and port (%d) is not a valid URI",
          hostname.get(), port.get());
    }
  }

  /**
   * Gets the Redis URI for Redis-backed session queue configuration.
   *
   * @return Redis URI constructed from hostname and port configuration
   */
  public URI getRedisUri() {
    Optional<Integer> port = config.getInt(SESSION_QUEUE_SECTION, "port");
    Optional<String> hostname = config.get(SESSION_QUEUE_SECTION, "hostname");

    if (!(port.isPresent() && hostname.isPresent())) {
      throw new ConfigException(
          "Unable to determine Redis hostname and port for the session queue");
    }

    try {
      return new URI("redis", null, hostname.get(), port.get(), "", null, null);
    } catch (URISyntaxException e) {
      throw new ConfigException(
          "Redis session queue uri configured through hostname (%s) and port (%d) is not a valid"
              + " URI",
          hostname.get(), port.get());
    }
  }

  /**
   * Gets the session queue scheme (e.g., "redis", "local", "remote").
   *
   * @return the session queue scheme
   */
  public Optional<String> getSessionQueueScheme() {
    return config.get(SESSION_QUEUE_SECTION, "scheme");
  }

  /**
   * Gets the session queue implementation class name.
   *
   * @return the implementation class name
   */
  public Optional<String> getSessionQueueImplementation() {
    return config.get(SESSION_QUEUE_SECTION, "implementation");
  }

  /**
   * Gets the session queue hostname.
   *
   * @return the hostname
   */
  public Optional<String> getSessionQueueHostname() {
    return config.get(SESSION_QUEUE_SECTION, "hostname");
  }

  /**
   * Gets the session queue port.
   *
   * @return the port number
   */
  public Optional<Integer> getSessionQueuePort() {
    return config.getInt(SESSION_QUEUE_SECTION, "port");
  }

  @ManagedAttribute(name = "SessionQueueScheme")
  public String getSessionQueueSchemeAttribute() {
    return getSessionQueueScheme().orElse("http");
  }

  @ManagedAttribute(name = "SessionQueueImplementation")
  public String getSessionQueueImplementationAttribute() {
    return getSessionQueueImplementation()
        .orElse("org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue");
  }

  @ManagedAttribute(name = "SessionQueueHostname")
  public String getSessionQueueHostnameAttribute() {
    return getSessionQueueHostname().orElse("localhost");
  }

  @ManagedAttribute(name = "SessionQueuePort")
  public int getSessionQueuePortAttribute() {
    return getSessionQueuePort().orElse(-1);
  }

  public Duration getMaximumResponseDelay() {
    int timeout =
        config
            .getInt(SESSION_QUEUE_SECTION, "maximum-response-delay")
            .orElse(DEFAULT_MAXIMUM_RESPONSE_DELAY);

    return Duration.ofSeconds(timeout);
  }

  public Duration getSessionRequestTimeout() {
    // If the user sets 0 or less, we default to 1s.
    int timeout =
        Math.max(
            config
                .getInt(SESSION_QUEUE_SECTION, "session-request-timeout")
                .orElse(DEFAULT_REQUEST_TIMEOUT),
            1);

    return Duration.ofSeconds(timeout);
  }

  public Duration getSessionRequestTimeoutPeriod() {
    // If the user sets 0 or less, we default to 1s.
    int timeout =
        Math.max(
            config
                .getInt(SESSION_QUEUE_SECTION, "session-request-timeout-period")
                .orElse(DEFAULT_REQUEST_TIMEOUT_PERIOD),
            1);

    return Duration.ofSeconds(timeout);
  }

  public Duration getSessionRequestRetryInterval() {
    // If the user sets 0 or less, we default to DEFAULT_RETRY_INTERVAL (in milliseconds).
    int interval =
        Math.max(
            config
                .getInt(SESSION_QUEUE_SECTION, "session-retry-interval")
                .orElse(DEFAULT_RETRY_INTERVAL),
            DEFAULT_RETRY_INTERVAL);
    return Duration.ofMillis(interval);
  }

  public int getBatchSize() {
    // If the user sets 0 or less, we default to 10.
    int batchSize =
        Math.max(
            config
                .getInt(SESSION_QUEUE_SECTION, "sessionqueue-batch-size")
                .orElse(DEFAULT_BATCH_SIZE),
            1);

    return batchSize;
  }

  @ManagedAttribute(name = "RequestTimeoutSeconds")
  public long getRequestTimeoutSeconds() {
    return getSessionRequestTimeout().getSeconds();
  }

  @ManagedAttribute(name = "RetryIntervalMilliseconds")
  public long getRetryIntervalMilliseconds() {
    return getSessionRequestRetryInterval().toMillis();
  }

  public NewSessionQueue getSessionQueue() {
    return config.getClass(
        SESSION_QUEUE_SECTION, "implementation", NewSessionQueue.class, DEFAULT_SESSION_QUEUE);
  }
}
