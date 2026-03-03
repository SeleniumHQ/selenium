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
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.fabric8.kubernetes.api.model.ConfigMap;
import io.fabric8.kubernetes.api.model.ConfigMapBuilder;
import io.fabric8.kubernetes.api.model.Quantity;
import io.fabric8.kubernetes.api.model.batch.v1.Job;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.dsl.MixedOperation;
import io.fabric8.kubernetes.client.dsl.Resource;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;

class KubernetesOptionsTest {

  @Test
  void shouldParseResourceRequests() {
    Map<String, Quantity> resources = KubernetesOptions.parseResourceMap("cpu=500m,memory=512Mi");
    assertThat(resources).hasSize(2);
    assertThat(resources).containsKey("cpu");
    assertThat(resources).containsKey("memory");
    assertThat(resources.get("cpu")).isEqualTo(new Quantity("500m"));
    assertThat(resources.get("memory")).isEqualTo(new Quantity("512Mi"));
  }

  @Test
  void shouldParseResourceLimits() {
    Map<String, Quantity> resources = KubernetesOptions.parseResourceMap("cpu=1,memory=1Gi");
    assertThat(resources).hasSize(2);
    assertThat(resources).containsKey("cpu");
    assertThat(resources).containsKey("memory");
  }

  @Test
  void shouldReturnEmptyMapForNullResourceString() {
    Map<String, Quantity> resources = KubernetesOptions.parseResourceMap(null);
    assertThat(resources).isEmpty();
  }

  @Test
  void shouldReturnEmptyMapForEmptyResourceString() {
    Map<String, Quantity> resources = KubernetesOptions.parseResourceMap("");
    assertThat(resources).isEmpty();
  }

  @Test
  void shouldParseNodeSelector() {
    Map<String, String> selector =
        KubernetesOptions.parseKeyValueMap("disktype=ssd,region=us-west");
    assertThat(selector).hasSize(2);
    assertThat(selector).containsEntry("disktype", "ssd");
    assertThat(selector).containsEntry("region", "us-west");
  }

  @Test
  void shouldReturnEmptyMapForNullNodeSelector() {
    Map<String, String> selector = KubernetesOptions.parseKeyValueMap(null);
    assertThat(selector).isEmpty();
  }

  @Test
  void shouldReturnEmptyMapForEmptyNodeSelector() {
    Map<String, String> selector = KubernetesOptions.parseKeyValueMap("");
    assertThat(selector).isEmpty();
  }

  @Test
  void shouldParseSingleKeyValuePair() {
    Map<String, String> selector = KubernetesOptions.parseKeyValueMap("key=value");
    assertThat(selector).hasSize(1);
    assertThat(selector).containsEntry("key", "value");
  }

  @Test
  void shouldHandleWhitespaceInKeyValuePairs() {
    Map<String, String> selector =
        KubernetesOptions.parseKeyValueMap(" key1 = value1 , key2 = value2 ");
    assertThat(selector).hasSize(2);
    assertThat(selector).containsEntry("key1", "value1");
    assertThat(selector).containsEntry("key2", "value2");
  }

  @Test
  void shouldDefaultNamespaceWhenNotConfigured() {
    Config config = Mockito.mock(Config.class);
    Mockito.when(config.get("kubernetes", "namespace")).thenReturn(Optional.empty());
    KubernetesOptions options = new KubernetesOptions(config);
    // When not running in-cluster and no config, defaults to "default"
    String namespace = options.getNamespace();
    assertThat(namespace).isNotNull();
    assertThat(namespace).isNotEmpty();
  }

  @Test
  void shouldUseConfiguredNamespace() {
    Config config = Mockito.mock(Config.class);
    Mockito.when(config.get("kubernetes", "namespace")).thenReturn(Optional.of("selenium"));
    KubernetesOptions options = new KubernetesOptions(config);
    assertThat(options.getNamespace()).isEqualTo("selenium");
  }

  @Test
  void shouldPreferClientNamespaceWhenNoConfig() {
    Config config = Mockito.mock(Config.class);
    Mockito.when(config.get("kubernetes", "namespace")).thenReturn(Optional.empty());
    KubernetesClient client = Mockito.mock(KubernetesClient.class);
    Mockito.when(client.getNamespace()).thenReturn("from-client");
    KubernetesOptions options = new KubernetesOptions(config);
    assertThat(options.getNamespace(client)).isEqualTo("from-client");
  }

  @Test
  void shouldReturnEmptyResourceRequestsWhenNotConfigured() {
    Config config = Mockito.mock(Config.class);
    Mockito.when(config.get("kubernetes", "resource-requests")).thenReturn(Optional.empty());
    KubernetesOptions options = new KubernetesOptions(config);
    assertThat(options.getResourceRequests()).isEmpty();
  }

  @Test
  void shouldReturnEmptyResourceLimitsWhenNotConfigured() {
    Config config = Mockito.mock(Config.class);
    Mockito.when(config.get("kubernetes", "resource-limits")).thenReturn(Optional.empty());
    KubernetesOptions options = new KubernetesOptions(config);
    assertThat(options.getResourceLimits()).isEmpty();
  }

  @Test
  void shouldReturnEmptyNodeSelectorWhenNotConfigured() {
    Config config = Mockito.mock(Config.class);
    Mockito.when(config.get("kubernetes", "node-selector")).thenReturn(Optional.empty());
    KubernetesOptions options = new KubernetesOptions(config);
    assertThat(options.getNodeSelector()).isEmpty();
  }

  @Test
  void shouldParseResourceWithEqualsInValue() {
    Map<String, Quantity> resources = KubernetesOptions.parseResourceMap("cpu=500m");
    assertThat(resources).hasSize(1);
    assertThat(resources.get("cpu")).isEqualTo(new Quantity("500m"));
  }

  @Test
  void filterByPrefixShouldReturnMatchingEntries() {
    Map<String, String> input =
        Map.of(
            "se/component", "node",
            "se/browser", "chrome",
            "app", "selenium",
            "version", "4");
    Map<String, String> filtered = KubernetesOptions.filterByPrefix(input, "se/");
    assertThat(filtered).hasSize(2);
    assertThat(filtered).containsEntry("se/component", "node");
    assertThat(filtered).containsEntry("se/browser", "chrome");
    assertThat(filtered).doesNotContainKey("app");
  }

  @Test
  void filterByPrefixWithEmptyPrefixReturnsAll() {
    Map<String, String> input = Map.of("key1", "val1", "key2", "val2");
    Map<String, String> filtered = KubernetesOptions.filterByPrefix(input, "");
    assertThat(filtered).hasSize(2);
    assertThat(filtered).containsEntry("key1", "val1");
    assertThat(filtered).containsEntry("key2", "val2");
  }

  @Test
  void filterByPrefixWithNullPrefixReturnsAll() {
    Map<String, String> input = Map.of("a", "1", "b", "2");
    Map<String, String> filtered = KubernetesOptions.filterByPrefix(input, null);
    assertThat(filtered).hasSize(2);
  }

  @Test
  void filterByPrefixWithNullMapReturnsEmpty() {
    Map<String, String> filtered = KubernetesOptions.filterByPrefix(null, "se/");
    assertThat(filtered).isEmpty();
  }

  @Test
  void filterByPrefixWithEmptyMapReturnsEmpty() {
    Map<String, String> filtered = KubernetesOptions.filterByPrefix(Map.of(), "se/");
    assertThat(filtered).isEmpty();
  }

  @Test
  void filterByPrefixWithNoMatchesReturnsEmpty() {
    Map<String, String> input = Map.of("app", "selenium", "version", "4");
    Map<String, String> filtered = KubernetesOptions.filterByPrefix(input, "se/");
    assertThat(filtered).isEmpty();
  }

  @Test
  void buildKubernetesClientWithUrlShouldNotThrow() {
    Config config = Mockito.mock(Config.class);
    Mockito.when(config.get("kubernetes", "url"))
        .thenReturn(Optional.of("https://my-k8s-cluster:6443"));
    KubernetesOptions options = new KubernetesOptions(config);

    assertThatCode(
            () -> {
              try (KubernetesClient client = options.buildKubernetesClient()) {
                assertThat(client).isNotNull();
                assertThat(client.getConfiguration().getMasterUrl())
                    .isEqualTo("https://my-k8s-cluster:6443/");
              }
            })
        .doesNotThrowAnyException();
  }

  @Test
  void buildKubernetesClientWithoutUrlShouldUseDefaultDiscovery() {
    Config config = Mockito.mock(Config.class);
    Mockito.when(config.get("kubernetes", "url")).thenReturn(Optional.empty());
    KubernetesOptions options = new KubernetesOptions(config);

    assertThatCode(
            () -> {
              try (KubernetesClient client = options.buildKubernetesClient()) {
                assertThat(client).isNotNull();
              }
            })
        .doesNotThrowAnyException();
  }

  @SuppressWarnings("unchecked")
  private KubernetesClient mockClientWithConfigMap(
      String namespace, String name, ConfigMap configMap) {
    KubernetesClient client = Mockito.mock(KubernetesClient.class);
    MixedOperation configMaps = Mockito.mock(MixedOperation.class);
    MixedOperation inNamespace = Mockito.mock(MixedOperation.class);
    Resource resource = Mockito.mock(Resource.class);
    Mockito.when(client.configMaps()).thenReturn(configMaps);
    Mockito.when(configMaps.inNamespace(namespace)).thenReturn(inNamespace);
    Mockito.when(inNamespace.withName(name)).thenReturn(resource);
    Mockito.when(resource.get()).thenReturn(configMap);
    return client;
  }

  private static final String VALID_JOB_TEMPLATE_YAML =
      "apiVersion: batch/v1\n"
          + "kind: Job\n"
          + "spec:\n"
          + "  template:\n"
          + "    spec:\n"
          + "      containers:\n"
          + "        - name: browser\n"
          + "          image: selenium/standalone-chrome:latest\n";

  @Test
  void loadJobTemplateShouldParseValidConfigMap() {
    ConfigMap cm =
        new ConfigMapBuilder().withData(Map.of("template", VALID_JOB_TEMPLATE_YAML)).build();
    KubernetesClient client = mockClientWithConfigMap("selenium", "chrome-template", cm);

    Job job = KubernetesOptions.loadJobTemplate(client, "selenium", "chrome-template");

    assertThat(job).isNotNull();
    assertThat(job.getSpec()).isNotNull();
    assertThat(job.getSpec().getTemplate().getSpec().getContainers()).hasSize(1);
    assertThat(job.getSpec().getTemplate().getSpec().getContainers().get(0).getName())
        .isEqualTo("browser");
    assertThat(job.getSpec().getTemplate().getSpec().getContainers().get(0).getImage())
        .isEqualTo("selenium/standalone-chrome:latest");
  }

  @Test
  void loadJobTemplateShouldParseCrossNamespaceRef() {
    ConfigMap cm =
        new ConfigMapBuilder().withData(Map.of("template", VALID_JOB_TEMPLATE_YAML)).build();
    KubernetesClient client = mockClientWithConfigMap("other-ns", "chrome-template", cm);

    Job job = KubernetesOptions.loadJobTemplate(client, "selenium", "other-ns/chrome-template");

    assertThat(job).isNotNull();
    assertThat(job.getSpec().getTemplate().getSpec().getContainers().get(0).getImage())
        .isEqualTo("selenium/standalone-chrome:latest");
  }

  @Test
  void loadJobTemplateShouldThrowWhenConfigMapMissing() {
    KubernetesClient client = mockClientWithConfigMap("selenium", "missing", null);

    assertThatThrownBy(() -> KubernetesOptions.loadJobTemplate(client, "selenium", "missing"))
        .isInstanceOf(ConfigException.class)
        .hasMessageContaining("not found");
  }

  @Test
  void loadJobTemplateShouldThrowWhenTemplateKeyMissing() {
    ConfigMap cm = new ConfigMapBuilder().withData(Map.of("other-key", "some-value")).build();
    KubernetesClient client = mockClientWithConfigMap("selenium", "no-template", cm);

    assertThatThrownBy(() -> KubernetesOptions.loadJobTemplate(client, "selenium", "no-template"))
        .isInstanceOf(ConfigException.class)
        .hasMessageContaining("does not contain key 'template'");
  }

  @Test
  void loadJobTemplateShouldThrowWhenYamlInvalid() {
    ConfigMap cm =
        new ConfigMapBuilder().withData(Map.of("template", "not: valid: job: yaml: [")).build();
    KubernetesClient client = mockClientWithConfigMap("selenium", "bad-yaml", cm);

    assertThatThrownBy(() -> KubernetesOptions.loadJobTemplate(client, "selenium", "bad-yaml"))
        .isInstanceOf(ConfigException.class);
  }

  @Test
  void loadJobTemplateShouldThrowWhenNoBrowserContainer() {
    String noBrowserYaml =
        "apiVersion: batch/v1\n"
            + "kind: Job\n"
            + "spec:\n"
            + "  template:\n"
            + "    spec:\n"
            + "      containers:\n"
            + "        - name: sidecar\n"
            + "          image: some/image:latest\n";
    ConfigMap cm = new ConfigMapBuilder().withData(Map.of("template", noBrowserYaml)).build();
    KubernetesClient client = mockClientWithConfigMap("selenium", "no-browser", cm);

    assertThatThrownBy(() -> KubernetesOptions.loadJobTemplate(client, "selenium", "no-browser"))
        .isInstanceOf(ConfigException.class)
        .hasMessageContaining("browser");
  }

  @Test
  void extractBrowserImageShouldReturnImageFromTemplate() {
    ConfigMap cm =
        new ConfigMapBuilder().withData(Map.of("template", VALID_JOB_TEMPLATE_YAML)).build();
    KubernetesClient client = mockClientWithConfigMap("selenium", "chrome-template", cm);
    Job job = KubernetesOptions.loadJobTemplate(client, "selenium", "chrome-template");

    String image = KubernetesOptions.extractBrowserImage(job);
    assertThat(image).isEqualTo("selenium/standalone-chrome:latest");
  }
}
