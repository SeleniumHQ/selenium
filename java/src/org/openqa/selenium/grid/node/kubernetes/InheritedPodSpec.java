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

import io.fabric8.kubernetes.api.model.Affinity;
import io.fabric8.kubernetes.api.model.LocalObjectReference;
import io.fabric8.kubernetes.api.model.PodDNSConfig;
import io.fabric8.kubernetes.api.model.PodSecurityContext;
import io.fabric8.kubernetes.api.model.Quantity;
import io.fabric8.kubernetes.api.model.Toleration;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.jspecify.annotations.Nullable;

public class InheritedPodSpec {

  private final List<Toleration> tolerations;
  private final @Nullable Affinity affinity;
  private final List<LocalObjectReference> imagePullSecrets;
  private final @Nullable String dnsPolicy;
  private final @Nullable PodDNSConfig dnsConfig;
  private final @Nullable PodSecurityContext securityContext;
  private final @Nullable String priorityClassName;
  private final Map<String, String> nodeSelector;
  private final @Nullable String serviceAccountName;
  private final Map<String, String> labels;
  private final Map<String, String> annotations;
  private final @Nullable String imagePullPolicy;
  private final Map<String, Quantity> resourceRequests;
  private final Map<String, Quantity> resourceLimits;
  private final @Nullable String assetsClaimName;
  private final @Nullable String nodePodName;
  private final @Nullable String nodePodUid;

  public InheritedPodSpec(
      @Nullable List<Toleration> tolerations,
      @Nullable Affinity affinity,
      @Nullable List<LocalObjectReference> imagePullSecrets,
      @Nullable String dnsPolicy,
      @Nullable PodDNSConfig dnsConfig,
      @Nullable PodSecurityContext securityContext,
      @Nullable String priorityClassName,
      @Nullable Map<String, String> nodeSelector,
      @Nullable String serviceAccountName,
      @Nullable Map<String, String> labels,
      @Nullable Map<String, String> annotations,
      @Nullable String imagePullPolicy,
      @Nullable Map<String, Quantity> resourceRequests,
      @Nullable Map<String, Quantity> resourceLimits,
      @Nullable String assetsClaimName) {
    this(
        tolerations,
        affinity,
        imagePullSecrets,
        dnsPolicy,
        dnsConfig,
        securityContext,
        priorityClassName,
        nodeSelector,
        serviceAccountName,
        labels,
        annotations,
        imagePullPolicy,
        resourceRequests,
        resourceLimits,
        assetsClaimName,
        null,
        null);
  }

  public InheritedPodSpec(
      @Nullable List<Toleration> tolerations,
      @Nullable Affinity affinity,
      @Nullable List<LocalObjectReference> imagePullSecrets,
      @Nullable String dnsPolicy,
      @Nullable PodDNSConfig dnsConfig,
      @Nullable PodSecurityContext securityContext,
      @Nullable String priorityClassName,
      @Nullable Map<String, String> nodeSelector,
      @Nullable String serviceAccountName,
      @Nullable Map<String, String> labels,
      @Nullable Map<String, String> annotations,
      @Nullable String imagePullPolicy,
      @Nullable Map<String, Quantity> resourceRequests,
      @Nullable Map<String, Quantity> resourceLimits,
      @Nullable String assetsClaimName,
      @Nullable String nodePodName,
      @Nullable String nodePodUid) {
    this.tolerations = tolerations != null ? List.copyOf(tolerations) : List.of();
    this.affinity = affinity;
    this.imagePullSecrets = imagePullSecrets != null ? List.copyOf(imagePullSecrets) : List.of();
    this.dnsPolicy = dnsPolicy;
    this.dnsConfig = dnsConfig;
    this.securityContext = securityContext;
    this.priorityClassName = priorityClassName;
    this.nodeSelector = nodeSelector != null ? Collections.unmodifiableMap(nodeSelector) : Map.of();
    this.serviceAccountName = serviceAccountName;
    this.labels = labels != null ? Collections.unmodifiableMap(labels) : Map.of();
    this.annotations = annotations != null ? Collections.unmodifiableMap(annotations) : Map.of();
    this.imagePullPolicy = imagePullPolicy;
    this.resourceRequests =
        resourceRequests != null ? Collections.unmodifiableMap(resourceRequests) : Map.of();
    this.resourceLimits =
        resourceLimits != null ? Collections.unmodifiableMap(resourceLimits) : Map.of();
    this.assetsClaimName = assetsClaimName;
    this.nodePodName = nodePodName;
    this.nodePodUid = nodePodUid;
  }

  public static InheritedPodSpec empty() {
    return new InheritedPodSpec(
        null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
  }

  public boolean hasInheritedFields() {
    return !tolerations.isEmpty()
        || affinity != null
        || !imagePullSecrets.isEmpty()
        || dnsPolicy != null
        || dnsConfig != null
        || securityContext != null
        || priorityClassName != null
        || !nodeSelector.isEmpty()
        || serviceAccountName != null
        || !labels.isEmpty()
        || !annotations.isEmpty()
        || imagePullPolicy != null
        || !resourceRequests.isEmpty()
        || !resourceLimits.isEmpty()
        || assetsClaimName != null
        || hasNodePodOwnerReference();
  }

  public List<Toleration> getTolerations() {
    return tolerations;
  }

  @Nullable
  public Affinity getAffinity() {
    return affinity;
  }

  public List<LocalObjectReference> getImagePullSecrets() {
    return imagePullSecrets;
  }

  @Nullable
  public String getDnsPolicy() {
    return dnsPolicy;
  }

  @Nullable
  public PodDNSConfig getDnsConfig() {
    return dnsConfig;
  }

  @Nullable
  public PodSecurityContext getSecurityContext() {
    return securityContext;
  }

  @Nullable
  public String getPriorityClassName() {
    return priorityClassName;
  }

  public Map<String, String> getNodeSelector() {
    return nodeSelector;
  }

  @Nullable
  public String getServiceAccountName() {
    return serviceAccountName;
  }

  public Map<String, String> getLabels() {
    return labels;
  }

  public Map<String, String> getAnnotations() {
    return annotations;
  }

  @Nullable
  public String getImagePullPolicy() {
    return imagePullPolicy;
  }

  public Map<String, Quantity> getResourceRequests() {
    return resourceRequests;
  }

  public Map<String, Quantity> getResourceLimits() {
    return resourceLimits;
  }

  @Nullable
  public String getAssetsClaimName() {
    return assetsClaimName;
  }

  public boolean hasNodePodOwnerReference() {
    return nodePodName != null
        && !nodePodName.isEmpty()
        && nodePodUid != null
        && !nodePodUid.isEmpty();
  }

  @Nullable
  public String getNodePodName() {
    return nodePodName;
  }

  @Nullable
  public String getNodePodUid() {
    return nodePodUid;
  }
}
