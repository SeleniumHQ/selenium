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

package org.openqa.selenium.devtools.v114;

import static java.net.HttpURLConnection.HTTP_OK;

import com.google.common.collect.ImmutableList;
import com.google.common.io.ByteStreams;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.idealized.Network;
import org.openqa.selenium.devtools.v114.fetch.Fetch;
import org.openqa.selenium.devtools.v114.fetch.model.AuthChallengeResponse;
import org.openqa.selenium.devtools.v114.fetch.model.AuthRequired;
import org.openqa.selenium.devtools.v114.fetch.model.HeaderEntry;
import org.openqa.selenium.devtools.v114.fetch.model.RequestPattern;
import org.openqa.selenium.devtools.v114.fetch.model.RequestPaused;
import org.openqa.selenium.devtools.v114.fetch.model.RequestStage;
import org.openqa.selenium.devtools.v114.network.model.Request;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

public class v114Network extends Network<AuthRequired, RequestPaused> {

  private static final Logger LOG = Logger.getLogger(v114Network.class.getName());

  public v114Network(DevTools devTools) {
    super(devTools);
  }

  @Override
  protected Command<Void> setUserAgentOverride(UserAgent userAgent) {
    return org.openqa.selenium.devtools.v114.network.Network.setUserAgentOverride(
        userAgent.userAgent(), userAgent.acceptLanguage(), userAgent.platform(), Optional.empty());
  }

  @Override
  protected Command<Void> enableNetworkCaching() {
    return org.openqa.selenium.devtools.v114.network.Network.setCacheDisabled(false);
  }

  @Override
  protected Command<Void> disableNetworkCaching() {
    return org.openqa.selenium.devtools.v114.network.Network.setCacheDisabled(true);
  }

  @Override
  protected Command<Void> enableFetchForAllPatterns() {
    return Fetch.enable(
        Optional.of(
            ImmutableList.of(
                new RequestPattern(
                    Optional.of("*"), Optional.empty(), Optional.of(RequestStage.REQUEST)),
                new RequestPattern(
                    Optional.of("*"), Optional.empty(), Optional.of(RequestStage.RESPONSE)))),
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
  protected Command<Void> continueWithAuth(
      AuthRequired authRequired, UsernameAndPassword credentials) {
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
        new AuthChallengeResponse(
            AuthChallengeResponse.Response.CANCELAUTH, Optional.empty(), Optional.empty()));
  }

  @Override
  public Event<RequestPaused> requestPausedEvent() {
    return Fetch.requestPaused();
  }

  @Override
  public Either<HttpRequest, HttpResponse> createSeMessages(RequestPaused pausedReq) {
    if (pausedReq.getResponseStatusCode().isPresent()
        || pausedReq.getResponseErrorReason().isPresent()) {
      String body;
      boolean bodyIsBase64Encoded;

      try {
        Fetch.GetResponseBodyResponse base64Body =
            devTools.send(Fetch.getResponseBody(pausedReq.getRequestId()));
        body = base64Body.getBody();
        bodyIsBase64Encoded =
            base64Body.getBase64Encoded() != null && base64Body.getBase64Encoded();
      } catch (DevToolsException e) {
        // Redirects don't seem to have bodies
        int code = pausedReq.getResponseStatusCode().orElse(HTTP_OK);
        if (code < 300 && code > 399) {
          LOG.warning("Unable to get body for request id " + pausedReq.getRequestId());
        }

        body = null;
        bodyIsBase64Encoded = false;
      }

      List<Map.Entry<String, String>> headers = new ArrayList<>();
      pausedReq
          .getResponseHeaders()
          .ifPresent(
              resHeaders ->
                  resHeaders.forEach(
                      header ->
                          headers.add(
                              new AbstractMap.SimpleEntry<>(header.getName(), header.getValue()))));

      HttpResponse res =
          createHttpResponse(pausedReq.getResponseStatusCode(), body, bodyIsBase64Encoded, headers);

      return Either.right(res);
    }

    Request cdpReq = pausedReq.getRequest();

    HttpRequest req =
        createHttpRequest(
            cdpReq.getMethod(), cdpReq.getUrl(), cdpReq.getHeaders(), cdpReq.getPostData());

    return Either.left(req);
  }

  @Override
  protected String getRequestId(RequestPaused pausedReq) {
    return pausedReq.getRequestId().toString();
  }

  @Override
  protected Command<Void> continueWithoutModification(RequestPaused pausedRequest) {
    return Fetch.continueRequest(
        pausedRequest.getRequestId(),
        Optional.empty(),
        Optional.empty(),
        Optional.empty(),
        Optional.empty(),
        Optional.empty());
  }

  @Override
  protected Command<Void> continueRequest(RequestPaused pausedReq, HttpRequest req) {
    ByteArrayOutputStream bos = new ByteArrayOutputStream();
    try (InputStream is = req.getContent().get()) {
      ByteStreams.copy(is, bos);
    } catch (IOException e) {
      return continueWithoutModification(pausedReq);
    }

    List<HeaderEntry> headers = new ArrayList<>();
    req.forEachHeader((name, value) -> headers.add(new HeaderEntry(name, value)));

    return Fetch.continueRequest(
        pausedReq.getRequestId(),
        Optional.empty(),
        Optional.of(req.getMethod().toString()),
        Optional.of(Base64.getEncoder().encodeToString(bos.toByteArray())),
        Optional.of(headers),
        Optional.empty());
  }

  @Override
  protected Command<Void> fulfillRequest(RequestPaused pausedReq, HttpResponse res) {
    List<HeaderEntry> headers = new ArrayList<>();
    res.forEachHeader((name, value) -> headers.add(new HeaderEntry(name, value)));

    ByteArrayOutputStream bos = new ByteArrayOutputStream();
    try (InputStream is = res.getContent().get()) {
      ByteStreams.copy(is, bos);
    } catch (IOException e) {
      bos.reset();
    }

    return Fetch.fulfillRequest(
        pausedReq.getRequestId(),
        res.getStatus(),
        Optional.of(headers),
        Optional.empty(),
        Optional.of(Base64.getEncoder().encodeToString(bos.toByteArray())),
        Optional.empty());
  }
}
