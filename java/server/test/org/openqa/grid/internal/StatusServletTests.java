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

package org.openqa.grid.internal;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class StatusServletTests {

  private Hub hub;

  private RemoteProxy p1;

  private URL proxyApi;
  private URL hubApi;
  private URL testSessionApi;
  private TestSession session;
  private HttpClient client;

  @Before
  public void setup() throws Exception {
    GridHubConfiguration c = new GridHubConfiguration();
    c.timeout = 12345;
    c.port = PortProber.findFreePort();
    c.host = "localhost";

    hub = new Hub(c);
    GridRegistry registry = hub.getRegistry();
    client = HttpClient.Factory.createDefault().createClient(hub.getUrl());
    hubApi = hub.getUrl("/grid/api/hub");
    proxyApi = hub.getUrl("/grid/api/proxy");
    testSessionApi = hub.getUrl("/grid/api/testsession");

    hub.start();

    p1 = RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine1:4444", registry);
    RemoteProxy p2 =
        RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine2:4444", registry);
    RemoteProxy p3 =
        RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine3:4444", registry);
    RemoteProxy p4 =
        RemoteProxyFactory.getNewBasicRemoteProxy("app1", "http://machine4:4444", registry);

    RegistrationRequest req = new RegistrationRequest();
    req.getConfiguration().capabilities.clear();
    Map<String, Object> capability = new HashMap<>();
    capability.put(CapabilityType.BROWSER_NAME, "custom app");
    req.getConfiguration().capabilities.add(new DesiredCapabilities(capability));
    req.getConfiguration().host = "machine5";
    req.getConfiguration().port = 4444;

    RemoteProxy customProxy = new MyCustomProxy(req, registry);

    registry.add(p1);
    registry.add(p2);
    registry.add(p3);
    registry.add(p4);
    registry.add(customProxy);

    Map<String, Object> cap = new HashMap<>();
    cap.put(CapabilityType.BROWSER_NAME, "app1");

    RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, cap);
    newSessionRequest.process();
    session = newSessionRequest.getSession();
    session.setExternalKey(ExternalSessionKey.fromString("ext. key"));
  }

  @Test
  public void testGet() throws IOException {
    String id = "http://machine1:4444";

    HttpRequest request = new HttpRequest(GET, proxyApi.toExternalForm() + "?id=" + id);

    HttpResponse response = client.execute(request);
    assertEquals(200, response.getStatus());
    Map<String, Object> o = extractObject(response);
    assertEquals(id, o.get("id"));
  }

  @Test
  public void testGetNegative() throws IOException {
    String id = "http://wrongOne:4444";

    HttpRequest r = new HttpRequest(GET, proxyApi.toExternalForm() + "?id=" + id);

    HttpResponse response = client.execute(r);
    assertEquals(200, response.getStatus());
    Map<String, Object> o = extractObject(response);

    assertEquals(false, o.get("success"));
  }

  @Test
  public void testPost() throws IOException {
    String id = "http://machine1:4444";

    Map<String, Object> o = ImmutableMap.of("id", id);

    HttpRequest r = new HttpRequest(POST, proxyApi.toExternalForm());
    r.setContent(utf8String(new Json().toJson(o)));

    HttpResponse response = client.execute(r);
    assertEquals(200, response.getStatus());
    Map<String, Object> res = extractObject(response);
    assertEquals(id, res.get("id"));
  }

  @Test
  public void testPostReflection() throws IOException {
    String id = "http://machine5:4444";

    Map<String, Object> o = ImmutableMap.of(
        "id", id,
        "getURL", "",
        "getBoolean", "",
        "getString", "");

    HttpRequest r = new HttpRequest(POST, proxyApi.toExternalForm());
    r.setContent(utf8String(new Json().toJson(o)));

    HttpResponse response = client.execute(r);
    assertEquals(200, response.getStatus());
    Map<String, Object> res = extractObject(response);

    assertEquals(MyCustomProxy.MY_BOOLEAN, res.get("getBoolean"));
    assertEquals(MyCustomProxy.MY_STRING, res.get("getString"));
    // url converted to string
    assertEquals(MyCustomProxy.MY_URL.toString(), res.get("getURL"));
  }

  @Test
  public void testSessionApi() throws IOException {
    ExternalSessionKey s = session.getExternalKey();

    Map<String, Object> o = ImmutableMap.of("session", s.toString());
    HttpRequest r = new HttpRequest(POST, testSessionApi.toExternalForm());
    r.setContent(utf8String(new Json().toJson(o)));

    HttpResponse response = client.execute(r);
    assertEquals(200, response.getStatus());
    Map<String, Object> res = extractObject(response);

    assertTrue((boolean) res.get("success"));

    assertNotNull(res.get("internalKey"));
    assertEquals(s, ExternalSessionKey.fromJSON((String) res.get("session")));
    assertNotNull(res.get("inactivityTime"));
    assertEquals(p1.getId(), res.get("proxyId"));
  }

  @Test
  public void testSessionGet() throws IOException {
    ExternalSessionKey s = session.getExternalKey();

    String url =
        testSessionApi.toExternalForm() + "?session=" + URLEncoder.encode(s.getKey(), "UTF-8");
    HttpRequest r = new HttpRequest(GET, url);

    HttpResponse response = client.execute(r);
    assertEquals(200, response.getStatus());
    Map<String, Object> o = extractObject(response);

    assertTrue((boolean) o.get("success"));

    assertNotNull(o.get("internalKey"));
    assertEquals(s, ExternalSessionKey.fromJSON((String) o.get("session")));
    assertNotNull(o.get("inactivityTime"));
    assertEquals(p1.getId(), o.get("proxyId"));
  }


  /**
   * if a certain set of parameters are requested to the hub, only those params are returned.
   */
  @Test
  public void testHubGetSpecifiedConfig() throws IOException {
    String url = hubApi.toExternalForm();
    HttpRequest r = new HttpRequest(POST, url);

    Map<String, Object> j = ImmutableMap.of(
        "configuration", ImmutableList.of(
            "timeout",
            "I'm not a valid key",
            "servlets"));

    r.setContent(utf8String(new Json().toJson(j)));

    HttpResponse response = client.execute(r);
    assertEquals(200, response.getStatus());
    Map<String, Object> o = extractObject(response);

    assertTrue((Boolean) o.get("success"));
    assertEquals(12345L, o.get("timeout"));
    assertNull(o.get("I'm not a valid key"));
    assertEquals(0, ((Collection) o.get("servlets")).size());
    assertNull(o.get("capabilityMatcher"));
  }

  /**
   * if a certain set of parameters are requested to the hub, only those params are returned.
   */
  @Test
  public void testHubGetSpecifiedConfigWithQueryString() throws IOException {
    List<String> keys = new ArrayList<>();
    keys.add(URLEncoder.encode("timeout", "UTF-8"));
    keys.add(URLEncoder.encode("I'm not a valid key", "UTF-8"));
    keys.add(URLEncoder.encode("servlets", "UTF-8"));

    String query = "?configuration=" + String.join(",",keys);
    String url = hubApi.toExternalForm() + query ;
    HttpRequest r = new HttpRequest(GET, url);

    HttpResponse response = client.execute(r);
    assertEquals(200, response.getStatus());
    Map<String, Object> o = extractObject(response);

    assertTrue((Boolean) o.get("success"));
    assertEquals(12345L, o.get("timeout"));
    assertNull(o.get("I'm not a valid key"));
    assertEquals(0, ((Collection<?>) o.get("servlets")).size());
    assertFalse(o.containsKey("capabilityMatcher"));
  }

  /**
   * when no param is specified, a call to the hub API returns all the config params the hub
   * currently uses.
   */
  @Test
  public void testHubGetAllConfig() throws IOException {
    String url = hubApi.toExternalForm();
    HttpRequest r = new HttpRequest(GET, url);

    Map<String, Object> j = ImmutableMap.of("configuration", ImmutableList.of());

    r.setContent(utf8String(new Json().toJson(j)));

    HttpResponse response = client.execute(r);
    assertEquals(200, response.getStatus());
    Map<String, Object> o = extractObject(response);

    assertTrue((boolean) o.get("success"));
    assertEquals("org.openqa.grid.internal.utils.DefaultCapabilityMatcher",
                 o.get("capabilityMatcher"));
    assertNull(o.get("prioritizer"));
  }

  @Test
  public void testHubGetAllConfigNoParamsWhenNoPostBody() throws IOException {
    String url = hubApi.toExternalForm();
    HttpRequest r = new HttpRequest(GET, url);

    HttpResponse response = client.execute(r);
    assertEquals(200, response.getStatus());
    Map<String, Object> o = extractObject(response);

    assertTrue((Boolean) o.get("success"));
    assertEquals("org.openqa.grid.internal.utils.DefaultCapabilityMatcher",
                 o.get("capabilityMatcher"));
    assertNull(o.get("prioritizer"));
  }

  @Test
  public void testHubGetNewSessionRequestCount() throws IOException {
    String url = hubApi.toExternalForm();
    HttpRequest r = new HttpRequest(GET, url);

    Map<String, Object> j = ImmutableMap.of(
        "configuration", ImmutableList.of("newSessionRequestCount"));

    r.setContent(utf8String(new Json().toJson(j)));

    HttpResponse response = client.execute(r);
    assertEquals(200, response.getStatus());
    Map<String, Object> o = extractObject(response);

    assertTrue((Boolean) o.get("success"));
    assertEquals(0L, o.get("newSessionRequestCount"));
  }

  @Test
  public void testHubGetSlotCounts() throws IOException {
    String url = hubApi.toExternalForm();
    HttpRequest r = new HttpRequest(POST, url);

    Map<String, Object> j = ImmutableMap.of("configuration", ImmutableList.of("slotCounts"));

    r.setContent(utf8String(new Json().toJson(j)));

    HttpResponse response = client.execute(r);
    assertEquals(200, response.getStatus());
    Map<String, Object> o = extractObject(response);

    assertTrue((Boolean) o.get("success"));

    assertNotNull(o.get("slotCounts"));
    Map<?, ?> slotCounts = (Map<?, ?>) o.get("slotCounts");
    assertEquals(4L, slotCounts.get("free"));
    assertEquals(5L, slotCounts.get("total"));
  }

  @Test
  public void testSessionApiNeg() throws IOException {
    String s = "non-existing session";

    Map<String, Object> o = ImmutableMap.of("session", s);
    HttpRequest r = new HttpRequest(POST, testSessionApi.toExternalForm());
    r.setContent(utf8String(new Json().toJson(o)));

    HttpResponse response = client.execute(r);
    assertEquals(200, response.getStatus());
    Map<String, Object> res = extractObject(response);

    assertFalse((boolean) res.get("success"));
  }

  @After
  public void teardown() {
    hub.stop();
  }

  private Map<String, Object> extractObject(HttpResponse resp) {
    return new Json().toType(string(resp), MAP_TYPE);
  }

}
