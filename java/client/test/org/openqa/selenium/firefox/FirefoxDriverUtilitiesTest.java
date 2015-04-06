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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.internal.Lock;
import org.openqa.selenium.internal.SocketLock;

/**
 * FirefoxDriverUtilitiesTest is responsible for tests of FirefoxDriver
 * utilities that do not require a browser.
 */
@RunWith(JUnit4.class)
public class FirefoxDriverUtilitiesTest {

  @Test
  public void shouldObtainSocketLockForDefaultPortWhenNotSpecifiedInProfile(){
    Lock lock = FirefoxDriver.obtainLock(new FirefoxProfile());

    assertTrue("expected lock to be a SocketLock", lock instanceof SocketLock);

    assertEquals(SocketLock.DEFAULT_PORT, ((SocketLock) lock).getLockPort());
  }

  @Test
  public void shouldObtainSocketLockForPortSpecifiedInProfile(){
    FirefoxProfile mockProfile = mock(FirefoxProfile.class);
    int preferredPort = 2400;
    when(mockProfile.getIntegerPreference(FirefoxProfile.PORT_PREFERENCE, SocketLock.DEFAULT_PORT)).thenReturn(
        preferredPort);

    Lock lock = FirefoxDriver.obtainLock(mockProfile);

    assertTrue("expected lock to be a SocketLock", lock instanceof SocketLock);

    assertEquals(preferredPort, ((SocketLock) lock).getLockPort());
  }

}
