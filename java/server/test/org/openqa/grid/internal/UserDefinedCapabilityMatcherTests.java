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

import com.beust.jcommander.JCommander;

import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.utils.DefaultCapabilityMatcher;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.grid.web.Hub;

public class UserDefinedCapabilityMatcherTests {

  @Test
  public void defaultsToDefaultMatcher() {
    Registry registry = Registry.newInstance();
    GridNodeConfiguration nodeConfiguration = new GridNodeConfiguration();
    new JCommander(nodeConfiguration, "-role", "webdriver","-id", "abc","-host","localhost");
    RegistrationRequest req = RegistrationRequest.build(nodeConfiguration);
    req.getConfiguration().proxy = null;
    RemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);

    assertEquals(DefaultCapabilityMatcher.class, p.getCapabilityHelper().getClass());

  }

  // issue #2118
  @Test
  public void capabilityMatcherCanBeSpecified() {
    GridHubConfiguration hubConfig = new GridHubConfiguration();
    hubConfig.capabilityMatcher = new MyCapabilityMatcher();
    Registry registry = Registry.newInstance((Hub)null,hubConfig);
    GridNodeConfiguration nodeConfiguration = new GridNodeConfiguration();
    new JCommander(nodeConfiguration, "-role", "webdriver","-id", "abc","-host","localhost");
    RegistrationRequest req = RegistrationRequest.build(nodeConfiguration);
    req.getConfiguration().proxy = null;
    RemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);

    assertEquals(MyCapabilityMatcher.class, p.getCapabilityHelper().getClass());
  }

}
