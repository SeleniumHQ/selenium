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

package org.openqa.selenium.grid.node.relay;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;

public class RelaySessionFactoryTest {

  // Add the following test method to the `RelaySessionFactoryTest` class
  @Test
  public void testFilterRelayCapabilities() {
    Capabilities capabilitiesWithApp =
        new ImmutableCapabilities(
            "browserName", "chrome", "platformName", "Android", "appium:app", "/link/to/app.apk");
    Capabilities capabilitiesWithAppPackage =
        new ImmutableCapabilities(
            "browserName",
            "chrome",
            "platformName",
            "Android",
            "appium:appPackage",
            "com.example.app");
    Capabilities capabilitiesWithBundleId =
        new ImmutableCapabilities(
            "browserName",
            "chrome",
            "platformName",
            "Android",
            "appium:bundleId",
            "com.example.app");
    Capabilities capabilitiesWithoutApp =
        new ImmutableCapabilities("browserName", "chrome", "platformName", "Android");

    RelaySessionFactory factory = Mockito.mock(RelaySessionFactory.class);

    when(factory.filterRelayCapabilities(capabilitiesWithApp)).thenCallRealMethod();
    when(factory.filterRelayCapabilities(capabilitiesWithAppPackage)).thenCallRealMethod();
    when(factory.filterRelayCapabilities(capabilitiesWithBundleId)).thenCallRealMethod();
    when(factory.filterRelayCapabilities(capabilitiesWithoutApp)).thenCallRealMethod();

    capabilitiesWithApp = factory.filterRelayCapabilities(capabilitiesWithApp);
    capabilitiesWithAppPackage = factory.filterRelayCapabilities(capabilitiesWithAppPackage);
    capabilitiesWithBundleId = factory.filterRelayCapabilities(capabilitiesWithBundleId);
    capabilitiesWithoutApp = factory.filterRelayCapabilities(capabilitiesWithoutApp);

    assertEquals(null, capabilitiesWithApp.getCapability("browserName"));
    assertEquals(null, capabilitiesWithAppPackage.getCapability("browserName"));
    assertEquals(null, capabilitiesWithBundleId.getCapability("browserName"));
    assertEquals("chrome", capabilitiesWithoutApp.getCapability("browserName"));
  }
}
