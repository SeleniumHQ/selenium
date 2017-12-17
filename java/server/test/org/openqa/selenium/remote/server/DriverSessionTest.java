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

package org.openqa.selenium.remote.server;

import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

public class DriverSessionTest {

  @Test
  public void testShouldBeAbleToRegisterOwnDriver() {
    DefaultDriverFactory factory = new DefaultDriverFactory(Platform.VISTA);
    DriverSessions sessions = new DefaultDriverSessions(factory, 18000);

    Capabilities capabilities = new DesiredCapabilities("foo", "1", Platform.ANY);

    assertFalse(factory.getProviderMatching(capabilities).canCreateDriverInstanceFor(capabilities));

    sessions.registerDriver(capabilities, AbstractDriver.class);

    assertTrue(factory.getProviderMatching(capabilities).canCreateDriverInstanceFor(capabilities));
  }

  public static abstract class AbstractDriver implements WebDriver {}
}
