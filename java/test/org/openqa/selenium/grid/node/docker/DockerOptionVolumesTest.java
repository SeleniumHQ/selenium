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

package org.openqa.selenium.grid.node.docker;

import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mockito;
import org.openqa.selenium.docker.Device;
import org.openqa.selenium.grid.config.Config;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

class DockerOptionVolumesTest {

  public static Stream<Arguments> data() {
    return Arrays.stream(
            new Object[][] {
              {
                configuredVolumeMapping(List.of("/mnt/diskh:/mnt/diskl")),
                Map.of("/mnt/diskh", "/mnt/diskl")
              },
              {
                configuredVolumeMapping(asList("/mnt/diskh1:/mnt/diskl1", "/mnt/diskh2:/mnt/diskl2")),
                Map.of("/mnt/diskh1", "/mnt/diskl1", "/mnt/diskh2", "/mnt/diskl2")
              },
              {
                configuredVolumeMapping(List.of("/mnt/diskh:/mnt/diskl ")),
                Map.of("/mnt/diskh", "/mnt/diskl")
              }
            })
        .map(Arguments::of);
  }

  @ParameterizedTest
  @MethodSource("data")
  void shouldReturnOnlyExpectedDeviceMappings(Config config, Map<String, String> volumesExpected) {
    Map<String, String> returnedVolumes = new DockerOptions(config).getVolumesMapping();
    assertThat(volumesExpected.equals(returnedVolumes))
        .describedAs("Expected %s but was %s", volumesExpected, returnedVolumes)
        .isTrue();
  }

  private static Config configuredVolumeMapping(List<String> volumeMapping) {
    Config config = Mockito.mock(Config.class);
    Mockito.when(config.getAll("docker", "volumes")).thenReturn(Optional.of(volumeMapping));
    return config;
  }
}
