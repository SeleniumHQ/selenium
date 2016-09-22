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
import static org.junit.Assert.assertTrue;

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
  public void json() {
    RegistrationRequest req =
      new RegistrationRequest(new GridNodeConfiguration(), "Franзois", "a\nb\nc");

    for (int i = 0; i < 5; i++) {
      DesiredCapabilities cap = new DesiredCapabilities(BrowserType.FIREFOX, "" + i, Platform.LINUX);
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
    // should be 3, we a building from the DefaultNodeWebDriver.json
    assertEquals(3, req.getConfiguration().capabilities.size());
  }

  @Test
  public void registerParam() {
    GridNodeConfiguration config = new GridNodeConfiguration();
    new JCommander(config, "-role", "wd", "-hubHost", "ABC", "-host","localhost");
    RegistrationRequest req = RegistrationRequest.build(config);
    assertEquals(true, req.getConfiguration().register);


    config = new GridNodeConfiguration();
    // TODO allow one to set a boolean command line arg to false explicitly
    new JCommander(config, "-role", "wd", "-hubHost", "ABC", "-hubPort", "1234","-host","localhost"/*,"-register","false"*/);
    config.register = false;
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
}
