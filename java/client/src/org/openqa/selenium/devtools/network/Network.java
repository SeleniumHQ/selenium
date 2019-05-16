package org.openqa.selenium.devtools.network;

import static org.openqa.selenium.devtools.ConverterFunctions.map;

import com.google.common.collect.ImmutableMap;
import com.google.common.reflect.TypeToken;

import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.network.events.DataReceived;
import org.openqa.selenium.devtools.network.events.EventSourceMessageReceived;
import org.openqa.selenium.devtools.network.events.LoadingFailed;
import org.openqa.selenium.devtools.network.events.LoadingFinished;
import org.openqa.selenium.devtools.network.events.RequestIntercepted;
import org.openqa.selenium.devtools.network.events.RequestWillBeSent;
import org.openqa.selenium.devtools.network.events.ResourceChangedPriority;
import org.openqa.selenium.devtools.network.events.ResponseReceived;
import org.openqa.selenium.devtools.network.events.SignedExchangeReceived;
import org.openqa.selenium.devtools.network.events.WebSocketClosed;
import org.openqa.selenium.devtools.network.events.WebSocketCreated;
import org.openqa.selenium.devtools.network.events.WebSocketFrameError;
import org.openqa.selenium.devtools.network.types.AuthChallengeResponse;
import org.openqa.selenium.devtools.network.types.ConnectionType;
import org.openqa.selenium.devtools.network.types.Cookie;
import org.openqa.selenium.devtools.network.types.ErrorReason;
import org.openqa.selenium.devtools.network.types.InterceptionId;
import org.openqa.selenium.devtools.network.types.RequestId;
import org.openqa.selenium.devtools.network.types.RequestPattern;
import org.openqa.selenium.devtools.network.types.ResponseBody;
import org.openqa.selenium.devtools.network.types.SearchMatch;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

/**
 * All available DevTools Network methods and events
 */
@SuppressWarnings("OptionalUsedAsFieldOrParameterType")
public class Network {

  private final static String domainName = "Network";

  /**
   * Clears browser cache.
   * @return DevTools Command
   */
  public static Command<Void> clearBrowserCache() {
    return new Command<>(domainName + ".clearBrowserCache", ImmutableMap.of());
  }

  /**
   * Clears browser cookies.
   * @return DevTools Command
   */
  public static Command<Void> clearBrowserCookies() {
    return new Command<>(domainName + ".clearBrowserCookies", ImmutableMap.of());
  }

  /**
   * Response to Network.requestIntercepted which either modifies the request to continue with any modifications, or blocks it, or completes it with the provided response bytes.
   * If a network fetch occurs as a result which encounters a redirect an additional Network.requestIntercepted event will be sent with the same InterceptionId.
   * (EXPERIMENTAL)
   * @param interceptionId - Identifier for the intercepted request
   * @param errorReason (Optional) - If set this causes the request to fail with the given reason.
   *                    Passing Aborted for requests marked with isNavigationRequest also cancels the navigation. Must not be set in response to an authChallenge
   * @param rawResponse (Optional) - If set the requests completes using with the provided base64 encoded raw response, including HTTP status line and headers etc...
   *                    Must not be set in response to an authChallenge
   * @param url (Optional) - If set the request url will be modified in a way that's not observable by page. Must not be set in response to an authChallenge
   * @param method (Optional) - If set this allows the request method to be overridden. Must not be set in response to an authChallenge
   * @param postData (Optional) - If set this allows postData to be set. Must not be set in response to an authChallenge
   * @param headers (Optional) - If set this allows the request headers to be changed. Must not be set in response to an authChallenge
   * @param authChallengeResponse (Optional) - Response to a requestIntercepted with an authChallenge. Must not be set otherwise
   * @return DevTools Command
   */
  public static Command<Void> continueInterceptedRequest(InterceptionId interceptionId, Optional<ErrorReason> errorReason, Optional<String> rawResponse,
                                                         Optional<String> url, Optional<String> method, Optional<String> postData, Optional<Map<String, String>> headers,
                                                         Optional<AuthChallengeResponse> authChallengeResponse) {

    Objects.requireNonNull(interceptionId, "interceptionId must be set.");

    Map<String, Object> params = new HashMap<>();

    params.put("interceptionId", interceptionId);
    errorReason.ifPresent(reason -> params.put("errorReason", errorReason));
    errorReason.ifPresent(string -> params.put("rawResponse", rawResponse));
    errorReason.ifPresent(string -> params.put("url", url));
    errorReason.ifPresent(string -> params.put("method", method));
    errorReason.ifPresent(string -> params.put("postData", postData));
    errorReason.ifPresent(map -> params.put("headers", headers));
    errorReason.ifPresent(response -> params.put("authChallengeResponse", authChallengeResponse));

    return new Command<>(domainName + ".continueInterceptedRequest", params);

  }

  /**
   * Deletes browser cookies with matching name and url or domain/path pair
   * @param name - Name of the cookies to remove
   * @param url (Optional) - If specified, deletes all the cookies with the given name where domain and path match provided URL
   * @param domain (Optional) - If specified, deletes only cookies with the exact domain.
   * @param path (Optional) - If specified, deletes only cookies with the exact path
   * @return DevTools Command
   */
  public static Command<Void> deleteCookies(String name, Optional<String> url, Optional<String> domain, Optional<String> path) {

    Objects.requireNonNull(name, "name must be set.");

    Map<String, Object> params = new HashMap<>();

    url.ifPresent(string -> params.put("url", url));
    url.ifPresent(string -> params.put("domain", domain));
    url.ifPresent(string -> params.put("path", path));

    return new Command<>(domainName + ".deleteCookies", params);

  }

  /**
   * Disables network tracking, prevents network events from being sent to the client.
   * @return DevTools Command
   */
  public static Command<Void> disable() {
    return new Command<>(domainName + ".disable", ImmutableMap.of());
  }

  /**
   * Activates emulation of network conditions.
   * @param offline - True to emulate internet disconnection.
   * @param latency - Minimum latency from request sent to response headers received (ms).
   * @param downloadThroughput - Maximal aggregated download throughput (bytes/sec). -1 disables download throttling.
   * @param uploadThroughput - Maximal aggregated upload throughput (bytes/sec). -1 disables upload throttling.
   * @param connectionType (Optional) - The underlying connection technology that the browser is supposedly using.
   * @return DevTools Command
   */
  public static Command<Void> emulateNetworkConditions(boolean offline, double latency, double downloadThroughput, double uploadThroughput, Optional<ConnectionType> connectionType) {

    Map<String, Object> params = new HashMap<>();

    params.put("offline", offline);
    params.put("latency", latency);
    params.put("downloadThroughput", downloadThroughput);
    params.put("uploadThroughput", uploadThroughput);

    connectionType.ifPresent(ConnectionType -> params.put("connectionType", connectionType.get().getType()));

    return new Command<>(domainName + ".emulateNetworkConditions", params);

  }

  /**
   * Enables network tracking, network events will now be delivered to the client.
   * @param maxTotalBufferSize (Optional) - Buffer size in bytes to use when preserving network payloads (XHRs, etc).
   * @param maxResourceBufferSize (Optional) - Per-resource buffer size in bytes to use when preserving network payloads (XHRs, etc).
   * @param maxPostDataSize (Optional) - Longest post body size (in bytes) that would be included in requestWillBeSent notification
   * @return DevTools Command
   */
  public static Command<Void> enable(Optional<Integer> maxTotalBufferSize, Optional<Integer> maxResourceBufferSize, Optional<Integer> maxPostDataSize) {

    Map<String, Object> params = new HashMap<>();

    maxTotalBufferSize.ifPresent(integer -> params.put("maxTotalBufferSize", integer));
    maxResourceBufferSize.ifPresent(integer -> params.put("maxResourceBufferSize", integer));
    maxPostDataSize.ifPresent(integer -> params.put("maxPostDataSize", integer));

    return new Command<>(domainName + ".enable", params);

  }

  /**
   * Returns all browser cookies. Depending on the backend support, will return detailed cookie information in the cookies field
   * @return Array of cookies
   */
  public static Command<Set<Cookie>> getAllCookies() {
    return new Command<>(domainName + ".getAllCookies", ImmutableMap.of(), map("cookies", new TypeToken<Set<Cookie>>() {}.getType()));
  }

  /**
   * Returns the DER-encoded certificate (EXPERIMENTAL)
   * @param origin Origin to get certificate for
   * @return List of tableNames
   */
  public static Command<List<String>> getCertificate(String origin) {
    Objects.requireNonNull(origin, "origin must be set.");
    return new Command<>(domainName + ".getCertificate", ImmutableMap.of("origin", origin), map("tableNames", new TypeToken<List<String>>() {}.getType()));
  }

  /**
   * Returns all browser cookies for the current URL. Depending on the backend support, will return detailed cookie information in the cookies field
   * @param urls (Optional) - The list of URLs for which applicable cookies will be fetched
   * @return Array of cookies
   */
  public static Command<Set<Cookie>> getCookies(Optional<List<String>> urls) {

    Map<String, Object> params = new HashMap<>();

    urls.ifPresent(list -> params.put("urls", urls));

    return new Command<>(domainName + ".getCookies", params, map("cookies", new TypeToken<Set<Cookie>>() {}.getType()));

  }

  /**
   * Returns content served for the given request
   * @param requestId Identifier of the network request to get content for
   * @return ResponseBody object
   */
  public static Command<ResponseBody> getResponseBody(RequestId requestId) {
    Objects.requireNonNull(requestId, "requestId must be set.");
    return new Command<>(domainName + ".getResponseBody", ImmutableMap.of("requestId", requestId), map("body", ResponseBody.class));
  }

  /**
   * Returns post data sent with the request. Returns an error when no data was sent with the request.
   * @param requestId - Identifier of the network request to get content for.
   * @return DevTools Command with Request body string, omitting files from multipart requests
   */
  public static Command<String> getRequestPostData(RequestId requestId) {
    Objects.requireNonNull(requestId, "requestId must be set.");
    return new Command<>(domainName + ".getRequestPostData", ImmutableMap.of("requestId", requestId),
                         map("postData", String.class));
  }

  /**
   * Returns content served for the given currently intercepted request (EXPERIMENTAL)
   * @param interceptionId - Identifier for the intercepted request to get body for
   * @return ResponseBody object
   */
  public static Command<ResponseBody> getResponseBodyForInterception(InterceptionId interceptionId) {
    Objects.requireNonNull(interceptionId, "interceptionId must be set.");
    return new Command<>(domainName + ".getResponseBodyForInterception", ImmutableMap.of("interceptionId", interceptionId),
                         map("body", ResponseBody.class));
  }

  /**
   * Returns a handle to the stream representing the response body. Note that after this command, the intercepted request can't be continued as is -- you either need to cancel it or to provide the response body.
   * The stream only supports sequential read, IO.read will fail if the position is specified (EXPERIMENTAL)
   * @param interceptionId - Identifier for the intercepted request to get body for
   * @return HTTP response body Stream as a String
   */
  public static Command<String> takeResponseBodyForInterceptionAsStream(InterceptionId interceptionId) {
    Objects.requireNonNull(interceptionId, "interceptionId must be set.");
    return new Command<>(domainName + ".takeResponseBodyForInterceptionAsStream", ImmutableMap.of("interceptionId", interceptionId),
                         map("stream", String.class));
  }

  /**
   *
   * @param requestId - Identifier of XHR to replay
   * @return - DevTools Command
   */
  public static Command<Void> replayXHR(RequestId requestId) {

    Objects.requireNonNull(requestId, "requestId must be set.");
    return new Command<>(domainName + ".replayXHR", ImmutableMap.of("requestId", requestId));

  }

  /**
   * Searches for given string in response content (EXPERIMENTAL)
   * @param requestId - Identifier of the network response to search
   * @param query - String to search for.
   * @param caseSensitive - If true, search is case sensitive
   * @param isRegex - If true, treats string parameter as regex
   * @return List of SearchMatch
   */
  public static Command<List<SearchMatch>> searchInResponseBody(RequestId requestId, String query, Optional<Boolean> caseSensitive, Optional<Boolean> isRegex) {

    Objects.requireNonNull(requestId, "requestId must be set.");
    Objects.requireNonNull(query, "query must be set.");

    Map<String, Object> params = new HashMap<>();

    params.put("requestId", requestId);
    params.put("query", query);
    caseSensitive.ifPresent(bool -> params.put("caseSensitive", caseSensitive));
    isRegex.ifPresent(bool -> params.put("isRegex", isRegex));

    return new Command<>(domainName + ".searchInResponseBody", params, map("result", new TypeToken<List<SearchMatch>>() {}.getType()));
  }

  /**
   * Blocks URLs from loading (EXPERIMENTAL)
   * @param urls - URL patterns to block. Wildcards ('*') are allowed.
   * @return DevTools Command
   */
  public static Command<Void> setBlockedURLs(List<String> urls) {
    Objects.requireNonNull(urls, "urls must be set.");
    return new Command<>(domainName + ".setBlockedURLs", ImmutableMap.of("urls", urls));
  }

  /**
   * Toggles ignoring of service worker for each request. (EXPERIMENTAL)
   * @param bypass - Bypass service worker and load from network
   * @return - DevTools Command
   */
  public static Command<Void> setBypassServiceWorker(Boolean bypass) {
    Objects.requireNonNull(bypass, "bypass must be set.");
    return new Command<>(domainName + ".setBypassServiceWorker", ImmutableMap.of("bypass", bypass));
  }

  /**
   * Toggles ignoring cache for each request. If true, cache will not be used.
   * @param cacheDisabled - Cache disabled state.
   * @return DevTools Command
   */
  public static Command<Void> setCacheDisabled(boolean cacheDisabled) {
    return new Command<>(domainName + ".setCacheDisabled", ImmutableMap.of("cacheDisabled", cacheDisabled));
  }

  /**
   * Sets a cookie with the given cookie data; may overwrite equivalent cookies if they exist
   * @param cookie - Cookie object where Name and Value are mandatory
   * @param url - The request-URI to associate with the setting of the cookie. This value can affect the default domain and path values of the created cookie
   * @return - Boolean
   */
  public static Command<Boolean> setCookie(Cookie cookie, Optional<String> url) {
    Objects.requireNonNull(cookie.getName(), "cookieName must be set.");
    Objects.requireNonNull(cookie.getValue(), "cookieValue must be set.");

    Map<String, Object> params = new HashMap<>();

    params.put("name", cookie.getName());
    params.put("value", cookie.getValue());
    url.ifPresent(string -> params.put("url", url));

    if(cookie.getDomain() != null) {
      params.put("domain", cookie.getDomain());
    }
    if(cookie.getPath() != null) {
      params.put("path", cookie.getPath());
    }
    if(cookie.getSecure() != null) {
      params.put("secure", cookie.getSecure());
    }
    if(cookie.getHttpOnly() != null) {
      params.put("httpOnly", cookie.getHttpOnly());
    }
    if(cookie.getSameSite() != null) {
      params.put("sameSite", cookie.getSameSite());
    }
    if(cookie.getExpires() != null) {
      params.put("expires", cookie.getExpires());
    }

    return new Command<>(domainName + ".setCookie", params, Boolean.class);
  }

  /**
   * (EXPERIMENTAL)
   * @param maxTotalSize - Maximum total buffer size
   * @param maxResourceSize - Maximum per-resource size
   * @return DevTools Command
   */
  public static Command<Void> setDataSizeLimitsForTest(Optional<Integer> maxTotalSize, Optional<Integer> maxResourceSize) {

    Map<String, Object> params = new HashMap<>();

    maxTotalSize.ifPresent(integer -> params.put("maxTotalSize", maxTotalSize));
    maxResourceSize.ifPresent(integer -> params.put("maxResourceSize", maxResourceSize));

    return new Command<>(domainName + ".setDataSizeLimitsForTest", params);
  }

  /**
   * Specifies whether to always send extra HTTP headers with the requests from this page.
   * @param headers - Map with extra HTTP headers.
   * @return DevTools Command
   */
  public static Command<Void> setExtraHTTPHeaders(Map<String, String> headers) {
    Objects.requireNonNull(headers, "headers must be set.");
    return new Command<>(domainName + ".setExtraHTTPHeaders", ImmutableMap.of("headers", headers));
  }

  /**
   *  Sets the requests to intercept that match the provided patterns and optionally resource types (EXPERIMENTAL)
   * @param patterns - Requests matching any of these patterns will be forwarded and wait for the corresponding continueInterceptedRequest call.
   * @return DevTools Command
   */
  public static Command<Void> setRequestInterception(List<RequestPattern> patterns) {
    Objects.requireNonNull(patterns, "patterns must be set.");
    return new Command<>(domainName + ".setRequestInterception", ImmutableMap.of("patterns", patterns));
  }

  /**
   * Allows overriding user agent with the given string
   * @param userAgent - User agent to use
   * @param acceptLanguage - Browser langugage to emulate
   * @param platform - The platform navigator.platform should return
   * @return DevTools Command
   */
  public static Command<Void> setUserAgentOverride(String userAgent, Optional<String> acceptLanguage, Optional<String> platform) {

    Objects.requireNonNull(userAgent, "userAgent must be set.");
    Map<String, Object> params = new HashMap<>();

    acceptLanguage.ifPresent(string -> params.put("acceptLanguage", acceptLanguage));
    platform.ifPresent(string -> params.put("platform", platform));

    return new Command<>(domainName + ".setUserAgentOverride", params);
  }

  /**
   * Fired when data chunk was received over the network.
   * @return DataReceived Event
   */
  public static Event<DataReceived> dataReceived() {
    return new Event<>(domainName + ".dataReceived", map("requestId", DataReceived.class));
  }

  /**
   * Fired when EventSource message is received
   * @return EventSourceMessageReceived Event
   */
  public static Event<EventSourceMessageReceived> eventSourceMessageReceived() {
    return new Event<>(domainName + ".eventSourceMessageReceived", map("requestId", EventSourceMessageReceived.class));
  }

  /**
   * Fired when HTTP request has failed to load
   * @return LoadingFailed object
   */
  public static Event<LoadingFailed> loadingFailed() {
    return new Event<>(domainName + ".loadingFailed", map("requestId", LoadingFailed.class));
  }

  /**
   * Fired when HTTP request has finished loading
   * @return LoadingFinished object
   */
  public static Event<LoadingFinished> loadingFinished() {
    return new Event<>(domainName + ".loadingFinished", map("requestId", LoadingFinished.class));
  }

  /**
   * Fired if request ended up loading from cache
   * @return RequestId object
   */
  public static Event<RequestId> requestServedFromCache() {
    return new Event<>(domainName + ".requestServedFromCache", map("requestId", RequestId.class));
  }

  /**
   * Fired when resource loading priority is changed (EXPERIMENTAL)
   * @return ResourceChangedPriority object
   */
  public static Event<ResourceChangedPriority> resourceChangedPriority() {
    return new Event<>(domainName + ".resourceChangedPriority", map("requestId", ResourceChangedPriority.class));
  }

  /**
   * Fired when a signed exchange was received over the network (EXPERIMENTAL)
   * @return SignedExchangeReceived object
   */
  public static Event<SignedExchangeReceived> signedExchangeReceived() {
    return new Event<>(domainName + ".signedExchangeReceived", map("requestId", SignedExchangeReceived.class));
  }

  /**
   * Fired when page is about to send HTTP request
   * @return RequestWillBeSent object
   */
  public static Event<RequestWillBeSent> requestWillBeSent() {
    return new Event<>(domainName + ".requestWillBeSent", map("requestId", RequestWillBeSent.class));
  }

  /**
   * Details of an intercepted HTTP request, which must be either allowed, blocked, modified or mocked.EXPERIMENTAL
   * @return {@link RequestIntercepted} Object
   */
  public static Event<RequestIntercepted> requestIntercepted(){
    return new Event<>(domainName + ".requestIntercepted", map("interceptionId", RequestIntercepted.class));
  }
  /**
   * Fired when HTTP response is available.
   * @return {@link ResponseReceived} Object
   */
  public static Event<ResponseReceived> responseReceived(){
    return new Event<>(domainName + ".responseReceived", map("requestId", ResponseReceived.class));
  }

  /**
   * Fired when WebSocket message error occurs.
   */
  public static Event<WebSocketFrameError> webSocketFrameError(){
    return new Event<>(domainName+".webSocketFrameError",map("requestId", WebSocketFrameError.class));
  }


  /**
   *Fired upon WebSocket creation.
   */
  public static Event<WebSocketCreated> webSocketCreated(){
    return new Event<>(domainName+".webSocketCreated",map("requestId", WebSocketCreated.class));
  }

  /**
   *Fired upon WebSocket creation.
   */
  public static Event<WebSocketClosed> webSocketClosed(){
    return new Event<>(domainName+".webSocketClosed",map("requestId", WebSocketClosed.class));
  }

  //TODO: @GED add events for  Network.webSocketClosed, Network.webSocketCreated, Network.webSocketFrameError
  //TODO: @GED Network.webSocketFrameReceived, Network.webSocketFrameSent, Network.webSocketHandshakeResponseReceived, Network.webSocketWillSendHandshakeRequest

  //TODO @GED Add test  Network.requestIntercepted,
}