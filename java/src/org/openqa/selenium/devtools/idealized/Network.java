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
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.logging.Logger;

import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;
import static java.util.logging.Level.WARNING;

public abstract class Network<AUTHREQUIRED, REQUESTPAUSED> {

  private static final Logger LOG = Logger.getLogger(Network.class.getName());

  private final Map<Predicate<URI>, Supplier<Credentials>> authHandlers = new LinkedHashMap<>();
  private final Filter defaultFilter = next -> next::execute;
  private Filter filter = defaultFilter;
  protected final DevTools devTools;

  public Network(DevTools devtools) {
    this.devTools = Require.nonNull("DevTools", devtools);
  }

  public void disable() {
    devTools.send(disableFetch());
    devTools.send(enableNetworkCaching());

    authHandlers.clear();
    filter = defaultFilter;
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

  @SuppressWarnings("SuspiciousMethodCalls")
  public void resetNetworkFilter() {
    filter = defaultFilter;
  }

  public void interceptTrafficWith(Filter filter) {
    Require.nonNull("HTTP filter", filter);

    this.filter = filter;
    prepareToInterceptTraffic();
  }

  public void prepareToInterceptTraffic() {
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

    Map<String, CompletableFuture<HttpResponse>> responses = new ConcurrentHashMap<>();

    devTools.addListener(
      requestPausedEvent(),
      pausedRequest -> {
        String id = getRequestId(pausedRequest);
        Either<HttpRequest, HttpResponse> message = createSeMessages(pausedRequest);

        if (message.isRight()) {
          HttpResponse res = message.right();
          CompletableFuture<HttpResponse> future = responses.remove(id);

          if (future == null) {
            devTools.send(continueWithoutModification(pausedRequest));
            return;
          }

          future.complete(res);
          return;
        }

        HttpResponse forBrowser = filter.andFinally(req -> {
          // Convert the selenium request to a CDP one and fulfill.

          CompletableFuture<HttpResponse> res = new CompletableFuture<>();
          responses.put(id, res);

          devTools.send(continueRequest(pausedRequest, req));

          // Wait for the CDP response and send that back.
          try {
            return res.get();
          } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new WebDriverException(e);
          } catch (ExecutionException e) {
            LOG.log(WARNING, e, () -> "Unable to process request");
            return new HttpResponse();
          }
        }).execute(message.left());

        if ("Continue".equals(forBrowser.getHeader("Selenium-Interceptor"))) {
          devTools.send(continueWithoutModification(pausedRequest));
          return;
        }

        devTools.send(fulfillRequest(pausedRequest, forBrowser));
      });

    devTools.send(enableFetchForAllPatterns());
  }

  protected Optional<Credentials> getAuthCredentials(URI uri) {
    Require.nonNull("URI", uri);

    return authHandlers.entrySet().stream()
      .filter(entry -> entry.getKey().test(uri))
      .map(Map.Entry::getValue)
      .map(Supplier::get)
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

  protected HttpResponse createHttpResponse(
    Optional<Integer> statusCode,
    String body,
    Boolean bodyIsBase64Encoded,
    List<Map.Entry<String, String>> headers) {
    Supplier<InputStream> content;

    if (body == null) {
      content = Contents.empty();
    } else if (bodyIsBase64Encoded != null && bodyIsBase64Encoded) {
      byte[] decoded = Base64.getDecoder().decode(body);
      content = () -> new ByteArrayInputStream(decoded);
    } else {
      content = Contents.string(body, UTF_8);
    }

    HttpResponse res = new HttpResponse()
      .setStatus(statusCode.orElse(HTTP_OK))
      .setContent(content);

    headers.forEach(entry -> {
      if (entry.getValue() != null) {
        res.addHeader(entry.getKey(), entry.getValue());
      }
    });

    return res;
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

  protected abstract String getRequestId(REQUESTPAUSED pausedReq);

  protected abstract Either<HttpRequest, HttpResponse> createSeMessages(REQUESTPAUSED pausedReq);

  protected abstract Command<Void> continueWithoutModification(REQUESTPAUSED pausedReq);

  protected abstract Command<Void> continueRequest(REQUESTPAUSED pausedReq, HttpRequest req);

  protected abstract Command<Void> fulfillRequest(REQUESTPAUSED pausedReq, HttpResponse res);
}
