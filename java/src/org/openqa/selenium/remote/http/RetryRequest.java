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

import static java.net.HttpURLConnection.HTTP_CLIENT_TIMEOUT;
import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_UNAVAILABLE;
import static org.openqa.selenium.internal.Debug.getDebugLogLevel;
import static org.openqa.selenium.remote.http.Contents.asJson;

import dev.failsafe.Failsafe;
import dev.failsafe.Fallback;
import dev.failsafe.RetryPolicy;
import dev.failsafe.event.ExecutionAttemptedEvent;
import dev.failsafe.function.CheckedFunction;
import java.net.ConnectException;
import java.util.Map;
import java.util.logging.Logger;

public class RetryRequest implements Filter {

  private static final Logger LOG = Logger.getLogger(RetryRequest.class.getName());

  private static final Fallback<HttpResponse> fallback =
      Fallback.of(
          (CheckedFunction<ExecutionAttemptedEvent<? extends HttpResponse>, ? extends HttpResponse>)
              RetryRequest::getFallback);

  // Retry on connection error.
  private static final RetryPolicy<HttpResponse> connectionFailurePolicy =
      RetryPolicy.<HttpResponse>builder()
          .handleIf(failure -> failure.getCause() instanceof ConnectException)
          .withMaxRetries(3)
          .onRetry(
              e ->
                  LOG.log(
                      getDebugLogLevel(),
                      "Connection failure #{0}. Retrying.",
                      e.getAttemptCount()))
          .build();

  // Retry if server is unavailable or an internal server error occurs without response body.
  private static final RetryPolicy<HttpResponse> serverErrorPolicy =
      RetryPolicy.<HttpResponse>builder()
          .handleResultIf(
              response ->
                  response.getStatus() == HTTP_INTERNAL_ERROR
                      && Integer.parseInt((response).getHeader(HttpHeader.ContentLength.getName()))
                          == 0)
          .handleResultIf(response -> (response).getStatus() == HTTP_UNAVAILABLE)
          .withMaxRetries(2)
          .onRetry(
              e ->
                  LOG.log(
                      getDebugLogLevel(),
                      "Failure due to server error #{0}. Retrying.",
                      e.getAttemptCount()))
          .build();

  @Override
  public HttpHandler apply(HttpHandler next) {
    return req ->
        Failsafe.with(fallback)
            .compose(serverErrorPolicy)
            .compose(connectionFailurePolicy)
            .get(() -> next.execute(req));
  }

  private static HttpResponse getFallback(
      ExecutionAttemptedEvent<? extends HttpResponse> executionAttemptedEvent) throws Exception {
    if (executionAttemptedEvent.getLastException() != null) {
      Exception exception = (Exception) executionAttemptedEvent.getLastException();
      if (exception.getCause() instanceof ConnectException) {
        return new HttpResponse()
            .setStatus(HTTP_CLIENT_TIMEOUT)
            .setContent(asJson(Map.of("value", Map.of("message", "Connection failure"))));
      } else throw exception;
    } else if (executionAttemptedEvent.getLastResult() != null) {
      HttpResponse response = executionAttemptedEvent.getLastResult();
      if ((response.getStatus() == HTTP_INTERNAL_ERROR
              && Integer.parseInt(response.getHeader(HttpHeader.ContentLength.getName())) == 0)
          || response.getStatus() == HTTP_UNAVAILABLE) {
        return new HttpResponse()
            .setStatus(response.getStatus())
            .setContent(asJson(Map.of("value", Map.of("message", "Internal server error"))));
      }
    }
    return executionAttemptedEvent.getLastResult();
  }
}
