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

package org.openqa.selenium.grid.node.k8s;

import com.google.common.collect.HashMultimap;
import com.google.common.collect.ImmutableMultimap;
import com.google.common.collect.Multimap;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.util.Config;
import java.io.IOException;
import java.time.Duration;
import java.util.*;
import java.util.logging.Logger;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.grid.node.config.NodeOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.Tracer;

public class KubernetesOptions {

  static final String KUBERNETES_SECTION = "k8s";
  static final String DEFAULT_ASSETS_PATH = "/opt/selenium/assets";
  static final String DEFAULT_NAMESPACE = "default";
  static final String DEFAULT_VIDEO_IMAGE = "false";
  static final int DEFAULT_MAX_SESSIONS = Runtime.getRuntime().availableProcessors();
  static final int DEFAULT_SERVER_START_TIMEOUT = 60;

  private static final Logger LOG = Logger.getLogger(KubernetesOptions.class.getName());
  private static final Json JSON = new Json();

  private final org.openqa.selenium.grid.config.Config config;

  public KubernetesOptions(org.openqa.selenium.grid.config.Config config) {
    this.config = Require.nonNull("Config", config);
  }

  private ApiClient getKubernetesClient() {
    try {
      // Try to load from kubeconfig file or in-cluster config
      Optional<String> kubeconfigPath = config.get(KUBERNETES_SECTION, "kubeconfig");
      if (kubeconfigPath.isPresent()) {
        return Config.fromConfig(kubeconfigPath.get());
      } else {
        // Use default kubeconfig or in-cluster configuration
        return Config.defaultClient();
      }
    } catch (IOException e) {
      throw new ConfigException("Unable to create Kubernetes client", e);
    }
  }

  private String getNamespace() {
    return config.get(KUBERNETES_SECTION, "namespace").orElse(DEFAULT_NAMESPACE);
  }

  private Duration getServerStartTimeout() {
    return Duration.ofSeconds(
        config.getInt(KUBERNETES_SECTION, "server-start-timeout").orElse(DEFAULT_SERVER_START_TIMEOUT));
  }

  private boolean isEnabled() {
    return config.getAll(KUBERNETES_SECTION, "configs").isPresent();
  }

  public Map<Capabilities, Collection<SessionFactory>> getKubernetesSessionFactories(
      Tracer tracer, HttpClient.Factory clientFactory, NodeOptions options) {

    if (!isEnabled()) {
      return Collections.emptyMap();
    }

    ApiClient kubernetesClient = getKubernetesClient();
    String namespace = getNamespace();

    List<String> allConfigs =
        config
            .getAll(KUBERNETES_SECTION, "configs")
            .orElseThrow(() -> new ConfigException("Unable to find kubernetes configs"));

    Multimap<String, Capabilities> kinds = HashMultimap.create();
    int configsCount = allConfigs.size();
    for (int i = 0; i < configsCount; i++) {
      String imageName = allConfigs.get(i);
      i++;
      if (i == configsCount) {
        throw new ConfigException("Unable to find JSON config for image: " + imageName);
      }
      Capabilities stereotype =
          options.enhanceStereotype(JSON.toType(allConfigs.get(i), Capabilities.class));

      kinds.put(imageName, stereotype);
    }

    KubernetesAssetsPath assetsPath = getAssetsPath();
    String videoImage = getVideoImage();
    Map<String, String> resourceLimits = getResourceLimits();
    Map<String, String> resourceRequests = getResourceRequests();
    Map<String, String> labels = getLabels();
    Map<String, String> annotations = getAnnotations();

    int maxSessionCount =
        Math.min(
            config.getInt("node", "max-sessions").orElse(DEFAULT_MAX_SESSIONS),
            DEFAULT_MAX_SESSIONS);

    ImmutableMultimap.Builder<Capabilities, SessionFactory> factories = ImmutableMultimap.builder();
    kinds.forEach(
        (imageName, caps) -> {
          Map<String, String> imageProperties = getImageProperties(imageName);

          for (int i = 0; i < maxSessionCount; i++) {
            factories.put(
                caps,
                new KubernetesSessionFactory(
                    tracer,
                    clientFactory,
                    options.getSessionTimeout(),
                    getServerStartTimeout(),
                    kubernetesClient,
                    namespace,
                    imageName,
                    caps,
                    imageProperties,
                    videoImage,
                    assetsPath,
                    capabilities -> options.getSlotMatcher().matches(caps, capabilities),
                    resourceLimits,
                    resourceRequests,
                    labels,
                    annotations));
          }
          LOG.info(
              String.format(
                  "Mapping %s to Kubernetes image %s %d times", caps, imageName, maxSessionCount));
        });
    return factories.build().asMap();
  }

  private String getVideoImage() {
    String videoImage = config.get(KUBERNETES_SECTION, "video-image").orElse(DEFAULT_VIDEO_IMAGE);
    if (videoImage.equalsIgnoreCase("false")) {
      return null;
    }
    return videoImage;
  }

  private KubernetesAssetsPath getAssetsPath() {
    Optional<String> assetsPath = config.get(KUBERNETES_SECTION, "assets-path");
    // In Kubernetes, host path and pod path are typically the same for mounted volumes
    return assetsPath.map(path -> new KubernetesAssetsPath(path, path)).orElse(null);
  }

  private Map<String, String> getResourceLimits() {
    Map<String, String> limits = new HashMap<>();
    config.get(KUBERNETES_SECTION, "cpu-limit").ifPresent(cpu -> limits.put("cpu", cpu));
    config.get(KUBERNETES_SECTION, "memory-limit").ifPresent(mem -> limits.put("memory", mem));
    return limits;
  }

  private Map<String, String> getResourceRequests() {
    Map<String, String> requests = new HashMap<>();
    config.get(KUBERNETES_SECTION, "cpu-request").ifPresent(cpu -> requests.put("cpu", cpu));
    config.get(KUBERNETES_SECTION, "memory-request").ifPresent(mem -> requests.put("memory", mem));
    return requests;
  }

  private Map<String, String> getLabels() {
    List<String> labelList = config.getAll(KUBERNETES_SECTION, "labels").orElseGet(Collections::emptyList);
    Map<String, String> labels = new HashMap<>();

    for (int i = 0; i < labelList.size(); i += 2) {
      if (i + 1 < labelList.size()) {
        labels.put(labelList.get(i), labelList.get(i + 1));
      }
    }
    return labels;
  }

  private Map<String, String> getAnnotations() {
    List<String> annotationList = config.getAll(KUBERNETES_SECTION, "annotations").orElseGet(Collections::emptyList);
    Map<String, String> annotations = new HashMap<>();

    for (int i = 0; i < annotationList.size(); i += 2) {
      if (i + 1 < annotationList.size()) {
        annotations.put(annotationList.get(i), annotationList.get(i + 1));
      }
    }
    return annotations;
  }

  private Map<String, String> getImageProperties(String imageName) {
    // Store any image-specific configuration
    Map<String, String> properties = new HashMap<>();
    properties.put("imageName", imageName);

    // Add image pull policy if configured
    config.get(KUBERNETES_SECTION, "image-pull-policy")
        .ifPresent(policy -> properties.put("imagePullPolicy", policy));

    return properties;
  }
}
