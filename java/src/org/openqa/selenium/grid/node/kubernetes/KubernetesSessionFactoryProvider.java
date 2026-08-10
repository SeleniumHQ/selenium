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

import com.google.auto.service.AutoService;
import java.util.Collection;
import java.util.Map;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.node.NodeSessionFactoryProvider;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.grid.node.config.NodeOptions;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.Tracer;

@AutoService(NodeSessionFactoryProvider.class)
public class KubernetesSessionFactoryProvider implements NodeSessionFactoryProvider {

  // Probed by name so this provider does not hard-link fabric8 and stays loadable (and
  // ServiceLoader-instantiable) when fabric8 is absent from the runtime classpath.
  private static final String FABRIC8_PROBE_CLASS = "io.fabric8.kubernetes.client.KubernetesClient";

  @Override
  public boolean isEnabled(Config config) {
    return config.getAll("kubernetes", "configs").isPresent();
  }

  @Override
  public Map<Capabilities, Collection<SessionFactory>> loadFactories(
      Config config, Tracer tracer, HttpClient.Factory clientFactory) {
    requireFabric8(KubernetesSessionFactoryProvider.class.getClassLoader());
    NodeOptions nodeOptions = new NodeOptions(config);
    return new KubernetesOptions(config)
        .getKubernetesSessionFactories(tracer, clientFactory, nodeOptions);
  }

  static void requireFabric8(ClassLoader loader) {
    try {
      Class.forName(FABRIC8_PROBE_CLASS, false, loader);
    } catch (ClassNotFoundException | LinkageError e) {
      throw new ConfigException(
          "Kubernetes support is enabled (via [kubernetes] configs / --kubernetes-configs), but the"
              + " fabric8 Kubernetes client is not on the runtime classpath. The Selenium server jar"
              + " bundles the Kubernetes node classes without fabric8; supply the fabric8 client at"
              + " runtime with --ext, for example:\n"
              + "  --ext $(coursier fetch -p io.fabric8:kubernetes-client:<version>"
              + " io.fabric8:kubernetes-client-api:<version> io.fabric8:kubernetes-model-batch:<version>"
              + " io.fabric8:kubernetes-model-core:<version>)",
          e);
    }
  }
}
