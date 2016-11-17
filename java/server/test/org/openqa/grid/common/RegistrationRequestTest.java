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

package org.openqa.grid.common;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertNotSame;

import com.beust.jcommander.JCommander;

import org.junit.Test;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.net.URL;

public class RegistrationRequestTest {

  @Test
  public void getConfigAsTests() throws Exception {
    URL url = new URL("http://a.c:2");

    GridNodeConfiguration config = new GridNodeConfiguration();
    config.cleanUpCycle = 1;
    config.host = url.getHost();
    config.port = url.getPort();

    RegistrationRequest req = new RegistrationRequest(config);

    int c = req.getConfiguration().cleanUpCycle;
    assertTrue(c == 1);

    String url2 = req.getConfiguration().getRemoteHost();
    assertEquals(url2, url.toString());
  }

  @Test
  public void testToJson() {
    RegistrationRequest req =
      new RegistrationRequest(new GridNodeConfiguration(), "Franзois", "a\nb\nc");

    for (int i = 0; i < 5; i++) {
      DesiredCapabilities cap = new DesiredCapabilities(BrowserType.FIREFOX, String.valueOf(i), Platform.LINUX);
      req.getConfiguration().capabilities.add(cap);
    }

    String json = req.toJson().toString();

    RegistrationRequest req2 = RegistrationRequest.fromJson(json);

    assertEquals(req.getName(), req2.getName());
    assertEquals(req.getDescription(), req2.getDescription());

    assertEquals(req.getConfiguration().role, req2.getConfiguration().role);
    assertEquals(req.getConfiguration().capabilities.size(),
                 req2.getConfiguration().capabilities.size());
    assertEquals(req.getConfiguration().capabilities.get(0).getBrowserName(),
                 req2.getConfiguration().capabilities.get(0).getBrowserName());
    assertEquals(req.getConfiguration().capabilities.get(0).getPlatform(),
                 req2.getConfiguration().capabilities.get(0).getPlatform());
  }


  @Test
  public void basicCommandLineParam() {
    GridNodeConfiguration config = new GridNodeConfiguration();
    new JCommander(config, "-role", "wd", "-hubHost", "ABC", "-hubPort", "1234","-host","localhost");
    RegistrationRequest req = RegistrationRequest.build(config);

    assertEquals(GridRole.NODE, GridRole.get(req.getConfiguration().role));
    assertEquals("ABC", req.getConfiguration().getHubHost());
    assertEquals(1234, req.getConfiguration().getHubPort().longValue());

  }

  @Test
  public void commandLineParamDefault() {
    GridNodeConfiguration config = new GridNodeConfiguration();
    new JCommander(config, "-role", "wd");
    RegistrationRequest req = RegistrationRequest.build(config);
    // the hub defaults to current IP.
    assertNotNull(req.getConfiguration().getHubHost());
    assertEquals(4444, req.getConfiguration().getHubPort().longValue());
    // the node defaults to current IP.
    assertNotNull(req.getConfiguration().host);
    assertEquals(5555, req.getConfiguration().port.longValue());
  }

  @Test
  public void commandLineParamDefaultCapabilities() {
    GridNodeConfiguration config = new GridNodeConfiguration();
    new JCommander(config, "-role", "wd", "-hubHost", "ABC", "-host","localhost");
    RegistrationRequest req = RegistrationRequest.build(config);
    assertEquals("ABC", req.getConfiguration().getHubHost());
    assertEquals(config.capabilities.size(), req.getConfiguration().capabilities.size());
  }

  @Test
  public void registerParam() {
    GridNodeConfiguration config = new GridNodeConfiguration();
    new JCommander(config, "-role", "wd", "-hubHost", "ABC", "-host","localhost");
    RegistrationRequest req = RegistrationRequest.build(config);
    assertEquals(true, req.getConfiguration().register);

    config = new GridNodeConfiguration();
    new JCommander(config, "-role", "wd", "-hubHost", "ABC", "-hubPort", "1234","-host","localhost", "-register","false");
    RegistrationRequest req2 = RegistrationRequest.build(config);
    assertEquals(false, req2.getConfiguration().register);

  }

  @Test
  public void ensurePre2_9HubCompatibility() {
    GridNodeConfiguration config = new GridNodeConfiguration();
    new JCommander(config, "-role", "wd", "-host","example.com", "-port", "5555");
    RegistrationRequest req = RegistrationRequest.build(config);

    assertEquals("http://example.com:5555", req.getConfiguration().getRemoteHost());
  }

  @Test(expected = GridConfigurationException.class)
  public void validateWithException() {
    GridNodeConfiguration config = new GridNodeConfiguration();
    new JCommander(config, "-role", "node", "-hubHost", "localhost", "-hub", "localhost:4444");
    RegistrationRequest req = new RegistrationRequest(config);

    req.validate();
  }

  /**
   * Tests that RegistrationRequest.build(config) returns the expected configuration
   */
  @Test
  public void testBuildWithConfiguration() {
    GridNodeConfiguration actualConfig = new GridNodeConfiguration();
    actualConfig.maxSession = 50;
    actualConfig.timeout = 10;
    actualConfig.host = "dummyhost";
    actualConfig.port = 1234;
    actualConfig.capabilities.set(0, DesiredCapabilities.operaBlink());
    actualConfig.nodeConfigFile = GridNodeConfiguration.DEFAULT_NODE_CONFIG_FILE;

    RegistrationRequest req = RegistrationRequest.build(actualConfig);
    assertConstruction(req);

    // we should get a new config object ref back, since the nodeConfigFile was processed
    assertNotSame(req.getConfiguration(), actualConfig);
    // reset to new config which build() produced
    actualConfig = req.getConfiguration();

    // make sure the nodeConfigFile was processed by ensuring that it now is null;
    assertNull(actualConfig.nodeConfigFile);

    // make sure the first capability is for operaBlink
    assertEquals(DesiredCapabilities.operaBlink().getBrowserName(),
                 actualConfig.capabilities.get(0).getBrowserName());

    // make sure this merge protected value was preserved, then remove it for the final assert
    assertEquals("dummyhost", actualConfig.host);
    actualConfig.host = null;
    // make sure this merge protected value was preserved, then reset it for the final assert
    assertEquals(1234, actualConfig.port.intValue());
    actualConfig.port = 5555;

    // merge actualConfig onto it.. which is what build(config) should do
    GridNodeConfiguration expectedConfig = new GridNodeConfiguration();
    expectedConfig.merge(actualConfig);

    assertEquals(expectedConfig.toString(), actualConfig.toString());
  }

  /**
   * Tests that new RegistrationRequest(config) performs as expected
   */
  @Test
  public void testConstructorWithConfiguration() {
    GridNodeConfiguration actualConfig = new GridNodeConfiguration();
    actualConfig.host = "dummyhost";
    RegistrationRequest req = new RegistrationRequest(actualConfig);
    assertConstruction(req);
    // make sure the provided config was used.
    assertSame(req.getConfiguration(), actualConfig);
  }

  /**
   * Tests that RegistrationRequest.build() performs as expected
   */
  @Test
  public void testBuild() {
    assertConstruction(RegistrationRequest.build());
  }

  /**
   * Tests that RegistrationRequest.build(null) performs as expected
   */
  @Test
  public void testBuildWithNullConfiguration() {
    assertConstruction(RegistrationRequest.build(null));
  }

  /**
   * Tests that new RegistrationRequest() performs as expected
   */
  @Test
  public void testNoArgConstructor() {
    assertConstruction(new RegistrationRequest());
  }

  /**
   * Tests that new RegistrationRequest(null) performs as expected
   */
  @Test
  public void testConstructorWithNullConfiguration() {
    assertConstruction(new RegistrationRequest(null));
  }

  /**
   * Should not result in any NPE during the internal call to fixUpCapabilities
   */
  @Test
  public void testConstructorWithConfigurationAndNullCapabilities() {
    GridNodeConfiguration config = new GridNodeConfiguration();
    config.capabilities = null;
    RegistrationRequest req = new RegistrationRequest(config);
    assertNull(req.getConfiguration().capabilities);
  }

  /**
   * Should not result in any NPE during the internal call to fixUpCapabilities
   */
  @Test
  public void testBuildWithConfigurationAndNullCapabilities() {
    GridNodeConfiguration config = new GridNodeConfiguration();
    config.capabilities = null;
    RegistrationRequest req = RegistrationRequest.build(config);
    assertNull(req.getConfiguration().capabilities);
  }

  private void assertConstruction(RegistrationRequest req) {
    assertNotNull(req);
    assertNotNull(req.getConfiguration());
    assertNull(req.getName());
    assertNull(req.getDescription());
    // fixUpHost should have been internally called
    assertNotNull(req.getConfiguration().host);
    assertNotNull(req.getConfiguration().capabilities);
    // should have the default capabilities
    // fixUpCapabilities should have been internally called
    assertEquals(3, req.getConfiguration().capabilities.size());
    for (DesiredCapabilities capabilities : req.getConfiguration().capabilities) {
      assertNotNull(capabilities.getPlatform());
      assertNotNull(capabilities.getCapability("seleniumProtocol"));
    }
  }
}
