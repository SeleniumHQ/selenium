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
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import com.google.common.collect.ImmutableMap;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import com.beust.jcommander.JCommander;

import org.junit.Test;
import org.openqa.grid.common.exception.GridConfigurationException;
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
    assertEquals("node", gnc.role);
    assertEquals(5000, gnc.nodeStatusCheckTimeout.intValue());
    assertTrue(gnc.capabilities.isEmpty());
    assertNull(gnc.id);
    assertNull(gnc.downPollingLimit);
    assertNull(gnc.hub);
    assertNull(gnc.hubHost);
    assertNull(gnc.hubPort);
    assertNull(gnc.nodeConfigFile);
    assertNull(gnc.nodePolling);
    assertNull(gnc.proxy);
    assertNull(gnc.register);
    assertEquals(5000, gnc.registerCycle.intValue());
    assertNull(gnc.unregisterIfStillDownAfter);

    //not a @Parameter
    assertNull(gnc.remoteHost);
  }

  @Test
  public void testAsJson() {
    final String[] args = new String[] { "-capabilities", "browserName=chrome,platform=linux" };
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    new JCommander(gnc, args);

    assertEquals("{\"capabilities\":[{\"browserName\":\"chrome\",\"platform\":\"LINUX\"}],"
               + "\"nodeStatusCheckTimeout\":5000,"
               + "\"registerCycle\":5000,"
               + "\"custom\":{},"
               + "\"maxSession\":1,"
               + "\"debug\":false,"
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
    gnc.getHubHost();
  }

  @Test(expected = RuntimeException.class)
  public void testGetHubPort_forNullConfig() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
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
