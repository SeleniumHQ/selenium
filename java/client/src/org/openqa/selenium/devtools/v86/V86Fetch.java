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

package org.openqa.selenium.devtools.v86;

import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.idealized.fetch.model.RequestId;
import org.openqa.selenium.devtools.idealized.fetch.model.RequestPattern;
import org.openqa.selenium.devtools.idealized.page.model.FrameId;
import org.openqa.selenium.devtools.v86.fetch.Fetch;
import org.openqa.selenium.devtools.v86.fetch.model.HeaderEntry;
import org.openqa.selenium.devtools.v86.fetch.model.RequestPaused;
import org.openqa.selenium.devtools.v86.network.model.Request;
import org.openqa.selenium.devtools.v86.network.model.ResourceType;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class V86Fetch implements org.openqa.selenium.devtools.idealized.fetch.Fetch {

  @Override
  public Command<Void> enable(Optional<List<RequestPattern>> patterns, boolean handleAuthRequests) {
    List<org.openqa.selenium.devtools.v86.fetch.model.RequestPattern> mapped = patterns.orElseGet(ArrayList::new).stream()
      .map(pattern -> {
        Optional<ResourceType> type = pattern.getType().map(t -> ResourceType.fromString(t.toString()));
        return new org.openqa.selenium.devtools.v86.fetch.model.RequestPattern(
          pattern.getUrlPattern(),
          type,
          Optional.empty());
      })
      .collect(Collectors.toList());

    return Fetch.enable(
      patterns.isEmpty() ? Optional.empty() : Optional.of(mapped),
      Optional.of(handleAuthRequests));
  }

  @Override
  public Event<org.openqa.selenium.devtools.idealized.fetch.model.RequestPaused> requestPaused() {
    return new Event<>(
      Fetch.requestPaused().getMethod(),
      input -> {
        RequestPaused incoming = input.read(RequestPaused.class);

        Optional<HttpResponse> response = Optional.empty();
        Optional<HttpRequest> request = Optional.empty();

        // Do we need to populate the request or the response?
        if (incoming.getResponseErrorReason().isPresent() || incoming.getResponseStatusCode().isPresent()) {
          HttpResponse res = new HttpResponse()
            .setStatus(incoming.getResponseStatusCode().orElse(200));

          incoming.getResponseHeaders().orElseGet(ArrayList::new)
            .forEach(entry -> res.addHeader(entry.getName(), entry.getValue()));

          response = Optional.of(res);
        } else {
          Request cdpRequest = incoming.getRequest();

          HttpMethod method;
          try {
             method = HttpMethod.valueOf(cdpRequest.getMethod().toUpperCase());
          } catch (IllegalArgumentException e) {
            // Spam in a reasonable value
            method = HttpMethod.GET;
          }

          HttpRequest req = new HttpRequest(method, cdpRequest.getUrl());
          cdpRequest.getHeaders().forEach((key, value) -> req.addHeader(key, String.valueOf(value)));
          cdpRequest.getPostData().ifPresent(data -> {
            req.setContent(Contents.utf8String(data));
          });

          request = Optional.of(req);
        }

        return new org.openqa.selenium.devtools.idealized.fetch.model.RequestPaused(
          new RequestId(incoming.getRequestId().toString()),
          new FrameId(incoming.getFrameId().toString()),
          incoming.getNetworkId().map(id -> new RequestId(id.toString())),
          request,
          response);
      });
  }

  @Override
  public Command<Void> fulfillRequest(RequestId requestId, HttpResponse response) {
    List<HeaderEntry> headers = new ArrayList<>();
    response.getHeaderNames().forEach(
      name -> response.getHeaders(name).forEach(value -> headers.add(new HeaderEntry(name, value))));

    byte[] bytes = Contents.bytes(response.getContent());
    String body = bytes.length > 0 ? Base64.getEncoder().encodeToString(bytes) : null;

    return Fetch.fulfillRequest(
      new org.openqa.selenium.devtools.v86.fetch.model.RequestId(requestId.toString()),
      response.getStatus(),
      Optional.of(headers),
      Optional.empty(),
      Optional.ofNullable(body),
      Optional.empty());
  }

  @Override
  public Command<Void> continueRequest(RequestId requestId) {
    return Fetch.continueRequest(
      new org.openqa.selenium.devtools.v86.fetch.model.RequestId(requestId.toString()),
      Optional.empty(),
      Optional.empty(),
      Optional.empty(),
      Optional.empty());
  }
}
