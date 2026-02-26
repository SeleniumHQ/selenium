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

public class InheritedPodSpec {

  private final List<Toleration> tolerations;
  private final Affinity affinity;
  private final List<LocalObjectReference> imagePullSecrets;
  private final String dnsPolicy;
  private final PodDNSConfig dnsConfig;
  private final PodSecurityContext securityContext;
  private final String priorityClassName;
  private final Map<String, String> nodeSelector;
  private final String serviceAccountName;
  private final Map<String, String> labels;
  private final Map<String, String> annotations;
  private final String imagePullPolicy;
  private final Map<String, Quantity> resourceRequests;
  private final Map<String, Quantity> resourceLimits;
  private final String assetsClaimName;
  private final String nodePodName;
  private final String nodePodUid;

  public InheritedPodSpec(
      List<Toleration> tolerations,
      Affinity affinity,
      List<LocalObjectReference> imagePullSecrets,
      String dnsPolicy,
      PodDNSConfig dnsConfig,
      PodSecurityContext securityContext,
      String priorityClassName,
      Map<String, String> nodeSelector,
      String serviceAccountName,
      Map<String, String> labels,
      Map<String, String> annotations,
      String imagePullPolicy,
      Map<String, Quantity> resourceRequests,
      Map<String, Quantity> resourceLimits,
      String assetsClaimName) {
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
      List<Toleration> tolerations,
      Affinity affinity,
      List<LocalObjectReference> imagePullSecrets,
      String dnsPolicy,
      PodDNSConfig dnsConfig,
      PodSecurityContext securityContext,
      String priorityClassName,
      Map<String, String> nodeSelector,
      String serviceAccountName,
      Map<String, String> labels,
      Map<String, String> annotations,
      String imagePullPolicy,
      Map<String, Quantity> resourceRequests,
      Map<String, Quantity> resourceLimits,
      String assetsClaimName,
      String nodePodName,
      String nodePodUid) {
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

  public Affinity getAffinity() {
    return affinity;
  }

  public List<LocalObjectReference> getImagePullSecrets() {
    return imagePullSecrets;
  }

  public String getDnsPolicy() {
    return dnsPolicy;
  }

  public PodDNSConfig getDnsConfig() {
    return dnsConfig;
  }

  public PodSecurityContext getSecurityContext() {
    return securityContext;
  }

  public String getPriorityClassName() {
    return priorityClassName;
  }

  public Map<String, String> getNodeSelector() {
    return nodeSelector;
  }

  public String getServiceAccountName() {
    return serviceAccountName;
  }

  public Map<String, String> getLabels() {
    return labels;
  }

  public Map<String, String> getAnnotations() {
    return annotations;
  }

  public String getImagePullPolicy() {
    return imagePullPolicy;
  }

  public Map<String, Quantity> getResourceRequests() {
    return resourceRequests;
  }

  public Map<String, Quantity> getResourceLimits() {
    return resourceLimits;
  }

  public String getAssetsClaimName() {
    return assetsClaimName;
  }

  public boolean hasNodePodOwnerReference() {
    return nodePodName != null
        && !nodePodName.isEmpty()
        && nodePodUid != null
        && !nodePodUid.isEmpty();
  }

  public String getNodePodName() {
    return nodePodName;
  }

  public String getNodePodUid() {
    return nodePodUid;
  }
}
