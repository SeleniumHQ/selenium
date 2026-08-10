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

package org.openqa.selenium.grid.node.kubernetes;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.net.URL;
import java.net.URLClassLoader;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.grid.config.ConfigException;

class KubernetesSessionFactoryProviderTest {

  @Test
  void requireFabric8PassesWhenClientIsOnClasspath() {
    // The test classpath includes the fabric8 client, so the probe resolves.
    assertThatCode(
            () -> KubernetesSessionFactoryProvider.requireFabric8(getClass().getClassLoader()))
        .doesNotThrowAnyException();
  }

  @Test
  void requireFabric8ThrowsActionableErrorWhenClientIsMissing() {
    // A loader that only sees the platform classes cannot resolve fabric8, mirroring a server jar
    // launched without the fabric8 --ext jars.
    ClassLoader withoutFabric8 =
        new URLClassLoader(new URL[0], ClassLoader.getPlatformClassLoader());

    assertThatThrownBy(() -> KubernetesSessionFactoryProvider.requireFabric8(withoutFabric8))
        .isInstanceOf(ConfigException.class)
        .hasMessageContaining("fabric8")
        .hasMessageContaining("--ext");
  }
}
