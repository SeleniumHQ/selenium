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

package org.openqa.selenium.remote.http;

import static com.google.common.net.HttpHeaders.CONTENT_LENGTH;
import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_UNAVAILABLE;
import static org.openqa.selenium.internal.Debug.getDebugLogLevel;

import net.jodah.failsafe.Failsafe;
import net.jodah.failsafe.RetryPolicy;

import org.openqa.selenium.TimeoutException;

import java.net.ConnectException;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.logging.Logger;

public class RetryRequest implements Filter {

  private static final Logger LOG = Logger.getLogger(RetryRequest.class.getName());

  // Retry on connection error.
  private static final RetryPolicy<HttpResponse> connectionFailurePolicy =
    new RetryPolicy<HttpResponse>()
      .handleIf(failure -> failure.getCause() instanceof ConnectException)
      .withBackoff(1, 4, ChronoUnit.SECONDS)
      .withMaxRetries(3)
      .withMaxDuration(Duration.ofSeconds(10))
      .onRetry(e -> LOG.log(
        getDebugLogLevel(),
        "Connection failure #{0}. Retrying.",
        e.getAttemptCount()));

  // Retry on read timeout.
  private static final RetryPolicy<HttpResponse> readTimeoutPolicy =
    new RetryPolicy<HttpResponse>()
      .handle(TimeoutException.class)
      .withBackoff(1, 4, ChronoUnit.SECONDS)
      .withMaxRetries(3)
      .withMaxDuration(Duration.ofSeconds(10))
      .onRetry(e -> LOG.log(
        getDebugLogLevel(),
        "Read timeout #{0}. Retrying.",
        e.getAttemptCount()));

  // Retry if server is unavailable or an internal server error occurs without response body.
  private static final RetryPolicy<HttpResponse> serverErrorPolicy =
    new RetryPolicy<HttpResponse>()
      .handleResultIf(response -> response.getStatus() == HTTP_INTERNAL_ERROR &&
                                  Integer.parseInt(response.getHeader(CONTENT_LENGTH)) == 0)
      .handleResultIf(response -> response.getStatus() == HTTP_UNAVAILABLE)
      .withBackoff(1, 2, ChronoUnit.SECONDS)
      .withMaxRetries(2)
      .withMaxDuration(Duration.ofSeconds(3))
      .onRetry(e -> LOG.log(
        getDebugLogLevel(),
        "Failure due to server error #{0}. Retrying.",
        e.getAttemptCount()));

  @Override
  public HttpHandler apply(HttpHandler next) {
    return req -> Failsafe.with(
      connectionFailurePolicy,
      readTimeoutPolicy,
      serverErrorPolicy)
      .get(() -> next.execute(req));
  }
}
