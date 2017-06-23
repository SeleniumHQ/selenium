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

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

@RunWith(JUnit4.class)
public class DriverSessionTest {
  @Test
  public void testShouldRegisterCorrectDefaultsOnMac() {
    DriverFactory factory = new DefaultDriverFactory(Platform.MAC);
    new DefaultDriverSessions(factory, 18000);

    assertTrue(factory.hasMappingFor(DesiredCapabilities.chrome()));
    assertTrue(factory.hasMappingFor(DesiredCapabilities.firefox()));
    assertFalse(factory.hasMappingFor(DesiredCapabilities.internetExplorer()));
  }

  @Test
  public void testShouldRegisterCorrectDefaultsOnLinux() {
    DriverFactory factory = new DefaultDriverFactory(Platform.LINUX);
    new DefaultDriverSessions(factory, 18000);

    assertTrue(factory.hasMappingFor(DesiredCapabilities.chrome()));
    assertTrue(factory.hasMappingFor(DesiredCapabilities.firefox()));
    assertFalse(factory.hasMappingFor(DesiredCapabilities.internetExplorer()));
  }

  @Test
  public void testShouldRegisterCorrectDefaultsOnWindows() {
    DriverFactory factory = new DefaultDriverFactory(Platform.VISTA);
    new DefaultDriverSessions(factory, 18000);

    assertTrue(factory.hasMappingFor(DesiredCapabilities.chrome()));
    assertTrue(factory.hasMappingFor(DesiredCapabilities.firefox()));
    assertTrue(factory.hasMappingFor(DesiredCapabilities.internetExplorer()));
  }

  @Test
  public void testShouldBeAbleToRegisterOwnDriver() {
    DriverFactory factory = new DefaultDriverFactory(Platform.VISTA);
    DriverSessions sessions = new DefaultDriverSessions(factory, 18000);

    Capabilities capabilities = new DesiredCapabilities("foo", "1", Platform.ANY);
    sessions.registerDriver(capabilities, AbstractDriver.class);

    assertTrue(factory.hasMappingFor(capabilities));
  }

  public static abstract class AbstractDriver implements WebDriver {}
}
