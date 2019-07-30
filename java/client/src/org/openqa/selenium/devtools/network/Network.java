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

package org.openqa.selenium.devtools.network;

import static org.openqa.selenium.devtools.ConverterFunctions.map;

import com.google.common.collect.ImmutableMap;
import com.google.common.reflect.TypeToken;

import org.openqa.selenium.Beta;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.network.model.AuthChallengeResponse;
import org.openqa.selenium.devtools.network.model.ConnectionType;
import org.openqa.selenium.devtools.network.model.Cookie;
import org.openqa.selenium.devtools.network.model.Cookies;
import org.openqa.selenium.devtools.network.model.DataReceived;
import org.openqa.selenium.devtools.network.model.ErrorReason;
import org.openqa.selenium.devtools.network.model.EventSourceMessageReceived;
import org.openqa.selenium.devtools.network.model.InterceptionId;
import org.openqa.selenium.devtools.network.model.LoadingFailed;
import org.openqa.selenium.devtools.network.model.LoadingFinished;
import org.openqa.selenium.devtools.network.model.RequestId;
import org.openqa.selenium.devtools.network.model.RequestIntercepted;
import org.openqa.selenium.devtools.network.model.RequestPattern;
import org.openqa.selenium.devtools.network.model.RequestWillBeSent;
import org.openqa.selenium.devtools.network.model.ResourceChangedPriority;
import org.openqa.selenium.devtools.network.model.ResponseBody;
import org.openqa.selenium.devtools.network.model.ResponseReceived;
import org.openqa.selenium.devtools.network.model.SearchMatch;
import org.openqa.selenium.devtools.network.model.SignedExchangeReceived;
import org.openqa.selenium.devtools.network.model.WebSocketClosed;
import org.openqa.selenium.devtools.network.model.WebSocketCreated;
import org.openqa.selenium.devtools.network.model.WebSocketFrame;
import org.openqa.selenium.devtools.network.model.WebSocketFrameError;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

/**
 * All available DevTools Network methods and events
 */
@SuppressWarnings("OptionalUsedAsFieldOrParameterType")
public class Network {

  private final static String DOMAIN_NAME = "Network";

  public static Command<Void> clearBrowserCache() {
    return new Command<>(DOMAIN_NAME + ".clearBrowserCache", ImmutableMap.of());
  }

  public static Command<Void> clearBrowserCookies() {
    return new Command<>(DOMAIN_NAME + ".clearBrowserCookies", ImmutableMap.of());
  }

  /**
   * Response to Network.requestIntercepted which either modifies the request to continue with any modifications, or blocks it, or completes it with the provided response bytes.
   * If a network fetch occurs as a result which encounters a redirect an additional Network.requestIntercepted event will be sent with the same InterceptionId.
   * (EXPERIMENTAL)
   *
   * @param interceptionId        Identifier for the intercepted request
   * @param errorReason           If set this causes the request to fail with the given reason.
   *                              Passing Aborted for requests marked with isNavigationRequest also cancels the navigation. Must not be set in response to an authChallenge
   * @param rawResponse           If set the requests completes using with the provided base64 encoded raw response, including HTTP status line and headers etc...
   *                              Must not be set in response to an authChallenge
   * @param url                   If set the request url will be modified in a way that's not observable by page. Must not be set in response to an authChallenge
   * @param method                If set this allows the request method to be overridden. Must not be set in response to an authChallenge
   * @param postData              If set this allows postData to be set. Must not be set in response to an authChallenge
   * @param headers               If set this allows the request headers to be changed. Must not be set in response to an authChallenge
   * @param authChallengeResponse Response to a requestIntercepted with an authChallenge. Must not be set otherwise
   * @return DevTools Command
   */
  @Beta
  public static Command<Void> continueInterceptedRequest(InterceptionId interceptionId,
                                                         Optional<ErrorReason> errorReason,
                                                         Optional<String> rawResponse,
                                                         Optional<String> url,
                                                         Optional<String> method,
                                                         Optional<String> postData,
                                                         Optional<Map<String, String>> headers,
                                                         Optional<AuthChallengeResponse> authChallengeResponse) {

    Objects.requireNonNull(interceptionId, "interceptionId must be set.");

    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();

    params.put("interceptionId", interceptionId.toString());
    errorReason.ifPresent(reason -> params.put("errorReason", errorReason.get().name()));
    rawResponse.ifPresent(string -> params.put("rawResponse", rawResponse.toString()));
    url.ifPresent(string -> params.put("url", url.toString()));
    method.ifPresent(string -> params.put("method", method.toString()));
    postData.ifPresent(string -> params.put("postData", postData.toString()));
    headers.ifPresent(map -> params.put("headers", headers));
    authChallengeResponse.ifPresent(response -> params.put("authChallengeResponse", authChallengeResponse));

    return new Command<>(DOMAIN_NAME + ".continueInterceptedRequest", params.build());

  }

  /**
   * Deletes browser cookies with matching name and url or domain/path pair
   *
   * @param name   Name of the cookies to remove
   * @param url    If specified, deletes all the cookies with the given name where domain and path match provided URL
   * @param domain If specified, deletes only cookies with the exact domain.
   * @param path   If specified, deletes only cookies with the exact path
   * @return DevTools Command
   */
  public static Command<Void> deleteCookies(String name, Optional<String> url,
                                            Optional<String> domain, Optional<String> path) {

    Objects.requireNonNull(name, "name must be set.");

    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();

    params.put("name", name);
    url.ifPresent(string -> params.put("url", url.toString()));
    domain.ifPresent(string -> params.put("domain", domain.toString()));
    path.ifPresent(string -> params.put("path", path.toString()));

    return new Command<>(DOMAIN_NAME + ".deleteCookies", params.build());

  }

  /**
   * Disables network tracking, prevents network events from being sent to the client.
   *
   * @return DevTools Command
   */
  public static Command<Void> disable() {
    return new Command<>(DOMAIN_NAME + ".disable", ImmutableMap.of());
  }

  /**
   * Activates emulation of network conditions.
   *
   * @param offline            True to emulate internet disconnection.
   * @param latency            Minimum latency from request sent to response headers received (ms).
   * @param downloadThroughput Maximal aggregated download throughput (bytes/sec). -1 disables download throttling.
   * @param uploadThroughput   Maximal aggregated upload throughput (bytes/sec). -1 disables upload throttling.
   * @param connectionType     The underlying connection technology that the browser is supposedly using.
   * @return DevTools Command
   */
  public static Command<Void> emulateNetworkConditions(boolean offline, double latency,
                                                       double downloadThroughput,
                                                       double uploadThroughput,
                                                       Optional<ConnectionType> connectionType) {

    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();

    params.put("offline", offline);
    params.put("latency", latency);
    params.put("downloadThroughput", downloadThroughput);
    params.put("uploadThroughput", uploadThroughput);

    connectionType
        .ifPresent(ConnectionType -> params.put("connectionType", connectionType.get().name()));

    return new Command<>(DOMAIN_NAME + ".emulateNetworkConditions", params.build());

  }

  /**
   * Enables network tracking, network events will now be delivered to the client.
   *
   * @param maxTotalBufferSize    Buffer size in bytes to use when preserving network payloads (XHRs, etc).
   * @param maxResourceBufferSize Per-resource buffer size in bytes to use when preserving network payloads (XHRs, etc).
   * @param maxPostDataSize       Longest post body size (in bytes) that would be included in requestWillBeSent notification
   * @return DevTools Command
   */
  public static Command<Void> enable(Optional<Integer> maxTotalBufferSize,
                                     Optional<Integer> maxResourceBufferSize,
                                     Optional<Integer> maxPostDataSize) {

    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();

    maxTotalBufferSize.ifPresent(integer -> params.put("maxTotalBufferSize", integer));
    maxResourceBufferSize.ifPresent(integer -> params.put("maxResourceBufferSize", integer));
    maxPostDataSize.ifPresent(integer -> params.put("maxPostDataSize", integer));

    return new Command<>(DOMAIN_NAME + ".enable", params.build());

  }

  /**
   * Returns all browser cookies. Depending on the backend support, will return detailed cookie information in the cookies field
   *
   * @return Array of Cookies with a "asSeleniumCookies" method
   */
  public static Command<Cookies> getAllCookies() {
    return new Command<>(
      DOMAIN_NAME + ".getAllCookies",
      ImmutableMap.of(),
      map("cookies", Cookies.class));
  }

  /**
   * Returns the DER-encoded certificate (EXPERIMENTAL)
   *
   * @param origin Origin to get certificate for
   * @return List of tableNames
   */
  @Beta
  public static Command<List<String>> getCertificate(String origin) {
    Objects.requireNonNull(origin, "origin must be set.");
    return new Command<>(DOMAIN_NAME + ".getCertificate", ImmutableMap.of("origin", origin),
                         map("tableNames", new TypeToken<List<String>>() {
                         }.getType()));
  }

  /**
   * Returns all browser cookies for the current URL. Depending on the backend support, will return detailed cookie information in the cookies field
   *
   * @param urls The list of URLs for which applicable cookies will be fetched
   * @return Array of cookies
   */
  public static Command<Cookies> getCookies(Optional<List<String>> urls) {

    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();

    urls.ifPresent(list -> params.put("urls", urls));

    return new Command<>(DOMAIN_NAME + ".getCookies", params.build(),
                         map("cookies", Cookies.class));

  }

  /**
   * Returns content served for the given request
   *
   * @param requestId Identifier of the network request to get content for
   * @return ResponseBody object
   */
  public static Command<ResponseBody> getResponseBody(RequestId requestId) {
    Objects.requireNonNull(requestId, "requestId must be set.");
    return new Command<>(DOMAIN_NAME + ".getResponseBody",
                         ImmutableMap.of("requestId", requestId.toString()),
                         map("body", ResponseBody.class));
  }

  /**
   * Returns post data sent with the request. Returns an error when no data was sent with the request.
   *
   * @param requestId Identifier of the network request to get content for.
   * @return DevTools Command with Request body string, omitting files from multipart requests
   */
  public static Command<String> getRequestPostData(RequestId requestId) {
    Objects.requireNonNull(requestId, "requestId must be set.");
    return new Command<>(DOMAIN_NAME + ".getRequestPostData",
                         ImmutableMap.of("requestId", requestId.toString()),
                         map("postData", String.class));
  }

  /**
   * Returns content served for the given currently intercepted request (EXPERIMENTAL)
   *
   * @param interceptionId Identifier for the intercepted request to get body for
   * @return ResponseBody object
   */
  @Beta
  public static Command<ResponseBody> getResponseBodyForInterception(
      InterceptionId interceptionId) {
    Objects.requireNonNull(interceptionId.toString(), "interceptionId must be set.");
    return new Command<>(DOMAIN_NAME + ".getResponseBodyForInterception",
                         ImmutableMap.of("interceptionId", interceptionId),
                         map("body", ResponseBody.class));
  }

  /**
   * Returns a handle to the stream representing the response body. Note that after this command, the intercepted request can't be continued as is -- you either need to cancel it or to provide the response body.
   * The stream only supports sequential read, IO.read will fail if the position is specified (EXPERIMENTAL)
   *
   * @param interceptionId Identifier for the intercepted request to get body for
   * @return HTTP response body Stream as a String
   */
  @Beta
  public static Command<String> takeResponseBodyForInterceptionAsStream(
      InterceptionId interceptionId) {
    Objects.requireNonNull(interceptionId, "interceptionId must be set.");
    return new Command<>(DOMAIN_NAME + ".takeResponseBodyForInterceptionAsStream",
                         ImmutableMap.of("interceptionId", interceptionId),
                         map("stream", String.class));
  }

  /**
   * @param requestId Identifier of XHR to replay
   * @return - DevTools Command
   */
  public static Command<Void> replayXHR(RequestId requestId) {

    Objects.requireNonNull(requestId, "requestId must be set.");
    return new Command<>(DOMAIN_NAME + ".replayXHR", ImmutableMap.of("requestId", requestId.toString()));

  }

  /**
   * Searches for given string in response content (EXPERIMENTAL)
   *
   * @param requestId     Identifier of the network response to search
   * @param query         String to search for.
   * @param caseSensitive If true, search is case sensitive
   * @param isRegex       If true, treats string parameter as regex
   * @return List of SearchMatch
   */
  @Beta
  public static Command<List<SearchMatch>> searchInResponseBody(RequestId requestId, String query,
                                                                Optional<Boolean> caseSensitive,
                                                                Optional<Boolean> isRegex) {

    Objects.requireNonNull(requestId, "requestId must be set.");
    Objects.requireNonNull(query, "query must be set.");

    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();

    params.put("requestId", requestId.toString());
    params.put("query", query);
    caseSensitive.ifPresent(bool -> params.put("caseSensitive", caseSensitive));
    isRegex.ifPresent(bool -> params.put("isRegex", isRegex));

    return new Command<>(DOMAIN_NAME + ".searchInResponseBody", params.build(),
                         map("result", new TypeToken<List<SearchMatch>>() {
                         }.getType()));
  }

  /**
   * Blocks URLs from loading (EXPERIMENTAL)
   *
   * @param urls URL patterns to block. Wildcards ('*') are allowed.
   * @return DevTools Command
   */
  @Beta
  public static Command<Void> setBlockedURLs(List<String> urls) {
    Objects.requireNonNull(urls, "urls must be set.");
    return new Command<>(DOMAIN_NAME + ".setBlockedURLs", ImmutableMap.of("urls", urls));
  }

  /**
   * Toggles ignoring of service worker for each request. (EXPERIMENTAL)
   *
   * @param bypass Bypass service worker and load from network
   * @return - DevTools Command
   */
  @Beta
  public static Command<Void> setBypassServiceWorker(boolean bypass) {
    return new Command<>(DOMAIN_NAME + ".setBypassServiceWorker",
                         ImmutableMap.of("bypass", bypass));
  }

  /**
   * Toggles ignoring cache for each request. If true, cache will not be used.
   *
   * @param cacheDisabled Cache disabled state.
   * @return DevTools Command
   */
  public static Command<Void> setCacheDisabled(boolean cacheDisabled) {
    return new Command<>(DOMAIN_NAME + ".setCacheDisabled",
                         ImmutableMap.of("cacheDisabled", cacheDisabled));
  }

  /**
   * implementation using CDP Cookie
   */
  private static Command<Boolean> setCookie(Cookie cookie, Optional<String> url) {
    Objects.requireNonNull(cookie.getName(), "cookieName must be set.");
    Objects.requireNonNull(cookie.getValue(), "cookieValue must be set.");

    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();

    params.put("name", cookie.getName());
    params.put("value", cookie.getValue());
    url.ifPresent(string -> params.put("url", url.toString()));

    if (cookie.getDomain() != null) {
      params.put("domain", cookie.getDomain());
    }
    if (cookie.getPath() != null) {
      params.put("path", cookie.getPath());
    }
    params.put("secure", cookie.isSecure());

    params.put("httpOnly", cookie.isHttpOnly());

    if (cookie.getExpires() != 0) {
      params.put("expires", cookie.getExpires());
    }

    return new Command<>(DOMAIN_NAME + ".setCookie", params.build(), map("success", Boolean.class));
  }

  /**
   * Sets a cookie with the given cookie data; may overwrite equivalent cookies if they exist
   *
   * @param cookie Cookie object where Name and Value are mandatory
   * @param url    The request-URI to associate with the setting of the cookie. This value can affect the default domain and path values of the created cookie
   * @return Boolean
   */
  public static Command<Boolean> setCookie(org.openqa.selenium.Cookie cookie,
                                           Optional<String> url) {
    return setCookie(Cookie.fromSeleniumCookie(cookie), url);
  }

  /**
   * (EXPERIMENTAL)
   *
   * @param maxTotalSize    Maximum total buffer size
   * @param maxResourceSize Maximum per-resource size
   * @return DevTools Command
   */
  @Beta
  public static Command<Void> setDataSizeLimitsForTest(int maxTotalSize, int maxResourceSize) {
    return new Command<>(DOMAIN_NAME + ".setDataSizeLimitsForTest", ImmutableMap
        .of("maxTotalSize", maxTotalSize, "maxResourceSize", maxResourceSize));
  }

  /**
   * Specifies whether to always send extra HTTP headers with the requests from this page.
   *
   * @param headers Map with extra HTTP headers.
   * @return DevTools Command
   */
  public static Command<Void> setExtraHTTPHeaders(Map<String, String> headers) {
    Objects.requireNonNull(headers, "headers must be set.");
    return new Command<>(DOMAIN_NAME + ".setExtraHTTPHeaders", ImmutableMap.of("headers", headers));
  }

  /**
   * Sets the requests to intercept that match the provided patterns and optionally resource types (EXPERIMENTAL)
   *
   * @param patterns Requests matching any of these patterns will be forwarded and wait for the corresponding continueInterceptedRequest call.
   * @return DevTools Command
   */
  @Beta
  public static Command<Void> setRequestInterception(List<RequestPattern> patterns) {
    Objects.requireNonNull(patterns, "patterns must be set.");
    return new Command<>(DOMAIN_NAME + ".setRequestInterception",
                         ImmutableMap.of("patterns", patterns));
  }

  /**
   * Allows overriding user agent with the given string
   *
   * @param userAgent      User agent to use
   * @param acceptLanguage Browser langugage to emulate
   * @param platform       The platform navigator.platform should return
   * @return DevTools Command
   */
  public static Command<Void> setUserAgentOverride(String userAgent,
                                                   Optional<String> acceptLanguage,
                                                   Optional<String> platform) {

    Objects.requireNonNull(userAgent, "userAgent must be set.");
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();

    params.put("userAgent", userAgent);
    acceptLanguage.ifPresent(string -> params.put("acceptLanguage", acceptLanguage.toString()));
    platform.ifPresent(string -> params.put("platform", platform.toString()));

    return new Command<>(DOMAIN_NAME + ".setUserAgentOverride", params.build());
  }

  /**
   * Fired when data chunk was received over the network.
   *
   * @return DataReceived Event
   */
  public static Event<DataReceived> dataReceived() {
    return new Event<>(DOMAIN_NAME + ".dataReceived", map("requestId", DataReceived.class));
  }

  /**
   * Fired when EventSource message is received
   *
   * @return EventSourceMessageReceived Event
   */
  public static Event<EventSourceMessageReceived> eventSourceMessageReceived() {
    return new Event<>(DOMAIN_NAME + ".eventSourceMessageReceived",
                       map("requestId", EventSourceMessageReceived.class));
  }

  /**
   * Fired when HTTP request has failed to load
   *
   * @return LoadingFailed object
   */
  public static Event<LoadingFailed> loadingFailed() {
    return new Event<>(DOMAIN_NAME + ".loadingFailed", map("requestId", LoadingFailed.class));
  }

  /**
   * Fired when HTTP request has finished loading
   *
   * @return LoadingFinished object
   */
  public static Event<LoadingFinished> loadingFinished() {
    return new Event<>(DOMAIN_NAME + ".loadingFinished", map("requestId", LoadingFinished.class));
  }

  /**
   * Fired if request ended up loading from cache
   *
   * @return RequestId object
   */
  public static Event<RequestId> requestServedFromCache() {
    return new Event<>(DOMAIN_NAME + ".requestServedFromCache", map("requestId", RequestId.class));
  }

  /**
   * Fired when resource loading priority is changed (EXPERIMENTAL)
   *
   * @return ResourceChangedPriority object
   */
  @Beta
  public static Event<ResourceChangedPriority> resourceChangedPriority() {
    return new Event<>(DOMAIN_NAME + ".resourceChangedPriority",
                       map("requestId", ResourceChangedPriority.class));
  }

  /**
   * Fired when a signed exchange was received over the network (EXPERIMENTAL)
   *
   * @return SignedExchangeReceived object
   */
  @Beta
  public static Event<SignedExchangeReceived> signedExchangeReceived() {
    return new Event<>(DOMAIN_NAME + ".signedExchangeReceived",
                       map("requestId", SignedExchangeReceived.class));
  }

  /**
   * Fired when page is about to send HTTP request
   *
   * @return RequestWillBeSent object
   */
  public static Event<RequestWillBeSent> requestWillBeSent() {
    return new Event<>(DOMAIN_NAME + ".requestWillBeSent",
                       map("requestId", RequestWillBeSent.class));
  }

  /**
   * Details of an intercepted HTTP request, which must be either allowed, blocked, modified or mocked.(EXPERIMENTAL)
   *
   * @return {@link RequestIntercepted} Object
   */
  @Beta
  public static Event<RequestIntercepted> requestIntercepted() {
    return new Event<>(DOMAIN_NAME + ".requestIntercepted",
                       map("interceptionId", RequestIntercepted.class));
  }

  /**
   * Fired when HTTP response is available.
   *
   * @return {@link ResponseReceived} Object
   */
  public static Event<ResponseReceived> responseReceived() {
    return new Event<>(DOMAIN_NAME + ".responseReceived", map("requestId", ResponseReceived.class));
  }

  /**
   * Fired when WebSocket message error occurs.
   */
  public static Event<WebSocketFrameError> webSocketFrameError() {
    return new Event<>(DOMAIN_NAME + ".webSocketFrameError",
                       map("requestId", WebSocketFrameError.class));
  }


  /**
   * Fired upon WebSocket creation.
   */
  public static Event<WebSocketCreated> webSocketCreated() {
    return new Event<>(DOMAIN_NAME + ".webSocketCreated", map("requestId", WebSocketCreated.class));
  }

  /**
   * Fired upon WebSocket creation.
   */
  public static Event<WebSocketClosed> webSocketClosed() {
    return new Event<>(DOMAIN_NAME + ".webSocketClosed", map("requestId", WebSocketClosed.class));
  }

  /**
   * Fired when WebSocket message is received.
   */
  public static Event<WebSocketFrame> webSocketFrameReceived() {
    return new Event<>(DOMAIN_NAME + ".webSocketFrameReceived",
                       map("requestId", WebSocketFrame.class));
  }

  /**
   * Fired when WebSocket message is sent.
   */
  public static Event<WebSocketFrame> webSocketFrameSent() {
    return new Event<>(DOMAIN_NAME + ".webSocketFrameSent", map("requestId", WebSocketFrame.class));
  }
}
