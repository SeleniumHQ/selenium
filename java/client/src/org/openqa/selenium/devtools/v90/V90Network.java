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

package org.openqa.selenium.devtools.v90;

import com.google.common.collect.ImmutableList;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.idealized.Network;
import org.openqa.selenium.devtools.v90.fetch.Fetch;
import org.openqa.selenium.devtools.v90.fetch.model.AuthChallengeResponse;
import org.openqa.selenium.devtools.v90.fetch.model.AuthRequired;
import org.openqa.selenium.devtools.v90.fetch.model.HeaderEntry;
import org.openqa.selenium.devtools.v90.fetch.model.RequestPattern;
import org.openqa.selenium.devtools.v90.fetch.model.RequestPaused;
import org.openqa.selenium.devtools.v90.network.model.Request;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

public class V90Network extends Network<AuthRequired, RequestPaused> {

  public V90Network(DevTools devTools) {
    super(devTools);
  }

  @Override
  protected Command<Void> setUserAgentOverride(UserAgent userAgent) {
    return org.openqa.selenium.devtools.v90.network.Network.setUserAgentOverride(
      userAgent.userAgent(), userAgent.acceptLanguage(), userAgent.platform(), Optional.empty());
  }

  @Override
  protected Command<Void> enableNetworkCaching() {
    return org.openqa.selenium.devtools.v90.network.Network.setCacheDisabled(false);
  }

  @Override
  protected Command<Void> disableNetworkCaching() {
    return org.openqa.selenium.devtools.v90.network.Network.setCacheDisabled(true);
  }

  @Override
  protected Command<Void> enableFetchForAllPatterns() {
    return Fetch.enable(
      Optional.of(ImmutableList.of(new RequestPattern(Optional.of("*"), Optional.empty(), Optional.empty()))),
      Optional.of(true));
  }

  @Override
  protected Command<Void> disableFetch() {
    return Fetch.disable();
  }

  @Override
  protected Event<AuthRequired> authRequiredEvent() {
    return Fetch.authRequired();
  }

  @Override
  protected String getUriFrom(AuthRequired authRequired) {
    return authRequired.getAuthChallenge().getOrigin();
  }

  @Override
  protected Command<Void> continueWithAuth(AuthRequired authRequired, UsernameAndPassword credentials) {
    return Fetch.continueWithAuth(
      authRequired.getRequestId(),
      new AuthChallengeResponse(
        AuthChallengeResponse.Response.PROVIDECREDENTIALS,
        Optional.of(credentials.username()),
        Optional.ofNullable(credentials.password())));
  }

  @Override
  protected Command<Void> cancelAuth(AuthRequired authRequired) {
    return Fetch.continueWithAuth(
      authRequired.getRequestId(),
      new AuthChallengeResponse(AuthChallengeResponse.Response.CANCELAUTH, Optional.empty(), Optional.empty()));
  }

  @Override
  protected Event<RequestPaused> requestPausedEvent() {
    return Fetch.requestPaused();
  }

  @Override
  protected Optional<HttpRequest> createHttpRequest(RequestPaused pausedRequest) {
    if (pausedRequest.getResponseErrorReason().isPresent() || pausedRequest.getResponseStatusCode().isPresent()) {
      return Optional.empty();
    }

    Request cdpRequest = pausedRequest.getRequest();

    return Optional.of(createHttpRequest(
      cdpRequest.getMethod(),
      cdpRequest.getUrl(),
      cdpRequest.getHeaders(),
      cdpRequest.getPostData()));
  }

  @Override
  protected Command<Void> continueWithoutModification(RequestPaused pausedRequest) {
    return Fetch.continueRequest(
      pausedRequest.getRequestId(),
      Optional.empty(),
      Optional.empty(),
      Optional.empty(),
      Optional.empty());
  }

  @Override
  protected Command<Void> createResponse(RequestPaused pausedRequest, HttpResponse response) {
    List<HeaderEntry> headers = new ArrayList<>();
    response.getHeaderNames().forEach(
      name -> response.getHeaders(name).forEach(value -> headers.add(new HeaderEntry(name, value))));

    byte[] bytes = Contents.bytes(response.getContent());
    String body = bytes.length > 0 ? Base64.getEncoder().encodeToString(bytes) : null;

    return Fetch.fulfillRequest(
      pausedRequest.getRequestId(),
      response.getStatus(),
      Optional.of(headers),
      Optional.empty(),
      Optional.ofNullable(body),
      Optional.empty());
  }
}
