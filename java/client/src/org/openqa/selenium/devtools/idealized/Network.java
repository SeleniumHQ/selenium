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

package org.openqa.selenium.devtools.idealized;

import org.openqa.selenium.Credentials;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;

public abstract class Network<AUTHREQUIRED, REQUESTPAUSED> {

  private final Map<Predicate<URI>, Supplier<Credentials>> authHandlers = new LinkedHashMap<>();
  private final Map<Predicate<HttpRequest>, Function<HttpRequest, HttpResponse>> uriHandlers = new LinkedHashMap<>();
  protected final DevTools devTools;
  private boolean interceptingTraffic = false;

  public Network(DevTools devtools) {
    this.devTools = Require.nonNull("DevTools", devtools);
  }

  public void disable() {
    devTools.send(disableFetch());
    devTools.send(enableNetworkCaching());

    authHandlers.clear();
    uriHandlers.clear();
    interceptingTraffic = false;
  }

  public static class UserAgent {

    private final String userAgent;
    private final Optional<String> acceptLanguage;
    private final Optional<String> platform;

    public UserAgent(String userAgent) {
      this(userAgent, Optional.empty(), Optional.empty());
    }

    private UserAgent(String userAgent, Optional<String> acceptLanguage, Optional<String> platform) {
      this.userAgent = userAgent;
      this.acceptLanguage = acceptLanguage;
      this.platform = platform;
    }

    public String userAgent() {
      return userAgent;
    }

    public UserAgent acceptLanguage(String acceptLanguage) {
      return new UserAgent(this.userAgent, Optional.of(acceptLanguage), this.platform);
    }

    public Optional<String> acceptLanguage() {
      return acceptLanguage;
    }

    public UserAgent platform(String platform) {
      return new UserAgent(this.userAgent, this.acceptLanguage, Optional.of(platform));
    }

    public Optional<String> platform() {
      return platform;
    }
  }

  public void setUserAgent(String userAgent) {
    devTools.send(setUserAgentOverride(new UserAgent(userAgent)));
  }

  public void setUserAgent(UserAgent userAgent) {
    devTools.send(setUserAgentOverride(userAgent));
  }

  public void addAuthHandler(Predicate<URI> whenThisMatches, Supplier<Credentials> useTheseCredentials) {
    Require.nonNull("URI predicate", whenThisMatches);
    Require.nonNull("Credentials", useTheseCredentials);

    authHandlers.put(whenThisMatches, useTheseCredentials);

    prepareToInterceptTraffic();
  }

  public OpaqueKey addRequestHandler(Routable routable) {
    Require.nonNull("Routable", routable);

    return addRequestHandler(routable::matches, routable::execute);
  }

  public OpaqueKey addRequestHandler(Predicate<HttpRequest> whenThisMatches, Function<HttpRequest, HttpResponse> returnThis) {
    Require.nonNull("Request predicate", whenThisMatches);
    Require.nonNull("Handler", returnThis);

    uriHandlers.put(whenThisMatches, returnThis);

    prepareToInterceptTraffic();

    return new OpaqueKey(whenThisMatches);
  }

  @SuppressWarnings("SuspiciousMethodCalls")
  public void removeRequestHandler(OpaqueKey key) {
    Require.nonNull("Key", key);

    uriHandlers.remove(key.getValue());
  }

  private void prepareToInterceptTraffic() {
    if (interceptingTraffic) {
      return;
    }

    devTools.send(disableNetworkCaching());

    devTools.addListener(
      authRequiredEvent(),
      authRequired -> {
        String origin = getUriFrom(authRequired);
        try {
          URI uri = new URI(origin);

          Optional<Credentials> authCredentials = getAuthCredentials(uri);
          if (authCredentials.isPresent()) {
            Credentials credentials = authCredentials.get();
            if (!(credentials instanceof UsernameAndPassword)) {
              throw new DevToolsException("DevTools can only support username and password authentication");
            }

            UsernameAndPassword uap = (UsernameAndPassword) credentials;
            devTools.send(continueWithAuth(authRequired, uap));
            return;
          }
        } catch (URISyntaxException e) {
          // Fall through
        }

        devTools.send(cancelAuth(authRequired));
      });

    devTools.addListener(
      requestPausedEvent(),
      pausedRequest -> {
        Optional<HttpRequest> req = createHttpRequest(pausedRequest);

        if (!req.isPresent()) {
          devTools.send(continueWithoutModification(pausedRequest));
          return;
        }

        Optional<HttpResponse> maybeRes = getHttpResponse(req.get());
        if (!maybeRes.isPresent()) {
          devTools.send(continueWithoutModification(pausedRequest));
          return;
        }

        HttpResponse response = maybeRes.get();

        if ("Continue".equals(response.getHeader("Selenium-Interceptor"))) {
          devTools.send(continueWithoutModification(pausedRequest));
          return;
        }

        devTools.send(createResponse(pausedRequest, response));
      });

    devTools.send(enableFetchForAllPatterns());

    interceptingTraffic = true;
  }

  protected Optional<Credentials> getAuthCredentials(URI uri) {
    Require.nonNull("URI", uri);

    return authHandlers.entrySet().stream()
      .filter(entry -> entry.getKey().test(uri))
      .map(Map.Entry::getValue)
      .map(Supplier::get)
      .findFirst();
  }

  protected Optional<HttpResponse> getHttpResponse(HttpRequest forRequest) {
    Require.nonNull("Request", forRequest);

    return uriHandlers.entrySet().stream()
      .filter(entry -> entry.getKey().test(forRequest))
      .map(Map.Entry::getValue)
      .map(func -> func.apply(forRequest))
      .findFirst();
  }

  protected HttpMethod convertFromCdpHttpMethod(String method) {
    Require.nonNull("HTTP Method", method);
    try {
      return HttpMethod.valueOf(method.toUpperCase());
    } catch (IllegalArgumentException e) {
      // Spam in a reasonable value
      return HttpMethod.GET;
    }
  }

  protected HttpRequest createHttpRequest(
    String cdpMethod,
    String url,
    Map<String, Object> headers,
    Optional<String> postData) {
    HttpRequest req = new HttpRequest(convertFromCdpHttpMethod(cdpMethod), url);
    headers.forEach((key, value) -> req.addHeader(key, String.valueOf(value)));
    postData.ifPresent(data -> req.setContent(Contents.utf8String(data)));

    return req;
  }

  protected abstract Command<Void> setUserAgentOverride(UserAgent userAgent);

  protected abstract Command<Void> enableNetworkCaching();

  protected abstract Command<Void> disableNetworkCaching();

  protected abstract Command<Void> enableFetchForAllPatterns();

  protected abstract Command<Void> disableFetch();

  protected abstract Event<AUTHREQUIRED> authRequiredEvent();

  protected abstract String getUriFrom(AUTHREQUIRED authRequired);

  protected abstract Command<Void> continueWithAuth(AUTHREQUIRED authRequired, UsernameAndPassword credentials);

  protected abstract Command<Void> cancelAuth(AUTHREQUIRED authrequired);

  protected abstract Event<REQUESTPAUSED> requestPausedEvent();

  protected abstract Optional<HttpRequest> createHttpRequest(REQUESTPAUSED pausedRequest);

  protected abstract Command<Void> continueWithoutModification(REQUESTPAUSED pausedRequest);

  protected abstract Command<Void> createResponse(REQUESTPAUSED pausedRequest, HttpResponse response);
}
