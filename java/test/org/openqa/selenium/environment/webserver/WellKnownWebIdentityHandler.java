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

package org.openqa.selenium.environment.webserver;

import static java.nio.charset.StandardCharsets.UTF_8;

import java.io.UncheckedIOException;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.UrlPath;

class WellKnownWebIdentityHandler implements HttpHandler {

  private static final String RESPONSE_STRING = "{\"provider_urls\": [\"%s\"]}";

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    HttpResponse response = new HttpResponse();
    response.setHeader("Content-Type", "application/json");
    response.setHeader("Cache-Control", "no-store");
    String targetLocation = UrlPath.relativeToContext(req, "/fedcm/fedcm.json");

    response.setContent(Contents.string(String.format(RESPONSE_STRING, targetLocation), UTF_8));

    return response;
  }
}
