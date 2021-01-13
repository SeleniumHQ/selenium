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

package org.openqa.selenium.grid.sessionqueue.local;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.grid.sessionqueue.NewSessionQueue.SESSIONREQUEST_TIMESTAMP_HEADER;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

public class LocalSessionQueueInfoTest {

  private NewSessionQueue sessionQueue;
  public static final Json JSON = new Json();
  public static final String COUNT = "count";
  public static final String BROWSER = "browser";
  public static final String PLATFORM = "platform";
  public static final String PLATFORMS = "platforms";
  public static final String VERSION = "version";
  public static final String VERSIONS = "versions";
  public static final String BROWSERNAME = "browserName";
  public static final String CHROME = "chrome";
  public static final String URI = "/session";

  @Before
  public void setUp() {
    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus bus = new GuavaEventBus();
    sessionQueue = new LocalNewSessionQueue(
      tracer,
      bus,
      Duration.ofSeconds(30),
      Duration.ofSeconds(30));
  }

  @Test
  public void shouldBeAbleToGetValidResponse() {
    long timestamp = Instant.now().getEpochSecond();

    ImmutableCapabilities chromeCaps = new ImmutableCapabilities(
      BROWSERNAME, CHROME,
      PLATFORM, "mac",
      VERSION, "87");
    NewSessionPayload chromePayload = NewSessionPayload.create(chromeCaps);
    HttpRequest chromeRequest = createRequest(chromePayload, POST, URI);
    chromeRequest.addHeader(SESSIONREQUEST_TIMESTAMP_HEADER, Long.toString(timestamp));
    RequestId chromeRequestId = new RequestId(UUID.randomUUID());
    boolean addChromeRequest = sessionQueue.offerLast(chromeRequest, chromeRequestId);
    assertTrue(addChromeRequest);

    String response = sessionQueue.getQueueInfo();
    assertNotNull(response);

    List<Object> browserList = JSON.toType(response, Json.OBJECT_TYPE);
    assertEquals(1, browserList.size());

    Map<String, Object> chromeBrowserInfo = (Map<String, Object>) browserList.get(0);
    assertEquals(CHROME, chromeBrowserInfo.get(BROWSER));
    assertEquals(1L, chromeBrowserInfo.get(COUNT));

    List<Object> platforms = (List<Object>) chromeBrowserInfo.get(PLATFORMS);
    assertEquals(1, platforms.size());

    Map<String, Object> platform = (Map<String, Object>) platforms.get(0);
    assertEquals("MAC", platform.get(PLATFORM));
    assertEquals(1L, platform.get(COUNT));

    List<Object> versions = (List<Object>) platform.get(VERSIONS);
    assertEquals(1, versions.size());

    Map<String, Object> version = (Map<String, Object>) versions.get(0);
    assertEquals("87", version.get(VERSION));
    assertEquals(1L, version.get(COUNT));
  }

  @Test
  public void shouldBeAbleToGetValidResponseForEmptyQueue() {
    String response = sessionQueue.getQueueInfo();
    assertNotNull(response);
    List<Object> browserList = JSON.toType(response, Json.OBJECT_TYPE);
    assertEquals(0, browserList.size());
  }

  @Test
  public void shouldBeAbleToHandleMissingBrowser() {
    long timestamp = Instant.now().getEpochSecond();

    ImmutableCapabilities capabilities = new ImmutableCapabilities(PLATFORM, "mac");
    NewSessionPayload newSessionPayload = NewSessionPayload.create(capabilities);
    HttpRequest request = createRequest(newSessionPayload, POST, URI);
    request.addHeader(SESSIONREQUEST_TIMESTAMP_HEADER, Long.toString(timestamp));
    RequestId id = new RequestId(UUID.randomUUID());
    sessionQueue.offerLast(request, id);

    String response = sessionQueue.getQueueInfo();
    assertNotNull(response);

    List<Object> browserList = JSON.toType(response, Json.OBJECT_TYPE);
    assertEquals(1, browserList.size());

    Map<String, Object> browserInfo = (Map<String, Object>) browserList.get(0);
    assertEquals("ANY", browserInfo.get(BROWSER));
    assertEquals(1L, browserInfo.get(COUNT));
  }

  @Test
  public void shouldBeAbleToHandleMissingPlatform() {
    long timestamp = Instant.now().getEpochSecond();

    ImmutableCapabilities capabilities = new ImmutableCapabilities(
      BROWSERNAME, CHROME,
      VERSION, "87");
    NewSessionPayload newSessionPayload = NewSessionPayload.create(capabilities);
    HttpRequest request = createRequest(newSessionPayload, POST, URI);
    request.addHeader(SESSIONREQUEST_TIMESTAMP_HEADER, Long.toString(timestamp));
    RequestId id = new RequestId(UUID.randomUUID());
    sessionQueue.offerLast(request, id);

    String response = sessionQueue.getQueueInfo();
    assertNotNull(response);

    List<Object> browserList = JSON.toType(response, Json.OBJECT_TYPE);
    assertEquals(1, browserList.size());

    Map<String, Object> chromeBrowserInfo = (Map<String, Object>) browserList.get(0);
    assertEquals(CHROME, chromeBrowserInfo.get(BROWSER));
    assertEquals(1L, chromeBrowserInfo.get(COUNT));

    List<Object> platforms = (List<Object>) chromeBrowserInfo.get(PLATFORMS);
    assertEquals(1, platforms.size());

    Map<String, Object> platform = (Map<String, Object>) platforms.get(0);
    assertEquals("ANY", platform.get(PLATFORM));
    assertEquals(1L, platform.get(COUNT));
  }

  @Test
  public void shouldBeAbleToHandleMissingVersion() {
    long timestamp = Instant.now().getEpochSecond();

    ImmutableCapabilities capabilities = new ImmutableCapabilities(
      BROWSERNAME, CHROME,
      PLATFORM, "mac");
    NewSessionPayload newSessionPayload = NewSessionPayload.create(capabilities);
    HttpRequest request = createRequest(newSessionPayload, POST, URI);
    request.addHeader(SESSIONREQUEST_TIMESTAMP_HEADER, Long.toString(timestamp));
    RequestId id = new RequestId(UUID.randomUUID());
    sessionQueue.offerLast(request, id);

    String response = sessionQueue.getQueueInfo();
    assertNotNull(response);

    List<Object> browserList = JSON.toType(response, Json.OBJECT_TYPE);
    assertEquals(1, browserList.size());

    Map<String, Object> chromeBrowserInfo = (Map<String, Object>) browserList.get(0);
    assertEquals(CHROME, chromeBrowserInfo.get(BROWSER));
    assertEquals(1L, chromeBrowserInfo.get(COUNT));

    List<Object> platforms = (List<Object>) chromeBrowserInfo.get(PLATFORMS);
    assertEquals(1, platforms.size());

    Map<String, Object> platform = (Map<String, Object>) platforms.get(0);

    List<Object> versions = (List<Object>) platform.get(VERSIONS);
    assertEquals(1, versions.size());

    Map<String, Object> version = (Map<String, Object>) versions.get(0);
    assertEquals("ANY", version.get(VERSION));
    assertEquals(1L, version.get(COUNT));
  }

  @Test
  public void shouldBeAbleToGroupBrowsers() {
    long timestamp = Instant.now().getEpochSecond();

    ImmutableCapabilities chromeCaps = new ImmutableCapabilities(BROWSERNAME, CHROME);
    NewSessionPayload chromePayload = NewSessionPayload.create(chromeCaps);
    HttpRequest chromeRequest = createRequest(chromePayload, POST, URI);
    chromeRequest.addHeader(SESSIONREQUEST_TIMESTAMP_HEADER, Long.toString(timestamp));
    RequestId chromeRequestId = new RequestId(UUID.randomUUID());

    ImmutableCapabilities firefoxCaps = new ImmutableCapabilities(
      BROWSERNAME, "firefox",
      PLATFORM, "windows",
      VERSION, "84");
    NewSessionPayload firefoxPayload = NewSessionPayload.create(firefoxCaps);
    HttpRequest firefoxRequest = createRequest(firefoxPayload, POST, URI);
    firefoxRequest.addHeader(SESSIONREQUEST_TIMESTAMP_HEADER, Long.toString(timestamp));
    RequestId firefoxRequestId = new RequestId(UUID.randomUUID());

    sessionQueue.offerLast(chromeRequest, chromeRequestId);
    sessionQueue.offerLast(firefoxRequest, firefoxRequestId);
    sessionQueue.offerLast(chromeRequest, chromeRequestId);
    sessionQueue.offerLast(firefoxRequest, firefoxRequestId);

    String response = sessionQueue.getQueueInfo();
    assertNotNull(response);

    List<Object> browserList = JSON.toType(response, Json.OBJECT_TYPE);
    assertEquals(2, browserList.size());

    Map<String, Object> chromeBrowserInfo = (Map<String, Object>) browserList.get(0);
    assertEquals(CHROME, chromeBrowserInfo.get(BROWSER));
    assertEquals(2L, chromeBrowserInfo.get(COUNT));

    Map<String, Object> firefoxBrowserInfo = (Map<String, Object>) browserList.get(1);
    assertEquals("firefox", firefoxBrowserInfo.get(BROWSER));
    assertEquals(2L, firefoxBrowserInfo.get(COUNT));
  }

  @Test
  public void shouldBeAbleToGroupPlatforms() {
    long timestamp = Instant.now().getEpochSecond();

    ImmutableCapabilities chromeMacCaps = new ImmutableCapabilities(
      BROWSERNAME, CHROME,
      PLATFORM, "mac",
      VERSION, "87");
    NewSessionPayload chromeMacPayload = NewSessionPayload.create(chromeMacCaps);
    HttpRequest chromeMacRequest = createRequest(chromeMacPayload, POST, URI);
    chromeMacRequest.addHeader(SESSIONREQUEST_TIMESTAMP_HEADER, Long.toString(timestamp));
    RequestId chromeMacRequestId = new RequestId(UUID.randomUUID());

    ImmutableCapabilities chromeWindowsCaps = new ImmutableCapabilities(
      BROWSERNAME, CHROME,
      PLATFORM, "windows",
      VERSION, "87");
    NewSessionPayload chromeWindowsPayload = NewSessionPayload.create(chromeWindowsCaps);
    HttpRequest chromeWindowsRequest = createRequest(chromeWindowsPayload, POST, URI);
    chromeWindowsRequest.addHeader(SESSIONREQUEST_TIMESTAMP_HEADER, Long.toString(timestamp));
    RequestId chromeWindowsRequestId = new RequestId(UUID.randomUUID());

    sessionQueue.offerLast(chromeMacRequest, chromeMacRequestId);
    sessionQueue.offerLast(chromeMacRequest, chromeMacRequestId);
    sessionQueue.offerLast(chromeWindowsRequest, chromeWindowsRequestId);
    sessionQueue.offerLast(chromeWindowsRequest, chromeWindowsRequestId);
    sessionQueue.offerLast(chromeWindowsRequest, chromeWindowsRequestId);

    String response = sessionQueue.getQueueInfo();
    assertNotNull(response);

    List<Object> browserList = JSON.toType(response, Json.OBJECT_TYPE);
    assertEquals(1, browserList.size());

    Map<String, Object> chromeBrowserInfo = (Map<String, Object>) browserList.get(0);
    assertEquals(CHROME, chromeBrowserInfo.get(BROWSER));
    assertEquals(5L, chromeBrowserInfo.get(COUNT));

    List<Map<String, Object>> platforms =
      (List<Map<String, Object>>) chromeBrowserInfo.get(PLATFORMS);
    assertEquals(2, platforms.size());

    // HashMap ordering is not guaranteed
    platforms.sort(Comparator.comparing(map -> (String) map.get(PLATFORM),
      Comparator.naturalOrder()));

    Map<String, Object> macPlatform = platforms.get(0);
    assertEquals("MAC", macPlatform.get(PLATFORM));
    assertEquals(2L, macPlatform.get(COUNT));

    Map<String, Object> windowsPlatform = platforms.get(1);
    assertEquals("WINDOWS", windowsPlatform.get(PLATFORM));
    assertEquals(3L, windowsPlatform.get(COUNT));
  }

  @Test
  public void shouldBeAbleToGroupVersions() {
    long timestamp = Instant.now().getEpochSecond();

    ImmutableCapabilities chrome87Caps = new ImmutableCapabilities(
      BROWSERNAME, CHROME,
      PLATFORM, "mac",
      VERSION, "87");
    NewSessionPayload chrome87Payload = NewSessionPayload.create(chrome87Caps);
    HttpRequest chrome87Request = createRequest(chrome87Payload, POST, URI);
    chrome87Request.addHeader(SESSIONREQUEST_TIMESTAMP_HEADER, Long.toString(timestamp));
    RequestId chrome87RequestId = new RequestId(UUID.randomUUID());

    ImmutableCapabilities chrome85Caps = new ImmutableCapabilities(
      BROWSERNAME, CHROME,
      PLATFORM, "mac",
      VERSION, "85");
    NewSessionPayload chrome85Payload = NewSessionPayload.create(chrome85Caps);
    HttpRequest chrome85Request = createRequest(chrome85Payload, POST, URI);
    chrome85Request.addHeader(SESSIONREQUEST_TIMESTAMP_HEADER, Long.toString(timestamp));
    RequestId chrome85RequestId = new RequestId(UUID.randomUUID());

    sessionQueue.offerLast(chrome87Request, chrome87RequestId);
    sessionQueue.offerLast(chrome87Request, chrome87RequestId);
    sessionQueue.offerLast(chrome85Request, chrome85RequestId);
    sessionQueue.offerLast(chrome85Request, chrome85RequestId);
    sessionQueue.offerLast(chrome85Request, chrome85RequestId);

    String response = sessionQueue.getQueueInfo();
    assertNotNull(response);

    List<Object> browserList = JSON.toType(response, Json.OBJECT_TYPE);
    assertEquals(1, browserList.size());

    Map<String, Object> chromeBrowserInfo = (Map<String, Object>) browserList.get(0);

    List<Map<String, Object>> platforms =
      (List<Map<String, Object>>) chromeBrowserInfo.get(PLATFORMS);

    Map<String, Object> platform = platforms.get(0);
    assertEquals("MAC", platform.get(PLATFORM));

    List<Map<String, Object>> versions = (List<Map<String, Object>>) platform.get(VERSIONS);
    assertEquals(2, versions.size());

    // HashMap ordering is not guaranteed
    versions.sort(Comparator.comparing(map -> (String) map.get(VERSION),
      Comparator.naturalOrder()));

    Map<String, Object> version85 = versions.get(0);
    assertEquals("85", version85.get(VERSION));
    assertEquals(3L, version85.get(COUNT));

    Map<String, Object> version87 = versions.get(1);
    assertEquals("87", version87.get(VERSION));
    assertEquals(2L, version87.get(COUNT));
  }

  private HttpRequest createRequest(NewSessionPayload payload, HttpMethod httpMethod, String uri) {
    StringBuilder builder = new StringBuilder();
    try {
      payload.writeTo(builder);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }

    HttpRequest request = new HttpRequest(httpMethod, uri);
    request.setContent(utf8String(builder.toString()));

    return request;
  }
}
