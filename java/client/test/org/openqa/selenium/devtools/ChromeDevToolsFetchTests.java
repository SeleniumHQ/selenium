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
package org.openqa.selenium.devtools;

import static org.openqa.selenium.devtools.fetch.Fetch.continueRequest;
import static org.openqa.selenium.devtools.fetch.Fetch.enable;
import static org.openqa.selenium.devtools.fetch.Fetch.failRequest;
import static org.openqa.selenium.devtools.fetch.Fetch.fulfillRequest;
import static org.openqa.selenium.devtools.fetch.Fetch.getResponseBody;
import static org.openqa.selenium.devtools.fetch.Fetch.requestPaused;
import static org.openqa.selenium.devtools.fetch.Fetch.takeResponseBodyAsStream;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.devtools.io.model.StreamHandle;
import org.openqa.selenium.devtools.fetch.model.RequestPattern;
import org.openqa.selenium.devtools.fetch.model.RequestStage;
import org.openqa.selenium.devtools.fetch.model.ResponseBody;
import org.openqa.selenium.devtools.network.model.ErrorReason;
import org.openqa.selenium.devtools.network.model.ResourceType;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

// TODO: Add some checks, the tests does not ensure a listener is actually invoked
public class ChromeDevToolsFetchTests extends ChromeDevToolsTestBase {

  @Test
  public void testFulfillRequest() {
    devTools.addListener(
        requestPaused(),
        p -> {
          Assert.assertNotNull(p);
          devTools.send(
              fulfillRequest(
                  p.getRequestId(),
                  204,
                  p.getResponseHeaders(),
                  Optional.empty(),
                  Optional.empty()));
        });
    List<RequestPattern> patterns = new ArrayList();
    patterns.add(new RequestPattern("*://*.*", ResourceType.EventSource, RequestStage.Request));
    devTools.send(enable(Optional.of(patterns), Optional.empty()));
    chromeDriver.get(appServer.whereIs("simpleTest.html"));
  }

  @Test
  public void testContinueRequest() {
    devTools.addListener(
        requestPaused(),
        p -> {
          Assert.assertNotNull(p);
          devTools.send(
              continueRequest(
                  p.getRequestId(),
                  Optional.of(appServer.whereIs("simpleTest.html")),
                  Optional.of("GET"),
                  Optional.empty(),
                  Optional.of(p.getResponseHeaders())));
          ResponseBody body = devTools.send(getResponseBody(p.getRequestId()));
          Assert.assertNotNull(body);
          StreamHandle stream = devTools.send(takeResponseBodyAsStream(p.getRequestId()));
          Assert.assertNotNull(stream);

        });
    List<RequestPattern> patterns = new ArrayList();
    patterns.add(new RequestPattern("*://*.*", ResourceType.EventSource, RequestStage.Request));
    devTools.send(enable(Optional.of(patterns), Optional.empty()));
    chromeDriver.get(appServer.whereIs("simpleTest.html"));
  }

  @Test
  public void testFailRequest() {
    devTools.addListener(
        requestPaused(),
        p -> {
          Assert.assertNotNull(p);
          devTools.send(failRequest(p.getRequestId(), ErrorReason.BlockedByClient));
        });
    List<RequestPattern> patterns = new ArrayList();
    patterns.add(new RequestPattern("*://*.*", ResourceType.EventSource, RequestStage.Request));
    devTools.send(enable(Optional.of(patterns), Optional.empty()));
    chromeDriver.get(appServer.whereIs("simpleTest.html"));
  }

}
