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

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;

import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.entity.StringEntity;
import org.apache.http.message.BasicHttpEntityEnclosingRequest;
import org.apache.http.message.BasicHttpRequest;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.internal.HttpClientFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class StatusServletTests {

  private Hub hub;

  private RemoteProxy p1;
  private HttpClientFactory httpClientFactory;

  private URL proxyApi;
  private URL hubApi;
  private URL testSessionApi;
  private HttpHost host;
  private TestSession session;

  @Before
  public void setup() throws Exception {
    GridHubConfiguration c = new GridHubConfiguration();
    c.timeout = 12345;
    c.port = PortProber.findFreePort();
    c.host = "localhost";
    hub = new Hub(c);
    Registry registry = hub.getRegistry();
    httpClientFactory = new HttpClientFactory();
    hubApi = hub.getUrl("/grid/api/hub");
    proxyApi = hub.getUrl("/grid/api/proxy");
    testSessionApi = hub.getUrl("/grid/api/testsession");

    host = new HttpHost(hub.getConfiguration().host, hub.getConfiguration().port);

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
    HttpClient client = httpClientFactory.getHttpClient();

    BasicHttpRequest r = new BasicHttpRequest("GET", proxyApi.toExternalForm() + "?id=" + id);

    HttpResponse response = client.execute(host, r);
    assertEquals(200, response.getStatusLine().getStatusCode());
    JsonObject o = extractObject(response);
    assertEquals(id, o.get("id").getAsString());
  }

  @Test
  public void testGetNegative() throws IOException {
    String id = "http://wrongOne:4444";
    HttpClient client = httpClientFactory.getHttpClient();

    BasicHttpRequest r = new BasicHttpRequest("GET", proxyApi.toExternalForm() + "?id=" + id);

    HttpResponse response = client.execute(host, r);
    assertEquals(200, response.getStatusLine().getStatusCode());
    JsonObject o = extractObject(response);

    assertEquals(false, o.get("success").getAsBoolean());
    // System.out.println(o.get("msg"));
  }

  @Test
  public void testPost() throws IOException {
    String id = "http://machine1:4444";
    HttpClient client = httpClientFactory.getHttpClient();

    JsonObject o = new JsonObject();
    o.addProperty("id", id);

    BasicHttpEntityEnclosingRequest r =
        new BasicHttpEntityEnclosingRequest("POST", proxyApi.toExternalForm());
    r.setEntity(new StringEntity(o.toString()));

    HttpResponse response = client.execute(host, r);
    assertEquals(200, response.getStatusLine().getStatusCode());
    JsonObject res = extractObject(response);
    assertEquals(id, res.get("id").getAsString());

  }

  @Test
  public void testPostReflection() throws IOException {
    String id = "http://machine5:4444";
    HttpClient client = httpClientFactory.getHttpClient();

    JsonObject o = new JsonObject();
    o.addProperty("id", id);
    o.addProperty("getURL", "");
    o.addProperty("getBoolean", "");
    o.addProperty("getString", "");

    BasicHttpEntityEnclosingRequest r =
        new BasicHttpEntityEnclosingRequest("POST", proxyApi.toExternalForm());
    r.setEntity(new StringEntity(o.toString()));

    HttpResponse response = client.execute(host, r);
    assertEquals(200, response.getStatusLine().getStatusCode());
    JsonObject res = extractObject(response);

    assertEquals(MyCustomProxy.MY_BOOLEAN, res.get("getBoolean").getAsBoolean());
    assertEquals(MyCustomProxy.MY_STRING, res.get("getString").getAsString());
    // url converted to string
    assertEquals(MyCustomProxy.MY_URL.toString(), res.get("getURL").getAsString());
  }

  @Test
  public void testSessionApi() throws IOException {
    ExternalSessionKey s = session.getExternalKey();
    HttpClient client = httpClientFactory.getHttpClient();

    JsonObject o = new JsonObject();
    o.addProperty("session", s.toString());
    BasicHttpEntityEnclosingRequest r =
        new BasicHttpEntityEnclosingRequest("POST", testSessionApi.toExternalForm());
    r.setEntity(new StringEntity(o.toString()));

    HttpResponse response = client.execute(host, r);
    assertEquals(200, response.getStatusLine().getStatusCode());
    JsonObject res = extractObject(response);

    assertTrue(res.get("success").getAsBoolean());

    assertNotNull(res.get("internalKey"));
    assertEquals(s, ExternalSessionKey.fromJSON(res.get("session").getAsString()));
    assertNotNull(res.get("inactivityTime"));
    assertEquals(p1.getId(), res.get("proxyId").getAsString());
  }

  @Test
  public void testSessionGet() throws IOException {
    ExternalSessionKey s = session.getExternalKey();

    HttpClient client = httpClientFactory.getHttpClient();

    String url =
        testSessionApi.toExternalForm() + "?session=" + URLEncoder.encode(s.getKey(), "UTF-8");
    BasicHttpRequest r = new BasicHttpRequest("GET", url);

    HttpResponse response = client.execute(host, r);
    assertEquals(200, response.getStatusLine().getStatusCode());
    JsonObject o = extractObject(response);

    assertTrue(o.get("success").getAsBoolean());

    assertNotNull(o.get("internalKey"));
    assertEquals(s, ExternalSessionKey.fromJSON(o.get("session").getAsString()));
    assertNotNull(o.get("inactivityTime"));
    assertEquals(p1.getId(), o.get("proxyId").getAsString());

  }


  /**
   * if a certain set of parameters are requested to the hub, only those params are returned.
   * @throws IOException
   */
  @Test
  public void testHubGetSpecifiedConfig() throws IOException {

    HttpClient client = httpClientFactory.getHttpClient();

    String url = hubApi.toExternalForm();
    BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest("GET", url);

    JsonObject j = new JsonObject();

    JsonArray keys = new JsonArray();
    keys.add(new JsonPrimitive("timeout"));
    keys.add(new JsonPrimitive("I'm not a valid key"));
    keys.add(new JsonPrimitive("servlets"));

    j.add("configuration", keys);
    r.setEntity(new StringEntity(j.toString()));

    HttpResponse response = client.execute(host, r);
    assertEquals(200, response.getStatusLine().getStatusCode());
    JsonObject o = extractObject(response);

    assertTrue(o.get("success").getAsBoolean());
    assertEquals(12345, o.get("timeout").getAsInt());
    assertNull(o.get("I'm not a valid key"));
    assertTrue(o.getAsJsonArray("servlets").size() == 0);
    assertFalse(o.has("capabilityMatcher"));
  }

  /**
   * if a certain set of parameters are requested to the hub, only those params are returned.
   * @throws IOException
   */
  @Test
  public void testHubGetSpecifiedConfigWithQueryString() throws IOException {

    HttpClient client = httpClientFactory.getHttpClient();

    ArrayList<String> keys = new ArrayList<>();
    keys.add(URLEncoder.encode("timeout", "UTF-8"));
    keys.add(URLEncoder.encode("I'm not a valid key", "UTF-8"));
    keys.add(URLEncoder.encode("servlets", "UTF-8"));

    String query = "?configuration=" + String.join(",",keys);
    String url = hubApi.toExternalForm() + query ;
    BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest("GET", url);

    HttpResponse response = client.execute(host, r);
    assertEquals(200, response.getStatusLine().getStatusCode());
    JsonObject o = extractObject(response);

    assertTrue(o.get("success").getAsBoolean());
    assertEquals(12345, o.get("timeout").getAsInt());
    assertNull(o.get("I'm not a valid key"));
    assertTrue(o.getAsJsonArray("servlets").size() == 0);
    assertFalse(o.has("capabilityMatcher"));
  }

  /**
   * when no param is specified, a call to the hub API returns all the config params the hub
   * currently uses.
   */
  @Test
  public void testHubGetAllConfig() throws IOException {

    HttpClient client = httpClientFactory.getHttpClient();

    String url = hubApi.toExternalForm();
    BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest("GET", url);

    JsonObject j = new JsonObject();
    JsonArray keys = new JsonArray();

    j.add("configuration", keys);
    r.setEntity(new StringEntity(j.toString()));

    HttpResponse response = client.execute(host, r);
    assertEquals(200, response.getStatusLine().getStatusCode());
    JsonObject o = extractObject(response);

    assertTrue(o.get("success").getAsBoolean());
    assertEquals("org.openqa.grid.internal.utils.DefaultCapabilityMatcher",
                 o.get("capabilityMatcher").getAsString());
    assertNull(o.get("prioritizer"));
  }

  @Test
  public void testHubGetAllConfigNoParamsWhenNoPostBody() throws IOException {

    HttpClient client = httpClientFactory.getHttpClient();

    String url = hubApi.toExternalForm();
    BasicHttpRequest r = new BasicHttpRequest("GET", url);

    HttpResponse response = client.execute(host, r);
    assertEquals(200, response.getStatusLine().getStatusCode());
    JsonObject o = extractObject(response);

    assertTrue(o.get("success").getAsBoolean());
    assertEquals("org.openqa.grid.internal.utils.DefaultCapabilityMatcher",
                 o.get("capabilityMatcher").getAsString());
    assertNull(o.get("prioritizer"));
  }

  @Test
  public void testHubGetNewSessionRequestCount() throws IOException {
    HttpClient client = httpClientFactory.getHttpClient();

    String url = hubApi.toExternalForm();
    BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest("GET", url);

    JsonObject j = new JsonObject();

    JsonArray keys = new JsonArray();
    keys.add(new JsonPrimitive("newSessionRequestCount"));

    j.add("configuration", keys);
    r.setEntity(new StringEntity(j.toString()));

    HttpResponse response = client.execute(host, r);
    assertEquals(200, response.getStatusLine().getStatusCode());
    JsonObject o = extractObject(response);

    assertTrue(o.get("success").getAsBoolean());
    assertEquals(0, o.get("newSessionRequestCount").getAsInt());
  }

  @Test
  public void testHubGetSlotCounts() throws IOException {
    HttpClient client = httpClientFactory.getHttpClient();

    String url = hubApi.toExternalForm();
    BasicHttpEntityEnclosingRequest r = new BasicHttpEntityEnclosingRequest("GET", url);

    JsonObject j = new JsonObject();

    JsonArray keys = new JsonArray();
    keys.add(new JsonPrimitive("slotCounts"));

    j.add("configuration", keys);
    r.setEntity(new StringEntity(j.toString()));

    HttpResponse response = client.execute(host, r);
    assertEquals(200, response.getStatusLine().getStatusCode());
    JsonObject o = extractObject(response);

    assertTrue(o.get("success").getAsBoolean());

    assertNotNull(o.get("slotCounts"));
    JsonObject slotCounts = o.get("slotCounts").getAsJsonObject();
    assertEquals(4, slotCounts.get("free").getAsInt());
    assertEquals(5, slotCounts.get("total").getAsInt());
  }

  @Test
  public void testSessionApiNeg() throws IOException {
    String s = "non-existing session";
    HttpClient client = httpClientFactory.getHttpClient();

    JsonObject o = new JsonObject();
    o.addProperty("session", s);
    BasicHttpEntityEnclosingRequest r =
        new BasicHttpEntityEnclosingRequest("POST", testSessionApi.toExternalForm());
    r.setEntity(new StringEntity(o.toString()));

    HttpResponse response = client.execute(host, r);
    assertEquals(200, response.getStatusLine().getStatusCode());
    JsonObject res = extractObject(response);

    assertFalse(res.get("success").getAsBoolean());

  }

  @After
  public void teardown() throws Exception {
    hub.stop();
    httpClientFactory.close();
  }

  private JsonObject extractObject(HttpResponse resp) throws IOException {
    BufferedReader rd = new BufferedReader(new InputStreamReader(resp.getEntity().getContent()));
    StringBuilder s = new StringBuilder();
    String line;
    while ((line = rd.readLine()) != null) {
      s.append(line);
    }
    rd.close();

    return new JsonParser().parse(s.toString()).getAsJsonObject();
  }

}
