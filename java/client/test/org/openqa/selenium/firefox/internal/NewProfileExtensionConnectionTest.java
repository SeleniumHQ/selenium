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

package org.openqa.selenium.firefox.internal;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import org.junit.After;
import org.junit.Assume;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.internal.SocketLock;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.SeleniumTestRunner;
import org.openqa.selenium.testing.drivers.SauceDriver;

@RunWith(SeleniumTestRunner.class)
public class NewProfileExtensionConnectionTest {

  private NewProfileExtensionConnection connection;

  @Test
  @NeedsLocalEnvironment
  public void canBeConstructed() throws Exception {
    Assume.assumeFalse(SauceDriver.shouldUseSauce());
    connection = new NewProfileExtensionConnection
        (makeLock(), new FirefoxBinary(), new FirefoxProfile(), "my-host");
  }

  @Test
  @NeedsLocalEnvironment
  public void shouldDefaultToPortSpecifiedInProfileWhenDeterminingNextFreePort() throws Exception {
    Assume.assumeFalse(SauceDriver.shouldUseSauce());
    int expectedPort = 2400;

    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference(FirefoxProfile.PORT_PREFERENCE, expectedPort);

    connection = new NewProfileExtensionConnection
        (makeLock(), new FirefoxBinary(), profile, "my-host");

    try {

      connection.start();

      fail("there was an unexpected server listening on " + expectedPort + "; expected connection to fail");
    } catch (WebDriverException e) {
      int PORT_PREFERENCE_NOT_PROPAGATED = -1;
      assertEquals(expectedPort,
                   profile.getIntegerPreference(FirefoxProfile.PORT_PREFERENCE, PORT_PREFERENCE_NOT_PROPAGATED));
    }

  }

  @After
  public void destroyConnection() {
    if (connection != null) {
      connection.quit();
    }
  }

  private SocketLock makeLock() {
    return new SocketLock(4200);
  }
}
