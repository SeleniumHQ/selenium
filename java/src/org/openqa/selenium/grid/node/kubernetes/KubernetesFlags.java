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
      names = {"--kubernetes-url"},
      description =
          "Kubernetes API server URL. When set, connects to a remote cluster "
              + "instead of using in-cluster or kubeconfig auto-discovery.")
  @ConfigValue(
      section = KubernetesOptions.K8S_SECTION,
      name = "url",
      example = "\"https://my-k8s-cluster:6443\"")
  private String url;

  @Parameter(
      names = {"--kubernetes-configs", "-K"},
      description =
          "Kubernetes configs which map image name to stereotype capabilities (example: "
              + "-K selenium/standalone-firefox:latest '{\"browserName\": \"firefox\"}')",
      arity = 2,
      variableArity = true,
      splitter = NonSplittingSplitter.class)
  @ConfigValue(
      section = KubernetesOptions.K8S_SECTION,
      name = "configs",
      example =
          "[\"selenium/standalone-firefox:latest\", \"{\\\"browserName\\\": \\\"firefox\\\"}\"]")
  private List<String> images2Capabilities;

  @Parameter(
      names = {"--kubernetes-namespace"},
      description = "Kubernetes namespace to create browser Jobs in")
  @ConfigValue(
      section = KubernetesOptions.K8S_SECTION,
      name = "namespace",
      example = "\"selenium\"")
  private String namespace;

  @Parameter(
      names = {"--kubernetes-service-account"},
      description =
          "Override service account for browser Jobs. "
              + "Auto-inherited from the Node Pod when running in K8s.")
  @ConfigValue(
      section = KubernetesOptions.K8S_SECTION,
      name = "service-account",
      example = "\"selenium-session\"")
  private String serviceAccount;

  @Parameter(
      names = {"--kubernetes-image-pull-policy"},
      description =
          "Override image pull policy for browser containers (Always, IfNotPresent, Never). "
              + "Auto-inherited from the Node Pod when running in K8s.")
  @ConfigValue(
      section = KubernetesOptions.K8S_SECTION,
      name = "image-pull-policy",
      example = "\"IfNotPresent\"")
  private String imagePullPolicy;

  @Parameter(
      names = {"--kubernetes-server-start-timeout"},
      description =
          "Max time (in seconds) to wait for the browser server to start up in the K8s Pod")
  @ConfigValue(
      section = KubernetesOptions.K8S_SECTION,
      name = "server-start-timeout",
      example = "120")
  private Integer serverStartTimeout;

  @Parameter(
      names = {"--kubernetes-termination-grace-period"},
      description =
          "Seconds to wait for containers to shut down gracefully before force-killing them")
  @ConfigValue(
      section = KubernetesOptions.K8S_SECTION,
      name = "termination-grace-period",
      example = "30")
  private Integer terminationGracePeriod;

  @Parameter(
      names = {"--kubernetes-resource-requests"},
      description =
          "Override resource requests for browser containers (example: cpu=500m,memory=512Mi). "
              + "Auto-inherited from the Node Pod when running in K8s.",
      splitter = NonSplittingSplitter.class)
  @ConfigValue(
      section = KubernetesOptions.K8S_SECTION,
      name = "resource-requests",
      example = "\"cpu=500m,memory=512Mi\"")
  private String resourceRequests;

  @Parameter(
      names = {"--kubernetes-resource-limits"},
      description =
          "Override resource limits for browser containers (example: cpu=1,memory=1Gi). "
              + "Auto-inherited from the Node Pod when running in K8s.",
      splitter = NonSplittingSplitter.class)
  @ConfigValue(
      section = KubernetesOptions.K8S_SECTION,
      name = "resource-limits",
      example = "\"cpu=1,memory=1Gi\"")
  private String resourceLimits;

  @Parameter(
      names = {"--kubernetes-node-selector"},
      description =
          "Override node selector for scheduling browser Pods (example:"
              + " disktype=ssd,region=us-west). Auto-inherited from the Node Pod when running in"
              + " K8s.",
      splitter = NonSplittingSplitter.class)
  @ConfigValue(
      section = KubernetesOptions.K8S_SECTION,
      name = "node-selector",
      example = "\"disktype=ssd,region=us-west\"")
  private String nodeSelector;

  @Parameter(
      names = {"--kubernetes-video-image"},
      description = "Container image to use as a video recording sidecar")
  @ConfigValue(
      section = KubernetesOptions.K8S_SECTION,
      name = "video-image",
      example = KubernetesOptions.DEFAULT_VIDEO_IMAGE)
  private String videoImage = KubernetesOptions.DEFAULT_VIDEO_IMAGE;

  @Parameter(
      names = {"--kubernetes-assets-path"},
      description = "Absolute path where session assets will be stored")
  @ConfigValue(
      section = KubernetesOptions.K8S_SECTION,
      name = "assets-path",
      example = "\"" + KubernetesOptions.DEFAULT_ASSETS_PATH + "\"")
  private String assetsPath;

  @Parameter(
      names = {"--kubernetes-label-inherit-prefix"},
      description =
          "Prefix filter for inheriting labels/annotations from the Node Pod to browser Jobs. "
              + "Only labels/annotations starting with this prefix are inherited. "
              + "Empty string inherits all.")
  @ConfigValue(
      section = KubernetesOptions.K8S_SECTION,
      name = "label-inherit-prefix",
      example = "\"" + KubernetesOptions.DEFAULT_LABEL_INHERIT_PREFIX + "\"")
  private String labelInheritPrefix = KubernetesOptions.DEFAULT_LABEL_INHERIT_PREFIX;

  @Override
  public Set<Role> getRoles() {
    return Collections.singleton(NODE_ROLE);
  }
}
