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

import io.fabric8.kubernetes.api.model.ConfigMap;
import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodSpec;
import io.fabric8.kubernetes.api.model.Quantity;
import io.fabric8.kubernetes.api.model.ResourceRequirements;
import io.fabric8.kubernetes.api.model.VolumeMount;
import io.fabric8.kubernetes.api.model.batch.v1.Job;
import io.fabric8.kubernetes.client.Config;
import io.fabric8.kubernetes.client.ConfigBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientBuilder;
import io.fabric8.kubernetes.client.KubernetesClientException;
import io.fabric8.kubernetes.client.utils.Serialization;
import java.time.Duration;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.grid.node.config.NodeOptions;
import org.openqa.selenium.internal.Multimap;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.Tracer;

public class KubernetesOptions {

  static final String K8S_SECTION = "kubernetes";
  static final String DEFAULT_ASSETS_PATH = "/opt/selenium/assets";
  static final String DEFAULT_VIDEO_IMAGE = "false";
  static final String DEFAULT_IMAGE_PULL_POLICY = "IfNotPresent";
  static final int DEFAULT_SERVER_START_TIMEOUT = 120;
  static final int DEFAULT_TERMINATION_GRACE_PERIOD = 30;
  static final String DEFAULT_LABEL_INHERIT_PREFIX = "se/";
  static final String CONFIGMAP_PREFIX = "configmap:";
  static final String TEMPLATE_KEY = "template";

  private static final Logger LOG = Logger.getLogger(KubernetesOptions.class.getName());
  private static final Json JSON = new Json();
  private final org.openqa.selenium.grid.config.Config config;

  public KubernetesOptions(org.openqa.selenium.grid.config.Config config) {
    this.config = Require.nonNull("Config", config);
  }

  public Map<Capabilities, Collection<SessionFactory>> getKubernetesSessionFactories(
      Tracer tracer, HttpClient.Factory clientFactory, NodeOptions options) {

    KubernetesClient kubeClient = buildKubernetesClient();

    // Validate K8s connectivity
    try {
      kubeClient.getKubernetesVersion();
    } catch (KubernetesClientException e) {
      throw new ConfigException("Unable to connect to Kubernetes API server: " + e.getMessage(), e);
    }

    String namespace = getNamespace(kubeClient);
    Duration serverStartTimeout = getServerStartTimeout();
    long terminationGracePeriod = getTerminationGracePeriod();
    String videoImage = getVideoImage();
    String assetsPath = getAssetsPath();
    String labelInheritPrefix = getLabelInheritPrefix();

    InheritedPodSpec inheritedPodSpec =
        inspectNodePod(kubeClient, namespace, labelInheritPrefix, assetsPath);
    if (inheritedPodSpec.hasInheritedFields()) {
      LOG.info("Inherited Pod spec fields from Node Pod for browser Jobs");
    }

    // Resolve with inheritance fallback: CLI → inherited → default
    String imagePullPolicy =
        config
            .get(K8S_SECTION, "image-pull-policy")
            .orElseGet(
                () ->
                    inheritedPodSpec.getImagePullPolicy() != null
                        ? inheritedPodSpec.getImagePullPolicy()
                        : DEFAULT_IMAGE_PULL_POLICY);

    String serviceAccount =
        config
            .get(K8S_SECTION, "service-account")
            .orElseGet(() -> inheritedPodSpec.getServiceAccountName());

    Map<String, Quantity> resourceRequests =
        config.get(K8S_SECTION, "resource-requests").isPresent()
            ? getResourceRequests()
            : inheritedPodSpec.getResourceRequests();

    Map<String, Quantity> resourceLimits =
        config.get(K8S_SECTION, "resource-limits").isPresent()
            ? getResourceLimits()
            : inheritedPodSpec.getResourceLimits();

    Map<String, String> nodeSelector =
        config.get(K8S_SECTION, "node-selector").isPresent()
            ? getNodeSelector()
            : new HashMap<>(inheritedPodSpec.getNodeSelector());

    List<String> allConfigs =
        config
            .getAll(K8S_SECTION, "configs")
            .orElseThrow(() -> new ConfigException("Unable to find kubernetes configs"));

    boolean usePortForwarding = config.get(K8S_SECTION, "url").isPresent();

    int configsCount = allConfigs.size();

    int maxSessions = options.getMaxSessions();

    Multimap<Capabilities, SessionFactory> factories = new Multimap<>();
    for (int i = 0; i < configsCount; i++) {
      String configKey = allConfigs.get(i);
      i++;
      if (i == configsCount) {
        throw new ConfigException("Unable to find JSON config for: " + configKey);
      }
      Capabilities caps =
          options.enhanceStereotype(JSON.toType(allConfigs.get(i), Capabilities.class));

      if (configKey.startsWith(CONFIGMAP_PREFIX)) {
        // Template mode: load Job template from ConfigMap
        String configMapRef = configKey.substring(CONFIGMAP_PREFIX.length());
        Job jobTemplate = loadJobTemplate(kubeClient, namespace, configMapRef);
        String templateBrowserImage = extractBrowserImage(jobTemplate);

        for (int s = 0; s < maxSessions; s++) {
          factories.put(
              caps,
              new KubernetesSessionFactory(
                  tracer,
                  clientFactory,
                  options.getSessionTimeout(),
                  serverStartTimeout,
                  this::buildKubernetesClient,
                  namespace,
                  templateBrowserImage,
                  caps,
                  jobTemplate,
                  videoImage,
                  assetsPath,
                  inheritedPodSpec,
                  terminationGracePeriod,
                  usePortForwarding,
                  capabilities -> options.getSlotMatcher().matches(caps, capabilities)));
        }
        LOG.info(
            String.format(
                "Mapping %s to K8s ConfigMap template '%s' (image: %s) %d times",
                caps, configMapRef, templateBrowserImage, maxSessions));
      } else {
        // Image mode: existing behavior
        for (int s = 0; s < maxSessions; s++) {
          factories.put(
              caps,
              new KubernetesSessionFactory(
                  tracer,
                  clientFactory,
                  options.getSessionTimeout(),
                  serverStartTimeout,
                  this::buildKubernetesClient,
                  namespace,
                  configKey,
                  caps,
                  imagePullPolicy,
                  serviceAccount,
                  resourceRequests,
                  resourceLimits,
                  nodeSelector,
                  videoImage,
                  assetsPath,
                  inheritedPodSpec,
                  terminationGracePeriod,
                  usePortForwarding,
                  capabilities -> options.getSlotMatcher().matches(caps, capabilities)));
        }
        LOG.info(
            String.format("Mapping %s to K8s image %s %d times", caps, configKey, maxSessions));
      }
    }
    return factories.asMap();
  }

  KubernetesClient buildKubernetesClient() {
    try {
      Optional<String> url = config.get(K8S_SECTION, "url");
      if (url.isPresent()) {
        LOG.info("Connecting to remote Kubernetes API server: " + url.get());
        Config kubeConfig = new ConfigBuilder().withMasterUrl(url.get()).build();
        return new KubernetesClientBuilder().withConfig(kubeConfig).build();
      }
      return new KubernetesClientBuilder().build();
    } catch (Exception e) {
      throw new ConfigException("Unable to create Kubernetes API client", e);
    }
  }

  static Job loadJobTemplate(
      KubernetesClient kubeClient, String currentNamespace, String configMapRef) {
    String cmNamespace;
    String cmName;
    if (configMapRef.contains("/")) {
      String[] parts = configMapRef.split("/", 2);
      cmNamespace = parts[0];
      cmName = parts[1];
    } else {
      cmNamespace = currentNamespace;
      cmName = configMapRef;
    }

    ConfigMap configMap;
    try {
      configMap = kubeClient.configMaps().inNamespace(cmNamespace).withName(cmName).get();
    } catch (KubernetesClientException e) {
      throw new ConfigException(
          String.format(
              "Failed to load ConfigMap '%s' in namespace '%s': %s",
              cmName, cmNamespace, e.getMessage()),
          e);
    }
    if (configMap == null) {
      throw new ConfigException(
          String.format("ConfigMap '%s' not found in namespace '%s'", cmName, cmNamespace));
    }

    Map<String, String> data = configMap.getData();
    if (data == null || !data.containsKey(TEMPLATE_KEY)) {
      throw new ConfigException(
          String.format(
              "ConfigMap '%s/%s' does not contain key '%s'", cmNamespace, cmName, TEMPLATE_KEY));
    }

    String templateYaml = data.get(TEMPLATE_KEY);
    Job job;
    try {
      job = Serialization.unmarshal(templateYaml, Job.class);
    } catch (Exception e) {
      throw new ConfigException(
          String.format(
              "Failed to parse Job template from ConfigMap '%s/%s': %s",
              cmNamespace, cmName, e.getMessage()),
          e);
    }

    if (job == null
        || job.getSpec() == null
        || job.getSpec().getTemplate() == null
        || job.getSpec().getTemplate().getSpec() == null) {
      throw new ConfigException(
          String.format(
              "Job template from ConfigMap '%s/%s' is missing spec.template.spec",
              cmNamespace, cmName));
    }

    // Validate browser container exists with an image
    List<Container> containers = job.getSpec().getTemplate().getSpec().getContainers();
    if (containers == null || containers.isEmpty()) {
      throw new ConfigException(
          String.format(
              "Job template from ConfigMap '%s/%s' has no containers", cmNamespace, cmName));
    }

    boolean hasBrowserContainer =
        containers.stream()
            .anyMatch(
                c ->
                    "browser".equals(c.getName())
                        && c.getImage() != null
                        && !c.getImage().isEmpty());
    if (!hasBrowserContainer) {
      throw new ConfigException(
          String.format(
              "Job template from ConfigMap '%s/%s' must have a container named "
                  + "'browser' with an image",
              cmNamespace, cmName));
    }

    LOG.info(String.format("Loaded Job template from ConfigMap '%s/%s'", cmNamespace, cmName));
    return job;
  }

  static String extractBrowserImage(Job jobTemplate) {
    return jobTemplate.getSpec().getTemplate().getSpec().getContainers().stream()
        .filter(c -> "browser".equals(c.getName()))
        .map(Container::getImage)
        .findFirst()
        .orElseThrow(() -> new ConfigException("No browser container found in Job template"));
  }

  String getNamespace() {
    return getNamespace(null);
  }

  String getNamespace(KubernetesClient kubeClient) {
    // Priority: config → client auto-detected namespace → "default"
    // The fabric8 KubernetesClient.getNamespace() already reads from kubeconfig,
    // in-cluster service account namespace file, and KUBERNETES_NAMESPACE env var.
    return config
        .get(K8S_SECTION, "namespace")
        .orElseGet(
            () -> {
              if (kubeClient != null) {
                try {
                  String clientNamespace = kubeClient.getNamespace();
                  if (clientNamespace != null && !clientNamespace.isEmpty()) {
                    LOG.info("Auto-detected K8s namespace from client: " + clientNamespace);
                    return clientNamespace;
                  }
                } catch (RuntimeException e) {
                  LOG.warning("Failed to read namespace from Kubernetes client: " + e.getMessage());
                }
              }
              return "default";
            });
  }

  private Duration getServerStartTimeout() {
    return Duration.ofSeconds(
        config.getInt(K8S_SECTION, "server-start-timeout").orElse(DEFAULT_SERVER_START_TIMEOUT));
  }

  private long getTerminationGracePeriod() {
    return config
        .getInt(K8S_SECTION, "termination-grace-period")
        .orElse(DEFAULT_TERMINATION_GRACE_PERIOD);
  }

  Map<String, Quantity> getResourceRequests() {
    return parseResourceMap(config.get(K8S_SECTION, "resource-requests").orElse(null));
  }

  Map<String, Quantity> getResourceLimits() {
    return parseResourceMap(config.get(K8S_SECTION, "resource-limits").orElse(null));
  }

  Map<String, String> getNodeSelector() {
    return parseKeyValueMap(config.get(K8S_SECTION, "node-selector").orElse(null));
  }

  private String getVideoImage() {
    String image = config.get(K8S_SECTION, "video-image").orElse(DEFAULT_VIDEO_IMAGE);
    if (image.equalsIgnoreCase("false")) {
      return null;
    }
    return image;
  }

  private String getAssetsPath() {
    return config.get(K8S_SECTION, "assets-path").orElse(null);
  }

  private String getLabelInheritPrefix() {
    return config.get(K8S_SECTION, "label-inherit-prefix").orElse(DEFAULT_LABEL_INHERIT_PREFIX);
  }

  boolean isRunningInKubernetes() {
    String serviceHost = System.getenv("KUBERNETES_SERVICE_HOST");
    return serviceHost != null && !serviceHost.isEmpty();
  }

  InheritedPodSpec inspectNodePod(
      KubernetesClient kubeClient, String namespace, String labelInheritPrefix, String assetsPath) {
    if (!isRunningInKubernetes()) {
      LOG.fine("Not running in Kubernetes; skipping Node Pod inspection");
      return InheritedPodSpec.empty();
    }

    String podName = System.getenv("HOSTNAME");
    if (podName == null || podName.isEmpty()) {
      LOG.warning("HOSTNAME env var not set; cannot inspect Node Pod");
      return InheritedPodSpec.empty();
    }

    try {
      Pod pod = kubeClient.pods().inNamespace(namespace).withName(podName).get();
      if (pod == null) {
        LOG.warning(String.format("Node Pod '%s' not found in namespace '%s'", podName, namespace));
        return InheritedPodSpec.empty();
      }
      PodSpec spec = pod.getSpec();
      if (spec == null) {
        LOG.warning("Node Pod spec is null");
        return InheritedPodSpec.empty();
      }

      Map<String, String> podLabels =
          pod.getMetadata() != null ? pod.getMetadata().getLabels() : null;
      Map<String, String> podAnnotations =
          pod.getMetadata() != null ? pod.getMetadata().getAnnotations() : null;
      String nodePodName =
          pod.getMetadata() != null && pod.getMetadata().getName() != null
              ? pod.getMetadata().getName()
              : podName;
      String nodePodUid = pod.getMetadata() != null ? pod.getMetadata().getUid() : null;

      // Extract container-level fields from the first container
      String containerImagePullPolicy = null;
      Map<String, Quantity> containerResourceRequests = null;
      Map<String, Quantity> containerResourceLimits = null;
      String assetsClaimName = null;
      List<Container> containers = spec.getContainers();
      if (containers != null && !containers.isEmpty()) {
        Container firstContainer = containers.get(0);
        containerImagePullPolicy = firstContainer.getImagePullPolicy();
        ResourceRequirements resources = firstContainer.getResources();
        if (resources != null) {
          containerResourceRequests = resources.getRequests();
          containerResourceLimits = resources.getLimits();
        }

        // Detect PVC mounted at assetsPath for sharing with browser Jobs
        if (assetsPath != null) {
          List<VolumeMount> volumeMounts = firstContainer.getVolumeMounts();
          if (volumeMounts != null) {
            Optional<String> mountVolumeName =
                volumeMounts.stream()
                    .filter(vm -> assetsPath.equals(vm.getMountPath()))
                    .map(VolumeMount::getName)
                    .findFirst();
            if (mountVolumeName.isPresent() && spec.getVolumes() != null) {
              assetsClaimName =
                  spec.getVolumes().stream()
                      .filter(v -> mountVolumeName.get().equals(v.getName()))
                      .filter(v -> v.getPersistentVolumeClaim() != null)
                      .map(v -> v.getPersistentVolumeClaim().getClaimName())
                      .findFirst()
                      .orElse(null);
              if (assetsClaimName != null) {
                LOG.info(
                    String.format(
                        "Detected PVC '%s' at assetsPath '%s' for browser Job sharing",
                        assetsClaimName, assetsPath));
              }
            }
          }
        }
      }

      InheritedPodSpec inherited =
          new InheritedPodSpec(
              spec.getTolerations(),
              spec.getAffinity(),
              spec.getImagePullSecrets(),
              spec.getDnsPolicy(),
              spec.getDnsConfig(),
              spec.getSecurityContext(),
              spec.getPriorityClassName(),
              spec.getNodeSelector(),
              spec.getServiceAccountName(),
              filterByPrefix(podLabels, labelInheritPrefix),
              filterByPrefix(podAnnotations, labelInheritPrefix),
              containerImagePullPolicy,
              containerResourceRequests,
              containerResourceLimits,
              assetsClaimName,
              nodePodName,
              nodePodUid);

      LOG.info(String.format("Inspected Node Pod '%s' for inheritable spec fields", podName));
      return inherited;
    } catch (KubernetesClientException e) {
      LOG.log(
          Level.WARNING,
          String.format("Failed to inspect Node Pod '%s': %s", podName, e.getMessage()),
          e);
      return InheritedPodSpec.empty();
    }
  }

  static Map<String, String> filterByPrefix(Map<String, String> map, String prefix) {
    if (map == null || map.isEmpty()) {
      return Collections.emptyMap();
    }
    if (prefix == null || prefix.isEmpty()) {
      return Collections.unmodifiableMap(new HashMap<>(map));
    }
    return map.entrySet().stream()
        .filter(e -> e.getKey().startsWith(prefix))
        .collect(Collectors.toUnmodifiableMap(Map.Entry::getKey, Map.Entry::getValue));
  }

  static Map<String, Quantity> parseResourceMap(String resourceString) {
    if (resourceString == null || resourceString.trim().isEmpty()) {
      return Collections.emptyMap();
    }
    Map<String, Quantity> resources = new HashMap<>();
    for (String entry : resourceString.split(",")) {
      String[] parts = entry.trim().split("=", 2);
      if (parts.length == 2) {
        resources.put(parts[0].trim(), new Quantity(parts[1].trim()));
      }
    }
    return resources;
  }

  static Map<String, String> parseKeyValueMap(String mapString) {
    if (mapString == null || mapString.trim().isEmpty()) {
      return Collections.emptyMap();
    }
    Map<String, String> result = new HashMap<>();
    for (String entry : mapString.split(",")) {
      String[] parts = entry.trim().split("=", 2);
      if (parts.length == 2) {
        result.put(parts[0].trim(), parts[1].trim());
      }
    }
    return result;
  }
}
