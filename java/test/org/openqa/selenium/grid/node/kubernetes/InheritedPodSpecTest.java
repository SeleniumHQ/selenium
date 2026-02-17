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

import static org.assertj.core.api.Assertions.assertThat;

import io.fabric8.kubernetes.api.model.Affinity;
import io.fabric8.kubernetes.api.model.AffinityBuilder;
import io.fabric8.kubernetes.api.model.LocalObjectReference;
import io.fabric8.kubernetes.api.model.LocalObjectReferenceBuilder;
import io.fabric8.kubernetes.api.model.NodeAffinity;
import io.fabric8.kubernetes.api.model.PodDNSConfig;
import io.fabric8.kubernetes.api.model.PodDNSConfigBuilder;
import io.fabric8.kubernetes.api.model.PodSecurityContext;
import io.fabric8.kubernetes.api.model.PodSecurityContextBuilder;
import io.fabric8.kubernetes.api.model.Quantity;
import io.fabric8.kubernetes.api.model.Toleration;
import io.fabric8.kubernetes.api.model.TolerationBuilder;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class InheritedPodSpecTest {

  @Test
  void emptySpecHasNoInheritedFields() {
    InheritedPodSpec spec = InheritedPodSpec.empty();
    assertThat(spec.hasInheritedFields()).isFalse();
    assertThat(spec.getTolerations()).isEmpty();
    assertThat(spec.getAffinity()).isNull();
    assertThat(spec.getImagePullSecrets()).isEmpty();
    assertThat(spec.getDnsPolicy()).isNull();
    assertThat(spec.getDnsConfig()).isNull();
    assertThat(spec.getSecurityContext()).isNull();
    assertThat(spec.getPriorityClassName()).isNull();
    assertThat(spec.getNodeSelector()).isEmpty();
    assertThat(spec.getServiceAccountName()).isNull();
    assertThat(spec.getLabels()).isEmpty();
    assertThat(spec.getAnnotations()).isEmpty();
    assertThat(spec.getImagePullPolicy()).isNull();
    assertThat(spec.getResourceRequests()).isEmpty();
    assertThat(spec.getResourceLimits()).isEmpty();
    assertThat(spec.getAssetsClaimName()).isNull();
    assertThat(spec.getNodePodName()).isNull();
    assertThat(spec.getNodePodUid()).isNull();
    assertThat(spec.hasNodePodOwnerReference()).isFalse();
  }

  @Test
  void specWithTolerationsHasInheritedFields() {
    Toleration toleration =
        new TolerationBuilder()
            .withKey("gpu")
            .withOperator("Exists")
            .withEffect("NoSchedule")
            .build();
    InheritedPodSpec spec =
        new InheritedPodSpec(
            List.of(toleration),
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null);
    assertThat(spec.hasInheritedFields()).isTrue();
    assertThat(spec.getTolerations()).hasSize(1);
    assertThat(spec.getTolerations().get(0).getKey()).isEqualTo("gpu");
  }

  @Test
  void specWithAffinityHasInheritedFields() {
    Affinity affinity = new AffinityBuilder().withNodeAffinity(new NodeAffinity()).build();
    InheritedPodSpec spec =
        new InheritedPodSpec(
            null, affinity, null, null, null, null, null, null, null, null, null, null, null, null,
            null);
    assertThat(spec.hasInheritedFields()).isTrue();
    assertThat(spec.getAffinity()).isNotNull();
  }

  @Test
  void specWithImagePullSecretsHasInheritedFields() {
    LocalObjectReference secret =
        new LocalObjectReferenceBuilder().withName("my-registry-secret").build();
    InheritedPodSpec spec =
        new InheritedPodSpec(
            null,
            null,
            List.of(secret),
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null);
    assertThat(spec.hasInheritedFields()).isTrue();
    assertThat(spec.getImagePullSecrets()).hasSize(1);
    assertThat(spec.getImagePullSecrets().get(0).getName()).isEqualTo("my-registry-secret");
  }

  @Test
  void specWithDnsPolicyHasInheritedFields() {
    InheritedPodSpec spec =
        new InheritedPodSpec(
            null,
            null,
            null,
            "ClusterFirst",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null);
    assertThat(spec.hasInheritedFields()).isTrue();
    assertThat(spec.getDnsPolicy()).isEqualTo("ClusterFirst");
  }

  @Test
  void specWithDnsConfigHasInheritedFields() {
    PodDNSConfig dnsConfig = new PodDNSConfigBuilder().withNameservers("8.8.8.8").build();
    InheritedPodSpec spec =
        new InheritedPodSpec(
            null, null, null, null, dnsConfig, null, null, null, null, null, null, null, null, null,
            null);
    assertThat(spec.hasInheritedFields()).isTrue();
    assertThat(spec.getDnsConfig()).isNotNull();
  }

  @Test
  void specWithSecurityContextHasInheritedFields() {
    PodSecurityContext secCtx = new PodSecurityContextBuilder().withRunAsUser(1000L).build();
    InheritedPodSpec spec =
        new InheritedPodSpec(
            null, null, null, null, null, secCtx, null, null, null, null, null, null, null, null,
            null);
    assertThat(spec.hasInheritedFields()).isTrue();
    assertThat(spec.getSecurityContext()).isNotNull();
  }

  @Test
  void specWithPriorityClassHasInheritedFields() {
    InheritedPodSpec spec =
        new InheritedPodSpec(
            null,
            null,
            null,
            null,
            null,
            null,
            "high-priority",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null);
    assertThat(spec.hasInheritedFields()).isTrue();
    assertThat(spec.getPriorityClassName()).isEqualTo("high-priority");
  }

  @Test
  void specWithNodeSelectorHasInheritedFields() {
    InheritedPodSpec spec =
        new InheritedPodSpec(
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            Map.of("disktype", "ssd"),
            null,
            null,
            null,
            null,
            null,
            null,
            null);
    assertThat(spec.hasInheritedFields()).isTrue();
    assertThat(spec.getNodeSelector()).containsEntry("disktype", "ssd");
  }

  @Test
  void specWithServiceAccountHasInheritedFields() {
    InheritedPodSpec spec =
        new InheritedPodSpec(
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "selenium-sa",
            null,
            null,
            null,
            null,
            null,
            null);
    assertThat(spec.hasInheritedFields()).isTrue();
    assertThat(spec.getServiceAccountName()).isEqualTo("selenium-sa");
  }

  @Test
  void specWithLabelsHasInheritedFields() {
    InheritedPodSpec spec =
        new InheritedPodSpec(
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            Map.of("se/component", "node"),
            null,
            null,
            null,
            null,
            null);
    assertThat(spec.hasInheritedFields()).isTrue();
    assertThat(spec.getLabels()).containsEntry("se/component", "node");
  }

  @Test
  void specWithAnnotationsHasInheritedFields() {
    InheritedPodSpec spec =
        new InheritedPodSpec(
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            Map.of("se/owner", "grid"),
            null,
            null,
            null,
            null);
    assertThat(spec.hasInheritedFields()).isTrue();
    assertThat(spec.getAnnotations()).containsEntry("se/owner", "grid");
  }

  @Test
  void specWithImagePullPolicyHasInheritedFields() {
    InheritedPodSpec spec =
        new InheritedPodSpec(
            null, null, null, null, null, null, null, null, null, null, null, "Always", null, null,
            null);
    assertThat(spec.hasInheritedFields()).isTrue();
    assertThat(spec.getImagePullPolicy()).isEqualTo("Always");
  }

  @Test
  void specWithResourceRequestsHasInheritedFields() {
    Map<String, Quantity> requests =
        Map.of("cpu", new Quantity("500m"), "memory", new Quantity("512Mi"));
    InheritedPodSpec spec =
        new InheritedPodSpec(
            null, null, null, null, null, null, null, null, null, null, null, null, requests, null,
            null);
    assertThat(spec.hasInheritedFields()).isTrue();
    assertThat(spec.getResourceRequests()).hasSize(2);
    assertThat(spec.getResourceRequests()).containsKey("cpu");
    assertThat(spec.getResourceRequests()).containsKey("memory");
  }

  @Test
  void specWithResourceLimitsHasInheritedFields() {
    Map<String, Quantity> limits = Map.of("cpu", new Quantity("1"), "memory", new Quantity("1Gi"));
    InheritedPodSpec spec =
        new InheritedPodSpec(
            null, null, null, null, null, null, null, null, null, null, null, null, null, limits,
            null);
    assertThat(spec.hasInheritedFields()).isTrue();
    assertThat(spec.getResourceLimits()).hasSize(2);
    assertThat(spec.getResourceLimits()).containsKey("cpu");
    assertThat(spec.getResourceLimits()).containsKey("memory");
  }

  @Test
  void specWithMultipleFieldsStoresAll() {
    Toleration toleration = new TolerationBuilder().withKey("gpu").withOperator("Exists").build();
    Affinity affinity = new Affinity();
    LocalObjectReference secret = new LocalObjectReferenceBuilder().withName("registry").build();
    PodSecurityContext secCtx = new PodSecurityContextBuilder().withRunAsUser(1000L).build();
    Map<String, Quantity> requests = Map.of("cpu", new Quantity("500m"));
    Map<String, Quantity> limits = Map.of("cpu", new Quantity("1"));

    InheritedPodSpec spec =
        new InheritedPodSpec(
            List.of(toleration),
            affinity,
            List.of(secret),
            "ClusterFirst",
            null,
            secCtx,
            "high-priority",
            Map.of("zone", "us-west"),
            "selenium-sa",
            Map.of("se/app", "grid"),
            Map.of("se/version", "4"),
            "IfNotPresent",
            requests,
            limits,
            "selenium-assets-pvc");

    assertThat(spec.hasInheritedFields()).isTrue();
    assertThat(spec.getTolerations()).hasSize(1);
    assertThat(spec.getAffinity()).isNotNull();
    assertThat(spec.getImagePullSecrets()).hasSize(1);
    assertThat(spec.getDnsPolicy()).isEqualTo("ClusterFirst");
    assertThat(spec.getSecurityContext()).isNotNull();
    assertThat(spec.getPriorityClassName()).isEqualTo("high-priority");
    assertThat(spec.getNodeSelector()).containsEntry("zone", "us-west");
    assertThat(spec.getServiceAccountName()).isEqualTo("selenium-sa");
    assertThat(spec.getLabels()).containsEntry("se/app", "grid");
    assertThat(spec.getAnnotations()).containsEntry("se/version", "4");
    assertThat(spec.getImagePullPolicy()).isEqualTo("IfNotPresent");
    assertThat(spec.getResourceRequests()).containsKey("cpu");
    assertThat(spec.getResourceLimits()).containsKey("cpu");
    assertThat(spec.getAssetsClaimName()).isEqualTo("selenium-assets-pvc");
  }

  @Test
  void specWithAssetsClaimNameHasInheritedFields() {
    InheritedPodSpec spec =
        new InheritedPodSpec(
            null, null, null, null, null, null, null, null, null, null, null, null, null, null,
            "my-pvc");
    assertThat(spec.hasInheritedFields()).isTrue();
    assertThat(spec.getAssetsClaimName()).isEqualTo("my-pvc");
  }

  @Test
  void specWithNodePodOwnerReferenceHasInheritedFields() {
    InheritedPodSpec spec =
        new InheritedPodSpec(
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "node-pod-abc",
            "12345-uid");
    assertThat(spec.hasInheritedFields()).isTrue();
    assertThat(spec.hasNodePodOwnerReference()).isTrue();
    assertThat(spec.getNodePodName()).isEqualTo("node-pod-abc");
    assertThat(spec.getNodePodUid()).isEqualTo("12345-uid");
  }
}
