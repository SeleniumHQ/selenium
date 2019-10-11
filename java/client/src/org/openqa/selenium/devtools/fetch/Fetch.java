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

package org.openqa.selenium.devtools.fetch;

import static org.openqa.selenium.devtools.ConverterFunctions.map;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Beta;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.io.model.StreamHandle;
import org.openqa.selenium.devtools.fetch.model.AuthChallengeResponse;
import org.openqa.selenium.devtools.fetch.model.AuthRequired;
import org.openqa.selenium.devtools.fetch.model.HeaderEntry;
import org.openqa.selenium.devtools.fetch.model.RequestId;
import org.openqa.selenium.devtools.fetch.model.RequestPattern;
import org.openqa.selenium.devtools.fetch.model.RequestPaused;
import org.openqa.selenium.devtools.fetch.model.ResponseBody;
import org.openqa.selenium.devtools.network.model.ErrorReason;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * A domain for letting clients substitute browser's network layer with client code.
 */
@Beta
public class Fetch {

  /**
   * Disables the fetch domain.
   */
  public static Command<Void> disable() {
    return new Command<>("Fetch.disable", ImmutableMap.of());
  }

  /**
   * Disables the fetch domain.
   */
  public static Command<Void> enable(
      Optional<List<RequestPattern>> patterns, Optional<Boolean> handleAuthRequests) {
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    patterns.ifPresent(p -> params.put("patterns", p));
    handleAuthRequests.ifPresent(h -> params.put("handleAuthRequests", h));
    return new Command<>("Fetch.enable", params.build());
  }

  /**
   * Causes the request to fail with specified reason.
   */
  public static Command<Void> failRequest(RequestId requestId, ErrorReason errorReason) {
    Objects.requireNonNull(requestId, "requestId is required");
    Objects.requireNonNull(errorReason, "errorReason is required");
    return new Command<>(
        "Fetch.failRequest",
        ImmutableMap.of("requestId", requestId.toString(), "errorReason", errorReason));
  }

  /**
   * Provides response to the request.
   */
  public static Command<Void> fulfillRequest(
      RequestId requestId,
      int responseCode,
      List<HeaderEntry> responseHeaders,
      Optional<String> body,
      Optional<String> responsePhrase) {
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    Objects.requireNonNull(requestId, "requestId is required");
    if (responseCode < 0) {
      throw new DevToolsException("Invalid http responseCode");
    }
    responseHeaders = validateHeaders(responseHeaders);
    params.put("requestId", requestId.toString());
    params.put("responseHeaders", responseHeaders);
    params.put("responseCode", responseCode);
    body.ifPresent(b -> params.put("body", b));
    responsePhrase.ifPresent(phrase -> params.put("responsePhrase", phrase));
    return new Command<Void>("Fetch.fulfillRequest", params.build());
  }

  /**
   * Continues the request, optionally modifying some of its parameters.
   */
  public static Command<Void> continueRequest(
      RequestId requestId,
      Optional<String> url,
      Optional<String> method,
      Optional<String> postData,
      Optional<List<HeaderEntry>> headers) {
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    Objects.requireNonNull(requestId, "requestId is required");
    params.put("requestId", requestId.toString());
    url.ifPresent(s -> params.put("url", s));
    method.ifPresent(s -> params.put("method", s));
    postData.ifPresent(s -> params.put("postData", s));
    headers.ifPresent(h -> params.put("headers", h));
    return new Command<>("Fetch.continueRequest", params.build());
  }

  /**
   * Continues a request supplying authChallengeResponse following authRequired event.
   */
  public static Command<Void> continueWithAuth(
      RequestId requestId, AuthChallengeResponse authChallengeResponse) {
    Objects.requireNonNull(requestId, "requestId is required");
    Objects.requireNonNull(authChallengeResponse, "authChallengeResponse is required");
    return new Command<>(
        "Fetch.continueWithAuth",
        ImmutableMap.of("requestId", requestId.toString(), "authChallengeResponse", authChallengeResponse));
  }

  /**
   * Causes the body of the response to be received from the server and returned as a single string.
   * May only be issued for a request that is paused in the Response stage and is mutually exclusive
   * with takeResponseBodyForInterceptionAsStream. Calling other methods that affect the request or
   * disabling fetch domain before body is received results in an undefined behavior.
   */
  public static Command<ResponseBody> getResponseBody(RequestId requestId) {
    Objects.requireNonNull(requestId, "requestId is required");
    return new Command<>(
        "Fetch.getResponseBody",
        ImmutableMap.of("requestId", requestId.toString()),
        map("body", ResponseBody.class));
  }

  /**
   * Returns a handle to the stream representing the response body. The request must be paused in
   * the HeadersReceived stage. Note that after this command the request can't be continued as is --
   * client either needs to cancel it or to provide the response body. The stream only supports
   * sequential read, IO.read will fail if the position is specified. This method is mutually
   * exclusive with getResponseBody. Calling other methods that affect the request or disabling
   * fetch domain before body is received results in an undefined behavior.
   */
  public static Command<StreamHandle> takeResponseBodyAsStream(RequestId requestId) {
    Objects.requireNonNull(requestId, "requestId is required");
    return new Command<>(
        "Fetch.takeResponseBodyAsStream",
        ImmutableMap.of("requestId", requestId.toString()),
        map("stream", StreamHandle.class));
  }

  /**
   * Issued when the domain is enabled and the request URL matches the specified filter. The request
   * is paused until the client responds with one of continueRequest, failRequest or fulfillRequest.
   * The stage of the request can be determined by presence of responseErrorReason and
   * responseStatusCode -- the request is at the response stage if either of these fields is present
   * and in the request stage otherwise.
   */
  public static Event<RequestPaused> requestPaused() {
    return new Event<>("Fetch.requestPaused", map("requestId", RequestPaused.class));
  }

  /**
   * Issued when the domain is enabled with handleAuthRequests set to true. The request is paused
   * until client responds with continueWithAuth.
   */
  public static Event<AuthRequired> authRequired() {
    return new Event<>("Fetch.authRequired", map("requestId", AuthRequired.class));
  }

  /**
   * Validators
   */
  private static List<HeaderEntry> validateHeaders(List<HeaderEntry> responseHeaders) {
    Objects.requireNonNull(responseHeaders, "responseHeaders is required");
    if (responseHeaders.isEmpty()) {
      throw new DevToolsException("responseHeaders is empty");
    }
    responseHeaders.forEach(Fetch::validateHeader);
    return responseHeaders;
  }

  private static HeaderEntry validateHeader(HeaderEntry responseHeader) {
    return Objects.requireNonNull(responseHeader, "responseHeader is required");
  }
}
