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

package org.openqa.selenium.docker;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.docker.Device.device;

import java.util.Arrays;
import java.util.Collection;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

@RunWith(Parameterized.class)
public class DeviceTest {

  private final Device device;
  private final String expectedCgroupPermissions;
  private final boolean matchCgroupPermissions;

  @Parameterized.Parameters
  public static Collection<Object[]> data() {
    return Arrays.asList(new Object[][] {
      // pathOnHost, pathInContainer, cgroupPermissions, expectedCgroupPermissions
      { "/dev/tty", "/dev/tty", "crw", "crw", true},
      { "/dev/tty", "/dev/tty", null, "crw", true},
      { "/dev/tty", "/dev/tty", "", "crw", true},
      { "/dev/tty", "/dev/tty", "  ", "crw", true}
    });
  }

  public DeviceTest(String pathOnHost, String pathInContainer, String cgroupPermissions,
                    String expectedCgroupPermissions, boolean matchCgroupPermissions) {
    this.device = device(pathOnHost, pathInContainer, cgroupPermissions);
    this.expectedCgroupPermissions = expectedCgroupPermissions;
    this.matchCgroupPermissions = matchCgroupPermissions;
  }

  @Test
  public void deviceShouldHaveDefinedPermissionsApplied() {
    assertThat(device.getCgroupPermissions().contentEquals(expectedCgroupPermissions))
      .describedAs("Expected %s in cgroupPermissions", expectedCgroupPermissions)
      .isEqualTo(matchCgroupPermissions);
  }
}
