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

package org.openqa.selenium.grid.web;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandCodec;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.ResponseCodec;
import org.openqa.selenium.remote.codec.jwp.JsonHttpCommandCodec;
import org.openqa.selenium.remote.codec.jwp.JsonHttpResponseCodec;
import org.openqa.selenium.remote.codec.w3c.W3CHttpCommandCodec;
import org.openqa.selenium.remote.codec.w3c.W3CHttpResponseCodec;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.internal.JsonToWebElementConverter;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;

public class ProtocolConverter implements CommandHandler {

  private final static ImmutableSet<String> IGNORED_REQ_HEADERS = ImmutableSet.<String>builder()
      .add("connection")
      .add("keep-alive")
      .add("proxy-authorization")
      .add("proxy-authenticate")
      .add("proxy-connection")
      .add("te")
      .add("trailer")
      .add("transfer-encoding")
      .add("upgrade")
      .build();

  private final HttpClient client;
  private final CommandCodec<HttpRequest> downstream;
  private final CommandCodec<HttpRequest> upstream;
  private final ResponseCodec<HttpResponse> downstreamResponse;
  private final ResponseCodec<HttpResponse> upstreamResponse;
  private final JsonToWebElementConverter converter;

  public ProtocolConverter(
      HttpClient client,
      Dialect downstream,
      Dialect upstream) {
    this.client = Objects.requireNonNull(client);

    Objects.requireNonNull(downstream);
    this.downstream = getCommandCodec(downstream);
    this.downstreamResponse = getResponseCodec(downstream);

    Objects.requireNonNull(upstream);
    this.upstream = getCommandCodec(upstream);
    this.upstreamResponse = getResponseCodec(upstream);

    converter = new JsonToWebElementConverter(null);
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    Command command = downstream.decode(req);
    // Massage the webelements
    @SuppressWarnings("unchecked")
    Map<String, ?> parameters = (Map<String, ?>) converter.apply(command.getParameters());
    command = new Command(
        command.getSessionId(),
        command.getName(),
        parameters);

    HttpRequest request = upstream.encode(command);

    HttpResponse res = makeRequest(request);

    Response decoded = upstreamResponse.decode(res);
    HttpResponse response = downstreamResponse.encode(HttpResponse::new, decoded);

    copyToServletResponse(response, resp);
  }

  @VisibleForTesting
  HttpResponse makeRequest(HttpRequest request) throws IOException {
    return client.execute(request);
  }

  private void copyToServletResponse(HttpResponse response, HttpResponse resp) {
    resp.setStatus(response.getStatus());

    for (String name : response.getHeaderNames()) {
      if (IGNORED_REQ_HEADERS.contains(name.toLowerCase())) {
        continue;
      }

      for (String value : response.getHeaders(name)) {
        resp.addHeader(name, value);
      }
    }

    resp.setContent(response.consumeContentStream());
  }

  private CommandCodec<HttpRequest> getCommandCodec(Dialect dialect) {
    switch (dialect) {
      case OSS:
        return new JsonHttpCommandCodec();

      case W3C:
        return new W3CHttpCommandCodec();

      default:
        throw new IllegalStateException("Unknown dialect: " + dialect);
    }
  }

  private ResponseCodec<HttpResponse> getResponseCodec(Dialect dialect) {
    switch (dialect) {
      case OSS:
        return new JsonHttpResponseCodec();

      case W3C:
        return new W3CHttpResponseCodec();

      default:
        throw new IllegalStateException("Unknown dialect: " + dialect);
    }
  }

}
