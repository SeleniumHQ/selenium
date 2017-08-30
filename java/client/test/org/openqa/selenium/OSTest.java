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
import static org.junit.Assert.assertNull;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;

public class OSTest {

  @Test
  public void shouldConvertAPlatformFamilyToAnOsFamily() {
    Capabilities caps = new ImmutableCapabilities(ImmutableMap.of("platform", Platform.WINDOWS ));
    OS os = new OS(caps);

    assertEquals("windows", os.getFamily());
    assertNull(os.getName());
    assertNull(os.getVersion());
  }

  @Test
  public void shouldGetPlatformNameFromPlatformEnum() {
    Capabilities caps = new ImmutableCapabilities(ImmutableMap.of("platform", Platform.SIERRA));
    OS os = new OS(caps);

    assertEquals("mac", os.getFamily());
    assertEquals("sierra", os.getName());
    assertEquals("10.12", os.getVersion());
  }

}
