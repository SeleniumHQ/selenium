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

package org.openqa.grid.e2e.misc;

import static org.junit.Assert.assertEquals;

import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.remote.internal.HttpClientFactory;
import org.openqa.selenium.remote.server.SeleniumServer;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;

public class Grid1HeartbeatTest {

  private static Hub hub;

  @BeforeClass
  public static void setup() throws Exception {
    hub = GridTestHelper.getHub();
  }

  @Test
  public void testIsNotRegistered() throws Exception {
    // Send the heartbeat request when we know that there are no nodes
    // registered with the hub.
    URL heartbeatUrl =
        new URL(String.format("http://%s:%s/heartbeat?host=localhost&port=5000", hub.getConfiguration().host,
            hub.getConfiguration().port));

    HttpRequest request = new HttpGet(heartbeatUrl.toString());

    HttpClientFactory httpClientFactory = new HttpClientFactory();
    try {
      HttpClient client = httpClientFactory.getHttpClient();
      HttpHost host = new HttpHost(hub.getConfiguration().host, hub.getConfiguration().port);
      HttpResponse response = client.execute(host, request);

      BufferedReader body =
          new BufferedReader(new InputStreamReader(response.getEntity().getContent()));

      assertEquals(response.getStatusLine().getStatusCode(), 200);
      assertEquals(body.readLine(), "Hub : Not Registered");
    } finally {
      httpClientFactory.close();
    }
  }

  @Test
  public void testIsRegistered() throws Exception {
    // register a selenium 1
    SelfRegisteringRemote selenium1 =
        GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
    selenium1.addBrowser(GridTestHelper.getDefaultBrowserCapability(), 1);

    selenium1.setRemoteServer(new SeleniumServer(selenium1.getConfiguration()));
    selenium1.startRemoteServer();
    selenium1.sendRegistrationRequest();

    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);

    // Check that the node is registered with the hub.
    URL heartbeatUrl =
        new URL(String.format("http://%s:%s/heartbeat?host=%s&port=%s", hub.getConfiguration().host, hub
            .getConfiguration().port, selenium1.getConfiguration().host, selenium1
            .getConfiguration().port));

    HttpRequest request = new HttpGet(heartbeatUrl.toString());

    HttpClientFactory httpClientFactory = new HttpClientFactory();

    HttpClient client = httpClientFactory.getHttpClient();
    try {
      HttpHost host = new HttpHost(hub.getConfiguration().host, hub.getConfiguration().port);
      HttpResponse response = client.execute(host, request);

      BufferedReader body =
          new BufferedReader(new InputStreamReader(response.getEntity().getContent()));

      assertEquals(response.getStatusLine().getStatusCode(), 200);
      assertEquals(body.readLine(), "Hub : OK");
    } finally {
      httpClientFactory.close();
    }
  }

  @AfterClass
  public static void teardown() throws Exception {
    hub.stop();
  }
}
