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

import static java.net.HttpURLConnection.HTTP_OK;
import static java.nio.charset.StandardCharsets.UTF_8;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.Credentials;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.NetworkInterceptor;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

public abstract class Network<AUTHREQUIRED, REQUESTPAUSED> {

  private static final Logger LOG = Logger.getLogger(Network.class.getName());

  private final Map<Predicate<URI>, Supplier<Credentials>> authHandlers = new LinkedHashMap<>();
  private final Filter defaultFilter = next -> next::execute;
  private volatile Filter filter = defaultFilter;
  protected final DevTools devTools;

  private final AtomicBoolean prepared = new AtomicBoolean();

  public Network(DevTools devtools) {
    this.devTools = Require.nonNull("DevTools", devtools);
  }

  public void disable() {
    devTools.send(disableFetch());
    devTools.send(enableNetworkCaching());

    synchronized (authHandlers) {
      authHandlers.clear();
    }
    filter = defaultFilter;
    prepared.set(false);
  }

  public static class UserAgent {

    private final String userAgent;
    private final Optional<String> acceptLanguage;
    private final Optional<String> platform;

    public UserAgent(String userAgent) {
      this(userAgent, Optional.empty(), Optional.empty());
    }

    private UserAgent(
        String userAgent, Optional<String> acceptLanguage, Optional<String> platform) {
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

  public void addAuthHandler(
      Predicate<URI> whenThisMatches, Supplier<Credentials> useTheseCredentials) {
    Require.nonNull("URI predicate", whenThisMatches);
    Require.nonNull("Credentials", useTheseCredentials);

    synchronized (authHandlers) {
      authHandlers.put(whenThisMatches, useTheseCredentials);
    }

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
    if (prepared.getAndSet(true)) {
      // do not register multiple handlers otherwise the events are processed multiple times
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
                throw new DevToolsException(
                    "DevTools can only support username and password authentication");
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
          Command<?> toSend;

          try {
            Either<HttpRequest, HttpResponse> message = createSeMessages(pausedRequest);

            if (message.isLeft()) {
              HttpResponse intercepted =
                  filter
                      .andFinally(req -> NetworkInterceptor.PROCEED_WITH_REQUEST)
                      .execute(message.left());

              if (intercepted != null && intercepted != NetworkInterceptor.PROCEED_WITH_REQUEST) {
                toSend = fulfillRequest(pausedRequest, intercepted);
              } else {
                toSend = continueWithoutModification(pausedRequest);
              }
            } else {
              // It is currently not needed to have the response here, but we might want to modify
              // the response in the future? So lets continueWithoutModification for now and allow
              // other to easily implement this.
              toSend = continueWithoutModification(pausedRequest);
            }
          } catch (Exception e) {
            LOG.log(Level.WARNING, "interceptor failed", e);
            toSend = abortRequest(pausedRequest);
          }

          devTools.send(toSend);
        });

    devTools.send(enableFetchForAllPatterns());
  }

  protected Optional<Credentials> getAuthCredentials(URI uri) {
    Require.nonNull("URI", uri);

    synchronized (authHandlers) {
      return authHandlers.entrySet().stream()
          .filter(entry -> entry.getKey().test(uri))
          .map(Map.Entry::getValue)
          .map(Supplier::get)
          .findFirst();
    }
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

    HttpResponse res = new HttpResponse().setStatus(statusCode.orElse(HTTP_OK)).setContent(content);

    headers.forEach(
        entry -> {
          if (entry.getValue() != null) {
            res.addHeader(entry.getKey(), entry.getValue());
          }
        });

    return res;
  }

  protected HttpRequest createHttpRequest(
      String cdpMethod, String url, Map<String, Object> headers, Optional<String> postData) {
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

  protected abstract Command<Void> continueWithAuth(
      AUTHREQUIRED authRequired, UsernameAndPassword credentials);

  protected abstract Command<Void> cancelAuth(AUTHREQUIRED authrequired);

  protected abstract Event<REQUESTPAUSED> requestPausedEvent();

  protected abstract String getRequestId(REQUESTPAUSED pausedReq);

  protected abstract Either<HttpRequest, HttpResponse> createSeMessages(REQUESTPAUSED pausedReq);

  protected abstract Command<Void> abortRequest(REQUESTPAUSED pausedReq);

  protected abstract Command<Void> continueWithoutModification(REQUESTPAUSED pausedReq);

  protected abstract Command<Void> continueRequest(REQUESTPAUSED pausedReq, HttpRequest req);

  protected abstract Command<Void> fulfillRequest(REQUESTPAUSED pausedReq, HttpResponse res);
}
