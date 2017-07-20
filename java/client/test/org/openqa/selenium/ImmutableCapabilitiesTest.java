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

package org.openqa.selenium;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.remote.DesiredCapabilities;

@RunWith(JUnit4.class)
public class ImmutableCapabilitiesTest {

  @Test
  public void canCompareCapabilities() {
    DesiredCapabilities caps1 = new DesiredCapabilities();
    DesiredCapabilities caps2 = new DesiredCapabilities();
    assertEquals(new ImmutableCapabilities(caps1), new ImmutableCapabilities(caps2));

    caps1.setCapability("xxx", "yyy");
    assertNotEquals(new ImmutableCapabilities(caps1), new ImmutableCapabilities(caps2));

    caps2.setCapability("xxx", "yyy");
    assertEquals(new ImmutableCapabilities(caps1), new ImmutableCapabilities(caps2));
  }

}
