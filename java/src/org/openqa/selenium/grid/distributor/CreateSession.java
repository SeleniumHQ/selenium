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

package org.openqa.selenium.grid.distributor;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.util.Collections.singletonMap;

import java.io.UncheckedIOException;
import java.util.Map;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

class CreateSession implements HttpHandler {

  private final Distributor distributor;

  CreateSession(Distributor distributor) {
    this.distributor = Require.nonNull("Distributor", distributor);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    SessionRequest request = Contents.fromJson(req, SessionRequest.class);

    Either<SessionNotCreatedException, CreateSessionResponse> result =
        distributor.newSession(request);

    HttpResponse res = new HttpResponse();
    Map<String, Object> value;
    if (result.isLeft()) {
      res.setStatus(HTTP_INTERNAL_ERROR);
      value = singletonMap("value", result.left());
    } else {
      value = singletonMap("value", result.right());
    }

    res.setContent(Contents.asJson(value));

    return res;
  }
}
