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

import static java.util.Collections.emptyMap;
import static java.util.Collections.singletonMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.ServiceLoader;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.node.NodeSessionFactoryProvider;

// This suite runs against :kubernetes-embedded, where fabric8 is compile-only (neverlink) and
// therefore absent at runtime -- the exact "embedded classes + external fabric8 via --ext"
// deployment mode. It must NOT depend on any fabric8 artifact; see the sibling BUILD target.
class KubernetesEmbeddedWithoutFabric8Test {

  private static Config kubernetesEnabled() {
    return new MapConfig(
        singletonMap(
            "kubernetes",
            singletonMap(
                "configs",
                List.of("selenium/standalone-chrome:latest", "{\"browserName\": \"chrome\"}"))));
  }

  @Test
  void fabric8IsNotOnTheRuntimeClasspath() {
    // Guards the premise of this suite: if fabric8 ever leaks onto this target's runtime classpath,
    // the other assertions here would silently stop testing the embedded mode.
    assertThatThrownBy(() -> Class.forName("io.fabric8.kubernetes.client.KubernetesClient"))
        .isInstanceOf(ClassNotFoundException.class);
  }

  @Test
  void providerIsDiscoverableAndInstantiableWithoutFabric8() {
    // ServiceLoader instantiates each provider during iteration; this fails with a
    // ServiceConfigurationError if the provider touches fabric8 at construction time.
    boolean found = false;
    for (NodeSessionFactoryProvider provider :
        ServiceLoader.load(NodeSessionFactoryProvider.class)) {
      if (provider instanceof KubernetesSessionFactoryProvider) {
        found = true;
      }
    }
    assertThat(found).isTrue();
  }

  @Test
  void isEnabledReflectsConfigWithoutFabric8() {
    KubernetesSessionFactoryProvider provider = new KubernetesSessionFactoryProvider();
    assertThat(provider.isEnabled(kubernetesEnabled())).isTrue();
    assertThat(provider.isEnabled(new MapConfig(emptyMap()))).isFalse();
  }

  @Test
  void loadFactoriesFailsWithActionableErrorWithoutFabric8() {
    KubernetesSessionFactoryProvider provider = new KubernetesSessionFactoryProvider();
    // The fabric8 check short-circuits before tracer/clientFactory are used, so null is safe here.
    assertThatThrownBy(() -> provider.loadFactories(kubernetesEnabled(), null, null))
        .isInstanceOf(ConfigException.class)
        .hasMessageContaining("fabric8")
        .hasMessageContaining("--ext");
  }
}
