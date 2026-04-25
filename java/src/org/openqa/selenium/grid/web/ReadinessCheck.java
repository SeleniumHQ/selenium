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

import static java.net.HttpURLConnection.HTTP_OK;
import static java.net.HttpURLConnection.HTTP_UNAVAILABLE;
import static org.openqa.selenium.json.Json.JSON_UTF_8;

import java.io.UncheckedIOException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.BooleanSupplier;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

public class ReadinessCheck implements HttpHandler {

  private final String name;
  private final BooleanSupplier isReady;
  private final AtomicBoolean acceptingTraffic = new AtomicBoolean(true);

  public ReadinessCheck(String name, BooleanSupplier isReady) {
    this.name = Require.nonNull("Name", name);
    this.isReady = Require.nonNull("Readiness check", isReady);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    boolean ready = false;
    try {
      ready = acceptingTraffic.get() && isReady.getAsBoolean();
    } catch (RuntimeException e) {
      // Leave ready as false.
    }

    return new HttpResponse()
        .setStatus(ready ? HTTP_OK : HTTP_UNAVAILABLE)
        .setHeader("Content-Type", JSON_UTF_8)
        .setContent(Contents.utf8String(name + " is " + ready));
  }

  public void stopAcceptingTraffic() {
    acceptingTraffic.set(false);
  }
}
