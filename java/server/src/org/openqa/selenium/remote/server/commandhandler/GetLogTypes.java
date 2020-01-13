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

package org.openqa.selenium.remote.server.commandhandler;

import com.google.common.collect.ImmutableSet;
import org.openqa.selenium.grid.session.ActiveSession;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.UncheckedIOException;
import java.util.Collection;
import java.util.Map;
import java.util.Objects;

import static java.net.HttpURLConnection.HTTP_OK;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class GetLogTypes implements HttpHandler {

  private final Json json;
  private final ActiveSession session;

  public GetLogTypes(Json json, ActiveSession session) {
    this.json = Objects.requireNonNull(json);
    this.session = Objects.requireNonNull(session);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    // Try going upstream first. It's okay if this fails.
    HttpRequest upReq = new HttpRequest(GET, String.format("/session/%s/log/types", session.getId()));
    HttpResponse upRes = session.execute(upReq);

    ImmutableSet.Builder<String> types = ImmutableSet.builder();
    types.add(LogType.SERVER);

    if (upRes.getStatus() == HTTP_OK) {
      Map<String, Object> upstream = json.toType(string(upRes), Json.MAP_TYPE);
      Object raw = upstream.get("value");
      if (raw instanceof Collection) {
        ((Collection<?>) raw).stream().map(String::valueOf).forEach(types::add);
      }
    }

    Response response = new Response(session.getId());
    response.setValue(types.build());
    response.setStatus(ErrorCodes.SUCCESS);

    HttpResponse resp = new HttpResponse();
    session.getDownstreamDialect().getResponseCodec().encode(() -> resp, response);
    return resp;
  }
}
