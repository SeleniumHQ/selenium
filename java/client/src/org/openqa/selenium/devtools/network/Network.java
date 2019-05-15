package org.openqa.selenium.devtools.network;

import static org.openqa.selenium.devtools.ConverterFunctions.map;

import com.google.common.collect.ImmutableMap;
import com.google.common.reflect.TypeToken;

import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.network.events.DataReceived;
import org.openqa.selenium.devtools.network.events.EventSourceMessageReceived;
import org.openqa.selenium.devtools.network.events.LoadingFailed;
import org.openqa.selenium.devtools.network.types.AuthChallengeResponse;
import org.openqa.selenium.devtools.network.types.ConnectionType;
import org.openqa.selenium.devtools.network.types.Cookie;
import org.openqa.selenium.devtools.network.types.ErrorReason;
import org.openqa.selenium.devtools.network.types.InterceptionId;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

/**
 * All available DevTools Network methods and events
 */
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
   * @param interceptionId
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
   * @return Array of cookie objects
   */
  public static Command<Set<Cookie>> getAllCookies() {
    return new Command<>(domainName + ".getAllCookies", ImmutableMap.of(), map("cookies", new TypeToken<Set<Cookie>>() {}.getType()));
  }

  public static Command<List<String>> getCertificate(String origin) {
    Objects.requireNonNull(origin, "origin must be set.");
    return new Command<>(domainName + ".getCertificate", ImmutableMap.of("origin", origin), map("tableNames", new TypeToken<List<String>>() {}.getType()));
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
   * Specifies whether to always send extra HTTP headers with the requests from this page.
   * @param headers - Map with extra HTTP headers.
   * @return DevTools Command
   */
  public static Command<Void> setExtraHTTPHeaders(Map<String, String> headers) {
    Objects.requireNonNull(headers, "headers must be set.");
    return new Command<>(domainName + ".setExtraHTTPHeaders", ImmutableMap.of("headers", headers));
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
   * Returns post data sent with the request. Returns an error when no data was sent with the request.
   * @param requestId - Identifier of the network request to get content for.
   * @return DevTools Command with Request body string, omitting files from multipart requests
   */
  public static Command<String> getRequestPostData(String requestId) {
    return new Command<>(domainName + ".getRequestPostData", ImmutableMap.of("requestId", requestId),
                         map("postData", String.class));
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
   * Fired when EventSource message is received
   * @return EventSourceMessageReceived Event
   */
  public static Event<LoadingFailed> loadingFailed() {
    return new Event<>(domainName + ".eventSourceMessageReceived", map("requestId", EventSourceMessageReceived.class));
  }

}
