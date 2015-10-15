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


package org.openqa.selenium.server.cli;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;

public class RemoteControlLauncherTest {

  @Test
  public void testHonorSystemProxyIsSetWhenProvidedAsAnOption() {
    final RemoteControlConfiguration configuration;

    configuration =
        SeleniumServer.parseLauncherOptions(new String[] {"-honor-system-proxy"});
    assertTrue(configuration.honorSystemProxy());
  }

  @Test
  public void testHonorSystemProxyIsFalseWhenNotProvidedAsAnOption() {
    final RemoteControlConfiguration configuration;

    configuration = SeleniumServer.parseLauncherOptions(new String[]{});
    assertFalse(configuration.honorSystemProxy());
  }

}
