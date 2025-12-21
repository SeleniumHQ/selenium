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

import static org.openqa.selenium.grid.config.StandardGridRoles.NODE_ROLE;

import com.beust.jcommander.Parameter;
import com.google.auto.service.AutoService;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.NonSplittingSplitter;
import org.openqa.selenium.grid.config.Role;

@SuppressWarnings("FieldMayBeFinal")
@AutoService(HasRoles.class)
public class KubernetesFlags implements HasRoles {

  @Parameter(
      names = {"--k8s-kubeconfig"},
      description = "Path to kubeconfig file for Kubernetes cluster access")
  @ConfigValue(
      section = KubernetesOptions.KUBERNETES_SECTION,
      name = "kubeconfig",
      example = "\"/home/user/.kube/config\"")
  private String kubeconfig;

  @Parameter(
      names = {"--k8s-namespace"},
      description = "Kubernetes namespace for creating browser Jobs/Pods")
  @ConfigValue(
      section = KubernetesOptions.KUBERNETES_SECTION,
      name = "namespace",
      example = "\"" + KubernetesOptions.DEFAULT_NAMESPACE + "\"")
  private String namespace;

  @Parameter(
      names = {"--k8s-server-start-timeout"},
      description =
          "Max time (in seconds) to wait for the browser pod to successfully start up")
  @ConfigValue(
      section = KubernetesOptions.KUBERNETES_SECTION,
      name = "server-start-timeout",
      example = "60")
  private Integer serverStartTimeout;

  @Parameter(
      names = {"--k8s", "-K"},
      description =
          "Kubernetes configs which map image name to stereotype capabilities (example: "
              + "-K selenium/standalone-firefox:latest '{\"browserName\": \"firefox\"}')",
      arity = 2,
      variableArity = true,
      splitter = NonSplittingSplitter.class)
  @ConfigValue(
      section = KubernetesOptions.KUBERNETES_SECTION,
      name = "configs",
      example =
          "[\"selenium/standalone-firefox:latest\", \"{\\\"browserName\\\": \\\"firefox\\\"}\"]")
  private List<String> images2Capabilities;

  @Parameter(
      names = {"--k8s-cpu-request"},
      description = "CPU resource request for browser pods (e.g., '500m', '1')")
  @ConfigValue(
      section = KubernetesOptions.KUBERNETES_SECTION,
      name = "cpu-request",
      example = "\"500m\"")
  private String cpuRequest;

  @Parameter(
      names = {"--k8s-memory-request"},
      description = "Memory resource request for browser pods (e.g., '512Mi', '1Gi')")
  @ConfigValue(
      section = KubernetesOptions.KUBERNETES_SECTION,
      name = "memory-request",
      example = "\"1Gi\"")
  private String memoryRequest;

  @Parameter(
      names = {"--k8s-cpu-limit"},
      description = "CPU resource limit for browser pods (e.g., '1', '2')")
  @ConfigValue(
      section = KubernetesOptions.KUBERNETES_SECTION,
      name = "cpu-limit",
      example = "\"1\"")
  private String cpuLimit;

  @Parameter(
      names = {"--k8s-memory-limit"},
      description = "Memory resource limit for browser pods (e.g., '1Gi', '2Gi')")
  @ConfigValue(
      section = KubernetesOptions.KUBERNETES_SECTION,
      name = "memory-limit",
      example = "\"2Gi\"")
  private String memoryLimit;

  @Parameter(
      names = {"--k8s-labels"},
      description = "Custom labels to apply to browser Jobs/Pods (key-value pairs)",
      arity = 2,
      variableArity = true,
      splitter = NonSplittingSplitter.class)
  @ConfigValue(
      section = KubernetesOptions.KUBERNETES_SECTION,
      name = "labels",
      example = "[\"environment\", \"production\", \"team\", \"qa\"]")
  private List<String> labels;

  @Parameter(
      names = {"--k8s-annotations"},
      description = "Custom annotations to apply to browser Jobs/Pods (key-value pairs)",
      arity = 2,
      variableArity = true,
      splitter = NonSplittingSplitter.class)
  @ConfigValue(
      section = KubernetesOptions.KUBERNETES_SECTION,
      name = "annotations",
      example = "[\"prometheus.io/scrape\", \"true\"]")
  private List<String> annotations;

  @Parameter(
      names = {"--k8s-video-image"},
      description = "Docker/Container image to be used when video recording is enabled")
  @ConfigValue(
      section = KubernetesOptions.KUBERNETES_SECTION,
      name = "video-image",
      example = "\"selenium/video:latest\"")
  private String videoImage = KubernetesOptions.DEFAULT_VIDEO_IMAGE;

  @Parameter(
      names = {"--k8s-assets-path"},
      description = "Absolute path where session assets (logs, videos) will be stored")
  @ConfigValue(
      section = KubernetesOptions.KUBERNETES_SECTION,
      name = "assets-path",
      example = "\"" + KubernetesOptions.DEFAULT_ASSETS_PATH + "\"")
  private String assetsPath;

  @Parameter(
      names = {"--k8s-image-pull-policy"},
      description = "Image pull policy for browser containers (Always, IfNotPresent, Never)")
  @ConfigValue(
      section = KubernetesOptions.KUBERNETES_SECTION,
      name = "image-pull-policy",
      example = "\"IfNotPresent\"")
  private String imagePullPolicy;

  // Kept from original OneShotFlags for backward compatibility
  @Parameter(
      names = {"--driver-name"},
      description = "Name of the browser to use (optional, for OneShotNode)")
  @ConfigValue(section = "k8s", name = "driver_name", example = "firefox")
  private String driverBinary;

  @Parameter(
      names = {"--stereotype"},
      description = "Stringified JSON representing browser stereotype (for OneShotNode)")
  @ConfigValue(
      section = "k8s",
      name = "stereotype",
      example = "\"{\\\"browserName\\\": \\\"firefox\\\"}\"")
  private String stereotype;

  @Override
  public Set<Role> getRoles() {
    return Collections.singleton(NODE_ROLE);
  }
}
