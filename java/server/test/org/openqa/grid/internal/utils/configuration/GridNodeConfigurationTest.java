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

package org.openqa.grid.internal.utils.configuration;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertFalse;

import com.google.common.collect.ImmutableMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import com.beust.jcommander.JCommander;

import org.junit.Test;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.Arrays;

public class GridNodeConfigurationTest {

  @Test
  public void testLoadFromJson() {
    final String configJson = "{"
                              + "\"capabilities\":"
                              + " ["
                              + "   {"
                              + "    \"browserName\": \"firefox\","
                              + "    \"maxInstances\": 5,"
                              + "    \"javascriptEnabled\": true"
                              + "   }"
                              + " ],"
                              + "\"host\": \"dummyhost\","
                              + "\"maxSession\": 5,"
                              + "\"port\": 1234"
                              + "}";

    JsonObject json = new JsonParser().parse(configJson).getAsJsonObject();
    GridNodeConfiguration gnc = GridNodeConfiguration.loadFromJSON(json);

    assertEquals("node", gnc.role);
    assertEquals(1234, gnc.port.intValue());
    assertEquals(5, gnc.maxSession.intValue());
    assertEquals("dummyhost", gnc.host);
    assertTrue(gnc.capabilities.size() == 1);
    assertEquals("firefox", gnc.capabilities.get(0).getBrowserName());
    assertEquals(5L, gnc.capabilities.get(0).getCapability("maxInstances"));
  }

  @Test(expected = GridConfigurationException.class)
  public void testLoadFromOldJson() {
    final String configJson = "{"
                            + "\"configuration\":"
                            + " {"
                            + "\"host\": \"dummyhost\","
                            + "\"maxSession\": 5,"
                            + "\"port\": 1234"
                            + " }"
                            + "}";
    JsonObject json = new JsonParser().parse(configJson).getAsJsonObject();
    GridNodeConfiguration.loadFromJSON(json);
  }

  @Test
  public void testDefaults() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    assertEquals(GridNodeConfiguration.DEFAULT_ROLE, gnc.role);
    assertEquals(GridNodeConfiguration.DEFAULT_PORT, gnc.port);
    assertEquals(GridNodeConfiguration.DEFAULT_NODE_STATUS_CHECK_TIMEOUT, gnc.nodeStatusCheckTimeout);
    assertEquals(GridNodeConfiguration.DEFAULT_POLLING_INTERVAL, gnc.nodePolling);
    assertEquals(GridNodeConfiguration.DEFAULT_PROXY, gnc.proxy);
    assertEquals(GridNodeConfiguration.DEFAULT_REGISTER_TOGGLE, gnc.register);
    assertEquals(GridNodeConfiguration.DEFAULT_REGISTER_CYCLE, gnc.registerCycle);
    assertEquals(GridNodeConfiguration.DEFAULT_HUB, gnc.hub);
    assertEquals(GridNodeConfiguration.DEFAULT_MAX_SESSION, gnc.maxSession);
    assertFalse(gnc.capabilities.isEmpty());
    assertEquals(3, gnc.capabilities.size());
    assertNull(gnc.id);
    assertEquals(GridNodeConfiguration.DEFAULT_DOWN_POLLING_LIMIT, gnc.downPollingLimit);
    assertNull(gnc.hubHost);
    assertNull(gnc.hubPort);
    assertNull(gnc.nodeConfigFile);
    assertEquals(GridNodeConfiguration.DEFAULT_UNREGISTER_DELAY, gnc.unregisterIfStillDownAfter);

    assertNull(gnc.cleanUpCycle);
    assertNull(gnc.host);
    assertNotNull(gnc.custom);
    assertTrue(gnc.custom.isEmpty());
    assertNotNull(gnc.servlets);
    assertTrue(gnc.servlets.isEmpty());
    assertNotNull(gnc.withoutServlets);
    assertTrue(gnc.withoutServlets.isEmpty());

    assertEquals(GridNodeConfiguration.DEFAULT_TIMEOUT, gnc.timeout);
    assertEquals(GridNodeConfiguration.DEFAULT_BROWSER_TIMEOUT, gnc.browserTimeout);
    assertFalse(gnc.debug);
    assertFalse(gnc.help);
    assertNull(gnc.jettyMaxThreads);
    assertNull(gnc.log);

    //not a @Parameter
    assertNull(gnc.remoteHost);
  }

  @Test
  public void testConstructorEqualsDefaultConfig() {
    GridNodeConfiguration actual = new GridNodeConfiguration();
    GridNodeConfiguration expected =
      GridNodeConfiguration.loadFromJSON(GridNodeConfiguration.DEFAULT_NODE_CONFIG_FILE);

    assertEquals(expected.role, actual.role);
    assertEquals(expected.port, actual.port);
    assertEquals(expected.capabilities.size(), actual.capabilities.size());

    assertEquals(expected.nodeStatusCheckTimeout, actual.nodeStatusCheckTimeout);
    assertEquals(expected.nodePolling, actual.nodePolling);
    assertEquals(expected.proxy, actual.proxy);
    assertEquals(expected.register, actual.register);
    assertEquals(expected.registerCycle, actual.registerCycle);
    assertEquals(expected.hub, actual.hub);

    assertEquals(expected.id, actual.id);
    assertEquals(expected.downPollingLimit, actual.downPollingLimit);
    assertEquals(expected.hubPort, actual.hubPort);
    assertEquals(expected.hubHost, actual.hubHost);
    assertEquals(expected.nodeConfigFile, actual.nodeConfigFile);
    assertEquals(expected.unregisterIfStillDownAfter, actual.unregisterIfStillDownAfter);


    assertEquals(expected.cleanUpCycle, actual.cleanUpCycle);
    assertEquals(expected.host, actual.host);
    assertEquals(expected.maxSession, actual.maxSession);
    assertEquals(expected.custom.size(), actual.custom.size());
    assertEquals(expected.servlets.size(), actual.servlets.size());
    assertEquals(expected.withoutServlets.size(), actual.withoutServlets.size());
    assertEquals(expected.timeout, actual.timeout);
    assertEquals(expected.browserTimeout, actual.browserTimeout);
    assertEquals(expected.debug, actual.debug);
    assertEquals(expected.help, actual.help);
    assertEquals(expected.jettyMaxThreads, actual.jettyMaxThreads);
    assertEquals(expected.log, actual.log);
  }

  @Test
  public void testAsJson() {
    final String[] args = new String[] { "-capabilities", "browserName=chrome,platform=linux" };
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    new JCommander(gnc, args);

    assertEquals("{\"capabilities\":"
                 + "[{\"browserName\":\"chrome\",\"platform\":\"LINUX\"}],"
                 + "\"downPollingLimit\":2,"
                 + "\"hub\":\"http://localhost:4444\","
                 + "\"nodePolling\":5000,"
                 + "\"nodeStatusCheckTimeout\":5000,"
                 + "\"proxy\":\"org.openqa.grid.selenium.proxy.DefaultRemoteProxy\","
                 + "\"register\":true,"
                 + "\"registerCycle\":5000,"
                 + "\"unregisterIfStillDownAfter\":60000,"
                 + "\"custom\":{},"
                 + "\"maxSession\":5,"
                 + "\"servlets\":[],"
                 + "\"withoutServlets\":[],"
                 + "\"browserTimeout\":0,"
                 + "\"debug\":false,"
                 + "\"port\":5555,"
                 + "\"role\":\"node\","
                 + "\"timeout\":1800}", gnc.toJson().toString());
  }

  @Test
  public void testWithCapabilitiesArgs() {
    final String[] args = new String[] { "-capabilities",
                                       "browserName=chrome,platform=linux,maxInstances=10,boolean=false" };
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    new JCommander(gnc, args);
    assertTrue(gnc.capabilities.size() == 1);
    assertEquals("chrome", gnc.capabilities.get(0).getBrowserName());
    assertEquals(10L, gnc.capabilities.get(0).getCapability("maxInstances"));
    assertEquals(false, gnc.capabilities.get(0).getCapability("boolean"));
    assertEquals(Platform.LINUX, gnc.capabilities.get(0).getPlatform());
  }

  @Test
  public void testWithCapabilitiesArgsWithExtraSpacing() {
    final String[] args = new String[] { "-capabilities",
                                         "browserName= chrome, platform =linux, maxInstances=10, boolean = false " };
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    new JCommander(gnc, args);
    assertTrue(gnc.capabilities.size() == 1);
    assertEquals("chrome", gnc.capabilities.get(0).getBrowserName());
    assertEquals(10L, gnc.capabilities.get(0).getCapability("maxInstances"));
    assertEquals(false, gnc.capabilities.get(0).getCapability("boolean"));
    assertEquals(Platform.LINUX, gnc.capabilities.get(0).getPlatform());
  }

  @Test
  public void testGetHubHost() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    gnc.hub = "http://dummyhost:4444/wd/hub";
    assertEquals("dummyhost", gnc.getHubHost());
  }

  @Test
  public void testGetHubPort() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    gnc.hub = "http://dummyhost:4444/wd/hub";
    assertEquals(4444, gnc.getHubPort().intValue());
  }

  @Test
  public void tetGetRemoteHost() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    gnc.host = "dummyhost";
    gnc.port = 1234;
    assertEquals("http://dummyhost:1234", gnc.getRemoteHost());
  }

  @Test(expected = RuntimeException.class)
  public void testGetHubHost_forNullConfig() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    gnc.hub = null;
    gnc.getHubHost();
  }

  @Test(expected = RuntimeException.class)
  public void testGetHubPort_forNullConfig() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    gnc.hub = null;
    gnc.getHubPort();
  }

  @Test
  public void tetGetRemoteHost_forNullConfig() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    assertEquals("http://localhost:5555", gnc.getRemoteHost());
  }

  @Test
  public void testMergeWithRealValues() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    GridNodeConfiguration other = new GridNodeConfiguration();
    other.id = "myid";
    DesiredCapabilities dc =
      new DesiredCapabilities(new ImmutableMap.Builder().put("chrome", "foo").build());
    other.capabilities = Arrays.asList(dc);
    other.downPollingLimit = 50;
    other.hub = "http://dummyhost";
    other.hubHost = "dummyhost";
    other.hubPort = 1234;
    other.nodeConfigFile = "foo.json";
    other.nodePolling = 100;
    other.nodeStatusCheckTimeout = 2000;
    other.proxy = "com.foo.bar.MyProxy";
    other.register = false;
    other.registerCycle = 3000;
    other.unregisterIfStillDownAfter = 4000;
    // is not a @Parameter but is a mergable value
    other.remoteHost = "mylocalhost";
    gnc.merge(other);

    assertSame(other.capabilities, gnc.capabilities);
    assertEquals(other.id, gnc.id);
    assertEquals(other.downPollingLimit, gnc.downPollingLimit);
    assertEquals(other.hub, gnc.hub);
    assertEquals(other.hubHost, gnc.hubHost);
    assertEquals(other.nodePolling, gnc.nodePolling);
    assertEquals(other.nodeStatusCheckTimeout, gnc.nodeStatusCheckTimeout);
    assertEquals(other.proxy, gnc.proxy);
    assertEquals(other.register, gnc.register);
    assertEquals(other.registerCycle, gnc.registerCycle);
    assertEquals(other.unregisterIfStillDownAfter, gnc.unregisterIfStillDownAfter);
    // is not a @Parameter
    assertEquals(other.remoteHost, gnc.remoteHost);
    // is not a merged value
    assertNull(gnc.nodeConfigFile);
  }
}
