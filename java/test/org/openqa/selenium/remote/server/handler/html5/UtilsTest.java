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

package org.openqa.selenium.remote.server.handler.html5;

import com.google.common.collect.ImmutableMap;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.html5.LocalStorage;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.html5.SessionStorage;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ExecuteMethod;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Tests for the {@link Utils} class.
 */
class UtilsTest {

  @Test
  void returnsInputDriverIfRequestedFeatureIsImplementedDirectly() {
    WebDriver driver = mock(Html5Driver.class);
    assertSame(driver, Utils.getWebStorage(driver));
  }

  @Test
  void throwsIfRequestedFeatureIsNotSupported() {
    WebDriver driver = mock(WebDriver.class);
    try {
      Utils.getWebStorage(driver);
      fail();
    } catch (UnsupportedCommandException expected) {
      // Do nothing.
    }
  }

  @Test
  void providesRemoteAccessToWebStorage() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(CapabilityType.SUPPORTS_WEB_STORAGE, true);

    CapableDriver driver = mock(CapableDriver.class);
    when(driver.getCapabilities()).thenReturn(caps);

    WebStorage storage = Utils.getWebStorage(driver);

    LocalStorage localStorage = storage.getLocalStorage();
    SessionStorage sessionStorage = storage.getSessionStorage();

    localStorage.setItem("foo", "bar");
    sessionStorage.setItem("bim", "baz");

    verify(driver).execute(DriverCommand.SET_LOCAL_STORAGE_ITEM, ImmutableMap.of(
        "key", "foo", "value", "bar"));
    verify(driver).execute(DriverCommand.SET_SESSION_STORAGE_ITEM, ImmutableMap.of(
        "key", "bim", "value", "baz"));
  }

  interface CapableDriver extends WebDriver, ExecuteMethod, HasCapabilities {
  }

  interface Html5Driver extends WebDriver, LocationContext, WebStorage {

  }
}
