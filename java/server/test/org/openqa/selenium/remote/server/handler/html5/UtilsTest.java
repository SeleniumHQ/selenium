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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.html5.AppCacheStatus;
import org.openqa.selenium.html5.ApplicationCache;
import org.openqa.selenium.html5.LocalStorage;
import org.openqa.selenium.html5.Location;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.html5.SessionStorage;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ExecuteMethod;

/**
 * Tests for the {@link Utils} class.
 */
@RunWith(JUnit4.class)
public class UtilsTest {

  @Test
  public void returnsInputDriverIfRequestedFeatureIsImplementedDirectly() {
    WebDriver driver = mock(Html5Driver.class);
    assertSame(driver, Utils.getApplicationCache(driver));
    assertSame(driver, Utils.getLocationContext(driver));
    assertSame(driver, Utils.getWebStorage(driver));
  }

  @Test
  public void throwsIfRequestedFeatureIsNotSupported() {
    WebDriver driver = mock(WebDriver.class);
    try {
      Utils.getApplicationCache(driver);
      fail();
    } catch (UnsupportedCommandException expected) {
      // Do nothing.
    }

    try {
      Utils.getLocationContext(driver);
      fail();
    } catch (UnsupportedCommandException expected) {
      // Do nothing.
    }

    try {
      Utils.getWebStorage(driver);
      fail();
    } catch (UnsupportedCommandException expected) {
      // Do nothing.
    }
  }

  @Test
  public void providesRemoteAccessToAppCache() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(CapabilityType.SUPPORTS_APPLICATION_CACHE, true);

    CapableDriver driver = mock(CapableDriver.class);
    when(driver.getCapabilities()).thenReturn(caps);
    when(driver.execute(DriverCommand.GET_APP_CACHE_STATUS, null))
        .thenReturn(AppCacheStatus.CHECKING.name());

    ApplicationCache cache = Utils.getApplicationCache(driver);
    assertEquals(AppCacheStatus.CHECKING, cache.getStatus());
  }

  @Test
  public void providesRemoteAccessToLocationContext() {
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(CapabilityType.SUPPORTS_LOCATION_CONTEXT, true);

    CapableDriver driver = mock(CapableDriver.class);
    when(driver.getCapabilities()).thenReturn(caps);
    when(driver.execute(DriverCommand.GET_LOCATION, null)).thenReturn(
        ImmutableMap.of("latitude", 1.2, "longitude", 3.4, "altitude", 5.6));

    LocationContext context = Utils.getLocationContext(driver);
    Location location = context.location();
    assertEquals(1.2, location.getLatitude(), 0.001);
    assertEquals(3.4, location.getLongitude(), 0.001);
    assertEquals(5.6, location.getAltitude(), 0.001);

    reset(driver);
    location = new Location(7, 8, 9);
    context.setLocation(location);
    verify(driver).execute(DriverCommand.SET_LOCATION, ImmutableMap.of("location", location));
  }

  @Test
  public void providesRemoteAccessToWebStorage() {
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

  interface Html5Driver extends WebDriver, ApplicationCache, LocationContext, WebStorage {
  }
}
