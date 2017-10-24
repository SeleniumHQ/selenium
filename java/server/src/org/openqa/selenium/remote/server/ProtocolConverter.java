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

package org.openqa.selenium.remote.server;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandCodec;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.ResponseCodec;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.internal.ApacheHttpClient;
import org.openqa.selenium.remote.internal.JsonToWebElementConverter;

import java.io.IOException;
import java.net.URL;
import java.util.Map;

class ProtocolConverter implements SessionCodec {

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
      URL upstreamUrl,
      CommandCodec<HttpRequest> downstream,
      ResponseCodec<HttpResponse> downstreamResponse,
      CommandCodec<HttpRequest> upstream,
      ResponseCodec<HttpResponse> upstreamResponse) {
    this.downstream = downstream;
    this.upstream = upstream;
    this.downstreamResponse = downstreamResponse;
    this.upstreamResponse = upstreamResponse;

    client = new ApacheHttpClient.Factory().createClient(upstreamUrl);
    converter = new JsonToWebElementConverter(null);
  }

  @Override
  public void handle(HttpRequest req, HttpResponse resp) throws IOException {
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
    return client.execute(request, true);
  }

  private void copyToServletResponse(HttpResponse response, HttpResponse resp)
      throws IOException {
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
}
