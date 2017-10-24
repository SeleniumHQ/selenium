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

package org.openqa.grid.selenium.proxy;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import com.beust.jcommander.JCommander;

import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.BaseRemoteProxy;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;

import java.util.HashMap;


public class DefaultRemoteProxyTest {

  @Test
  public void proxyTimeout() throws InterruptedException {
    Registry registry = Registry.newInstance();
    registry.getConfiguration().timeout = 1;
    GridNodeConfiguration nodeConfiguration = new GridNodeConfiguration();
    new JCommander(nodeConfiguration, "-role", "webdriver");
    RegistrationRequest req = RegistrationRequest.build(nodeConfiguration);
    req.getConfiguration().proxy = DefaultRemoteProxy.class.getName();

    BaseRemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);
    TestSession newSession = p.getNewSession(new HashMap<String, Object>());
    assertNotNull(newSession );
    Thread.sleep(2);
    p.forceSlotCleanerRun();
    assertTrue(p.getRegistry().getActiveSessions().isEmpty());
  }
}
