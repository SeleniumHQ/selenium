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

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.Arrays;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.docker.Device.device;

public class DeviceTest {

  public static Stream<Arguments> data() {
    return Arrays.asList(new Object[][]{
      // pathOnHost, pathInContainer, cgroupPermissions, expectedCgroupPermissions
      {"/dev/tty", "/dev/tty", "crw", "crw", true},
      {"/dev/tty", "/dev/tty", null, "crw", true},
      {"/dev/tty", "/dev/tty", "", "crw", true},
      {"/dev/tty", "/dev/tty", "  ", "crw", true}
    }).stream().map(Arguments::of);
  }

  @ParameterizedTest
  @MethodSource("data")
  public void deviceShouldHaveDefinedPermissionsApplied(String pathOnHost, String pathInContainer, String cgroupPermissions,
                                                        String expectedCgroupPermissions, boolean matchCgroupPermissions) {
    Device device = device(pathOnHost, pathInContainer, cgroupPermissions);
    assertThat(device.getCgroupPermissions().contentEquals(expectedCgroupPermissions))
      .describedAs("Expected %s in cgroupPermissions", expectedCgroupPermissions)
      .isEqualTo(matchCgroupPermissions);
  }
}
