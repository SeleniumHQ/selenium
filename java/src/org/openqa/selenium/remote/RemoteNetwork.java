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

package org.openqa.selenium.remote;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Predicate;
import java.util.function.UnaryOperator;
import org.openqa.selenium.Beta;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.bidi.network.AddInterceptParameters;
import org.openqa.selenium.bidi.network.BytesValue;
import org.openqa.selenium.bidi.network.ContinueRequestParameters;
import org.openqa.selenium.bidi.network.Header;
import org.openqa.selenium.bidi.network.InterceptPhase;
import org.openqa.selenium.bidi.network.RequestData;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;

@Beta
class RemoteNetwork implements Network {

  private final BiDi biDi;
  private final org.openqa.selenium.bidi.module.Network network;

  private final Map<Long, AuthDetails> authHandlers = new ConcurrentHashMap<>();

  private final Map<Long, RequestDetails> requestHandlers = new ConcurrentHashMap<>();

  private final AtomicLong callBackId = new AtomicLong(1);

  public RemoteNetwork(WebDriver driver) {
    this.biDi = ((HasBiDi) driver).getBiDi();
    this.network = new org.openqa.selenium.bidi.module.Network(driver);

    interceptAuthTraffic();
    interceptRequest();
  }

  private void interceptAuthTraffic() {
    this.network.addIntercept(new AddInterceptParameters(InterceptPhase.AUTH_REQUIRED));

    network.onAuthRequired(
        responseDetails -> {
          String requestId = responseDetails.getRequest().getRequestId();

          URI uri = URI.create(responseDetails.getRequest().getUrl());
          Optional<UsernameAndPassword> authCredentials = getAuthCredentials(uri);
          if (authCredentials.isPresent()) {
            network.continueWithAuth(requestId, authCredentials.get());
            return;
          }

          network.continueWithAuthNoCredentials(requestId);
        });
  }

  private Optional<UsernameAndPassword> getAuthCredentials(URI uri) {
    return authHandlers.values().stream()
        .filter(authDetails -> authDetails.getFilter().test(uri))
        .map(AuthDetails::getUsernameAndPassword)
        .findFirst();
  }

  private void interceptRequest() {
    this.network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT));

    this.network.onBeforeRequestSent(
        beforeRequestSent -> {
          String requestId = beforeRequestSent.getRequest().getRequestId();
          URI uri = URI.create(beforeRequestSent.getRequest().getUrl());

          ContinueRequestParameters continueRequestParameters =
              new ContinueRequestParameters(requestId);

          Optional<UnaryOperator<HttpRequest>> requestHandler = getRequestHandler(uri);

          if (requestHandler.isPresent()) {
            RequestData interceptedRequest = beforeRequestSent.getRequest();

            // Build the originalRequest object from the intercepted request details.
            HttpRequest originalRequest =
                new HttpRequest(
                    HttpMethod.getHttpMethod(interceptedRequest.getMethod()),
                    interceptedRequest.getUrl());

            // Populate the headers of the original request.
            interceptedRequest
                .getHeaders()
                .forEach(
                    header ->
                        originalRequest.addHeader(header.getName(), header.getValue().getValue()));

            HttpRequest modifiedRequest = requestHandler.get().apply(originalRequest);

            continueRequestParameters.method(modifiedRequest.getMethod());

            if (!uri.toString().equals(modifiedRequest.getUri())) {
              continueRequestParameters.url(modifiedRequest.getUri());
            }

            List<Header> headerList = new ArrayList<>();
            modifiedRequest.forEachHeader(
                (name, value) ->
                    headerList.add(
                        new Header(name, new BytesValue(BytesValue.Type.STRING, value))));

            if (!headerList.isEmpty()) {
              continueRequestParameters.headers(headerList);
            }

            Contents.Supplier content = modifiedRequest.getContent();

            if (content.length() > 0) {
              continueRequestParameters.body(
                  new BytesValue(BytesValue.Type.STRING, Contents.utf8String(content)));
            }
          }
          network.continueRequest(continueRequestParameters);
        });
  }

  private Optional<UnaryOperator<HttpRequest>> getRequestHandler(URI uri) {
    return requestHandlers.values().stream()
        .filter(requestDetails -> requestDetails.getFilter().test(uri))
        .map(RequestDetails::getHandler)
        .findFirst();
  }

  @Override
  public long addAuthenticationHandler(UsernameAndPassword usernameAndPassword) {
    return addAuthenticationHandler(url -> true, usernameAndPassword);
  }

  @Override
  public long addAuthenticationHandler(
      Predicate<URI> filter, UsernameAndPassword usernameAndPassword) {
    long id = this.callBackId.incrementAndGet();

    authHandlers.put(id, new AuthDetails(filter, usernameAndPassword));
    return id;
  }

  @Override
  public void removeAuthenticationHandler(long id) {
    authHandlers.remove(id);
  }

  @Override
  public void clearAuthenticationHandlers() {
    authHandlers.clear();
  }

  @Override
  public long addRequestHandler(Predicate<URI> filter, UnaryOperator<HttpRequest> handler) {
    long id = this.callBackId.incrementAndGet();

    requestHandlers.put(id, new RequestDetails(filter, handler));
    return id;
  }

  @Override
  public void removeRequestHandler(long id) {
    requestHandlers.remove(id);
  }

  @Override
  public void clearRequestHandlers() {
    requestHandlers.clear();
  }

  private class AuthDetails {
    private final Predicate<URI> filter;
    private final UsernameAndPassword usernameAndPassword;

    public AuthDetails(Predicate<URI> filter, UsernameAndPassword usernameAndPassword) {
      this.filter = filter;
      this.usernameAndPassword = usernameAndPassword;
    }

    public Predicate<URI> getFilter() {
      return filter;
    }

    public UsernameAndPassword getUsernameAndPassword() {
      return usernameAndPassword;
    }
  }

  private class RequestDetails {
    private final Predicate<URI> filter;
    private final UnaryOperator<HttpRequest> handler;

    public RequestDetails(Predicate<URI> filter, UnaryOperator<HttpRequest> handler) {
      this.filter = filter;
      this.handler = handler;
    }

    public Predicate<URI> getFilter() {
      return this.filter;
    }

    public UnaryOperator<HttpRequest> getHandler() {
      return this.handler;
    }
  }
}
