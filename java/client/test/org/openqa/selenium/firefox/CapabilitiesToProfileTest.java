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

package org.openqa.selenium.firefox;

import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

/**
 * Tests translation of capability to profile setting.
 */
@RunWith(JUnit4.class)
public class CapabilitiesToProfileTest {
  @Test
  public void setsNativeEventsPrefOnProfile() {
    DesiredCapabilities caps = DesiredCapabilities.firefox();
    caps.setCapability(CapabilityType.HAS_NATIVE_EVENTS, true);

    FirefoxProfile profile = new FirefoxProfile();
    FirefoxDriver.populateProfile(profile, caps);
    assertTrue("Native events were enabled as capability, should be set on profile.",
        profile.areNativeEventsEnabled());
  }

}
