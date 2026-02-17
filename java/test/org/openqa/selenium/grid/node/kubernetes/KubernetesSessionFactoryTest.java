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

import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.ContainerBuilder;
import io.fabric8.kubernetes.api.model.ContainerPortBuilder;
import io.fabric8.kubernetes.api.model.EnvVar;
import io.fabric8.kubernetes.api.model.EnvVarBuilder;
import io.fabric8.kubernetes.api.model.ObjectMetaBuilder;
import io.fabric8.kubernetes.api.model.PodSpecBuilder;
import io.fabric8.kubernetes.api.model.PodTemplateSpecBuilder;
import io.fabric8.kubernetes.api.model.Quantity;
import io.fabric8.kubernetes.api.model.ResourceRequirementsBuilder;
import io.fabric8.kubernetes.api.model.Toleration;
import io.fabric8.kubernetes.api.model.TolerationBuilder;
import io.fabric8.kubernetes.api.model.Volume;
import io.fabric8.kubernetes.api.model.VolumeBuilder;
import io.fabric8.kubernetes.api.model.VolumeMountBuilder;
import io.fabric8.kubernetes.api.model.batch.v1.Job;
import io.fabric8.kubernetes.api.model.batch.v1.JobBuilder;
import io.fabric8.kubernetes.api.model.batch.v1.JobSpecBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.Tracer;

class KubernetesSessionFactoryTest {

  private static Job createMinimalJobTemplate() {
    return new JobBuilder()
        .withMetadata(new ObjectMetaBuilder().withLabels(Map.of("team", "qa")).build())
        .withSpec(
            new JobSpecBuilder()
                .withTemplate(
                    new PodTemplateSpecBuilder()
                        .withMetadata(
                            new ObjectMetaBuilder().withLabels(Map.of("team", "qa")).build())
                        .withSpec(
                            new PodSpecBuilder()
                                .withContainers(
                                    new ContainerBuilder()
                                        .withName("browser")
                                        .withImage("selenium/standalone-chrome:latest")
                                        .build())
                                .build())
                        .build())
                .build())
        .build();
  }

  private static KubernetesSessionFactory createTemplateFactory(Job template) {
    return createTemplateFactory(template, null, null);
  }

  private static KubernetesSessionFactory createTemplateFactory(
      Job template, String videoImage, String assetsPath) {
    return createTemplateFactory(template, videoImage, assetsPath, InheritedPodSpec.empty());
  }

  private static KubernetesSessionFactory createTemplateFactory(
      Job template, String videoImage, String assetsPath, InheritedPodSpec inheritedPodSpec) {
    Tracer tracer = Mockito.mock(Tracer.class);
    HttpClient.Factory clientFactory = Mockito.mock(HttpClient.Factory.class);

    return new KubernetesSessionFactory(
        tracer,
        clientFactory,
        Duration.ofMinutes(5),
        Duration.ofSeconds(120),
        () -> Mockito.mock(KubernetesClient.class),
        "selenium",
        "selenium/standalone-chrome:latest",
        new ImmutableCapabilities("browserName", "chrome"),
        template,
        videoImage,
        assetsPath,
        inheritedPodSpec,
        30L,
        false,
        caps -> true);
  }

  private static KubernetesSessionFactory createImageFactory(String videoImage, String assetsPath) {
    return createImageFactory(videoImage, assetsPath, InheritedPodSpec.empty());
  }

  private static KubernetesSessionFactory createImageFactory(
      String videoImage, String assetsPath, InheritedPodSpec inheritedPodSpec) {
    Tracer tracer = Mockito.mock(Tracer.class);
    HttpClient.Factory clientFactory = Mockito.mock(HttpClient.Factory.class);

    return new KubernetesSessionFactory(
        tracer,
        clientFactory,
        Duration.ofMinutes(5),
        Duration.ofSeconds(120),
        () -> Mockito.mock(KubernetesClient.class),
        "selenium",
        "selenium/standalone-chrome:latest",
        new ImmutableCapabilities("browserName", "chrome"),
        "IfNotPresent",
        null,
        Map.of(),
        Map.of(),
        Map.of(),
        videoImage,
        assetsPath,
        inheritedPodSpec,
        30L,
        false,
        caps -> true);
  }

  private static EnvVar findEnvVar(List<EnvVar> envVars, String name) {
    return envVars.stream().filter(e -> name.equals(e.getName())).findFirst().orElse(null);
  }

  @Test
  void templateJobMetadataOverriddenWithSessionJobName() {
    Job template = createMinimalJobTemplate();
    KubernetesSessionFactory factory = createTemplateFactory(template);

    Job job =
        factory.buildJobSpecFromTemplate(
            "selenium-session-chrome-123", new ImmutableCapabilities("browserName", "chrome"));

    assertThat(job.getMetadata().getName()).isEqualTo("selenium-session-chrome-123");
    assertThat(job.getMetadata().getNamespace()).isEqualTo("selenium");
  }

  @Test
  void nodePodOwnerReferenceSetOnTemplateJobMetadata() {
    Job template = createMinimalJobTemplate();
    InheritedPodSpec inheritedPodSpec =
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
            "pod-uid-123");
    KubernetesSessionFactory factory =
        createTemplateFactory(template, null, null, inheritedPodSpec);

    Job job =
        factory.buildJobSpecFromTemplate(
            "selenium-session-chrome-123", new ImmutableCapabilities("browserName", "chrome"));

    assertThat(job.getMetadata().getOwnerReferences()).hasSize(1);
    assertThat(job.getMetadata().getOwnerReferences().get(0).getApiVersion()).isEqualTo("v1");
    assertThat(job.getMetadata().getOwnerReferences().get(0).getKind()).isEqualTo("Pod");
    assertThat(job.getMetadata().getOwnerReferences().get(0).getName()).isEqualTo("node-pod-abc");
    assertThat(job.getMetadata().getOwnerReferences().get(0).getUid()).isEqualTo("pod-uid-123");
  }

  @Test
  void nodePodOwnerReferenceNotSetWhenUidMissing() {
    Job template = createMinimalJobTemplate();
    InheritedPodSpec inheritedPodSpec =
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
            null);
    KubernetesSessionFactory factory =
        createTemplateFactory(template, null, null, inheritedPodSpec);

    Job job =
        factory.buildJobSpecFromTemplate(
            "selenium-session-chrome-123", new ImmutableCapabilities("browserName", "chrome"));

    assertThat(job.getMetadata().getOwnerReferences()).isNullOrEmpty();
  }

  @Test
  void sessionLabelsAddedAndTemplateLabelsPreserved() {
    Job template = createMinimalJobTemplate();
    KubernetesSessionFactory factory = createTemplateFactory(template);

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome"));

    Map<String, String> labels = job.getMetadata().getLabels();
    assertThat(labels).containsEntry("team", "qa");
    assertThat(labels).containsEntry("app", "selenium-session");
    assertThat(labels).containsEntry("se/job-name", "test-job");
    assertThat(labels).containsEntry("se/browser", "chrome");
  }

  @Test
  void podTemplateLabelsAlsoMerged() {
    Job template = createMinimalJobTemplate();
    KubernetesSessionFactory factory = createTemplateFactory(template);

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome"));

    Map<String, String> podLabels = job.getSpec().getTemplate().getMetadata().getLabels();
    assertThat(podLabels).containsEntry("team", "qa");
    assertThat(podLabels).containsEntry("app", "selenium-session");
  }

  @Test
  void jobSpecFieldsSetCorrectly() {
    Job template = createMinimalJobTemplate();
    KubernetesSessionFactory factory = createTemplateFactory(template);

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome"));

    assertThat(job.getSpec().getBackoffLimit()).isEqualTo(0);
    assertThat(job.getSpec().getTtlSecondsAfterFinished()).isEqualTo(30);
    assertThat(job.getSpec().getActiveDeadlineSeconds()).isEqualTo(300L);
  }

  @Test
  void restartPolicySetToNever() {
    Job template = createMinimalJobTemplate();
    KubernetesSessionFactory factory = createTemplateFactory(template);

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome"));

    assertThat(job.getSpec().getTemplate().getSpec().getRestartPolicy()).isEqualTo("Never");
  }

  @Test
  void browserContainerPort4444Ensured() {
    Job template = createMinimalJobTemplate();
    KubernetesSessionFactory factory = createTemplateFactory(template);

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome"));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    assertThat(browser).isNotNull();
    assertThat(browser.getPorts()).isNotNull();
    assertThat(browser.getPorts())
        .anyMatch(p -> p.getContainerPort() != null && p.getContainerPort() == 4444);
  }

  @Test
  void browserContainerPort4444NotDuplicatedIfPresent() {
    Job template = createMinimalJobTemplate();
    template
        .getSpec()
        .getTemplate()
        .getSpec()
        .getContainers()
        .get(0)
        .setPorts(
            new ArrayList<>(
                List.of(
                    new ContainerPortBuilder()
                        .withContainerPort(4444)
                        .withProtocol("TCP")
                        .build())));
    KubernetesSessionFactory factory = createTemplateFactory(template);

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome"));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    long port4444Count =
        browser.getPorts().stream()
            .filter(p -> p.getContainerPort() != null && p.getContainerPort() == 4444)
            .count();
    assertThat(port4444Count).isEqualTo(1);
  }

  @Test
  void shmVolumeAddedIfMissing() {
    Job template = createMinimalJobTemplate();
    KubernetesSessionFactory factory = createTemplateFactory(template);

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome"));

    List<Volume> volumes = job.getSpec().getTemplate().getSpec().getVolumes();
    assertThat(volumes).anyMatch(v -> "dshm".equals(v.getName()));
  }

  @Test
  void shmVolumeNotDuplicatedIfPresent() {
    Job template = createMinimalJobTemplate();
    template
        .getSpec()
        .getTemplate()
        .getSpec()
        .setVolumes(
            new ArrayList<>(
                List.of(
                    new VolumeBuilder()
                        .withName("dshm")
                        .withNewEmptyDir()
                        .withMedium("Memory")
                        .endEmptyDir()
                        .build())));
    KubernetesSessionFactory factory = createTemplateFactory(template);

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome"));

    long shmCount =
        job.getSpec().getTemplate().getSpec().getVolumes().stream()
            .filter(v -> "dshm".equals(v.getName()))
            .count();
    assertThat(shmCount).isEqualTo(1);
  }

  @Test
  void shmVolumeMountEnsuredOnBrowserContainer() {
    Job template = createMinimalJobTemplate();
    KubernetesSessionFactory factory = createTemplateFactory(template);

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome"));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    assertThat(browser.getVolumeMounts())
        .anyMatch(m -> "dshm".equals(m.getName()) && "/dev/shm".equals(m.getMountPath()));
  }

  @Test
  void templatePodSpecFieldsPreserved() {
    Job template = createMinimalJobTemplate();
    Toleration toleration =
        new TolerationBuilder()
            .withKey("gpu")
            .withOperator("Exists")
            .withEffect("NoSchedule")
            .build();
    template.getSpec().getTemplate().getSpec().setTolerations(List.of(toleration));
    template.getSpec().getTemplate().getSpec().setNodeSelector(Map.of("disktype", "ssd"));

    KubernetesSessionFactory factory = createTemplateFactory(template);

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome"));

    assertThat(job.getSpec().getTemplate().getSpec().getTolerations()).hasSize(1);
    assertThat(job.getSpec().getTemplate().getSpec().getTolerations().get(0).getKey())
        .isEqualTo("gpu");
    assertThat(job.getSpec().getTemplate().getSpec().getNodeSelector())
        .containsEntry("disktype", "ssd");
  }

  @Test
  void templateContainerFieldsPreserved() {
    Job template = createMinimalJobTemplate();
    Container browserContainer = template.getSpec().getTemplate().getSpec().getContainers().get(0);
    browserContainer.setResources(
        new ResourceRequirementsBuilder()
            .withRequests(Map.of("cpu", new Quantity("1")))
            .withLimits(Map.of("memory", new Quantity("4Gi")))
            .build());
    browserContainer.setEnv(
        new ArrayList<>(
            List.of(new EnvVarBuilder().withName("CUSTOM_VAR").withValue("custom-value").build())));

    KubernetesSessionFactory factory = createTemplateFactory(template);

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome"));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");

    // Resources preserved
    assertThat(browser.getResources().getRequests()).containsKey("cpu");
    assertThat(browser.getResources().getLimits()).containsKey("memory");

    // Custom env var preserved
    assertThat(browser.getEnv())
        .anyMatch(e -> "CUSTOM_VAR".equals(e.getName()) && "custom-value".equals(e.getValue()));
  }

  @Test
  void sessionEnvVarsMergedIntoTemplate() {
    Job template = createMinimalJobTemplate();
    Container browserContainer = template.getSpec().getTemplate().getSpec().getContainers().get(0);
    browserContainer.setEnv(
        new ArrayList<>(
            List.of(new EnvVarBuilder().withName("CUSTOM_VAR").withValue("custom-value").build())));

    KubernetesSessionFactory factory = createTemplateFactory(template);

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome"));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");

    // Both custom and session env vars present
    assertThat(browser.getEnv()).anyMatch(e -> "CUSTOM_VAR".equals(e.getName()));
  }

  @Test
  void deepCopyOriginalTemplateNotMutated() {
    Job template = createMinimalJobTemplate();
    KubernetesSessionFactory factory = createTemplateFactory(template);

    factory.buildJobSpecFromTemplate("job-1", new ImmutableCapabilities("browserName", "chrome"));
    factory.buildJobSpecFromTemplate("job-2", new ImmutableCapabilities("browserName", "chrome"));

    // Original template metadata should be unchanged
    assertThat(template.getMetadata().getName()).isNull();
    assertThat(template.getMetadata().getNamespace()).isNull();
  }

  @Test
  void assetsVolumeAddedWhenAssetsPathConfigured() {
    Job template = createMinimalJobTemplate();
    KubernetesSessionFactory factory =
        createTemplateFactory(template, null, "/opt/selenium/assets");

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome"));

    List<Volume> volumes = job.getSpec().getTemplate().getSpec().getVolumes();
    assertThat(volumes).anyMatch(v -> "session-assets".equals(v.getName()));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    assertThat(browser.getVolumeMounts())
        .anyMatch(
            m ->
                "session-assets".equals(m.getName())
                    && "/opt/selenium/assets".equals(m.getMountPath()));
  }

  @Test
  void assetsVolumeNotAddedWhenAssetsPathNull() {
    Job template = createMinimalJobTemplate();
    KubernetesSessionFactory factory = createTemplateFactory(template, null, null);

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome"));

    List<Volume> volumes = job.getSpec().getTemplate().getSpec().getVolumes();
    if (volumes != null) {
      assertThat(volumes).noneMatch(v -> "session-assets".equals(v.getName()));
    }
  }

  @Test
  void mergeEnvVarsSessionWinsOnConflict() {
    Container container = new ContainerBuilder().withName("test").build();
    container.setEnv(
        new ArrayList<>(
            List.of(
                new EnvVarBuilder().withName("SHARED").withValue("template").build(),
                new EnvVarBuilder().withName("TEMPLATE_ONLY").withValue("keep").build())));

    List<EnvVar> sessionVars =
        List.of(
            new EnvVarBuilder().withName("SHARED").withValue("session").build(),
            new EnvVarBuilder().withName("SESSION_ONLY").withValue("new").build());

    KubernetesSessionFactory.mergeEnvVars(container, sessionVars);

    assertThat(container.getEnv())
        .anyMatch(e -> "SHARED".equals(e.getName()) && "session".equals(e.getValue()));
    assertThat(container.getEnv())
        .anyMatch(e -> "TEMPLATE_ONLY".equals(e.getName()) && "keep".equals(e.getValue()));
    assertThat(container.getEnv())
        .anyMatch(e -> "SESSION_ONLY".equals(e.getName()) && "new".equals(e.getValue()));
  }

  @Test
  void ensurePortDoesNotDuplicate() {
    Container container =
        new ContainerBuilder()
            .withName("test")
            .withPorts(
                new ArrayList<>(
                    List.of(
                        new ContainerPortBuilder()
                            .withContainerPort(4444)
                            .withProtocol("TCP")
                            .build())))
            .build();

    KubernetesSessionFactory.ensurePort(container, 4444);

    assertThat(container.getPorts()).hasSize(1);
  }

  @Test
  void ensurePortAddsWhenMissing() {
    Container container = new ContainerBuilder().withName("test").build();

    KubernetesSessionFactory.ensurePort(container, 4444);

    assertThat(container.getPorts()).hasSize(1);
    assertThat(container.getPorts().get(0).getContainerPort()).isEqualTo(4444);
  }

  @Test
  void ensureVolumeMountDoesNotDuplicate() {
    Container container =
        new ContainerBuilder()
            .withName("test")
            .withVolumeMounts(
                new ArrayList<>(
                    List.of(
                        new VolumeMountBuilder()
                            .withName("dshm")
                            .withMountPath("/dev/shm")
                            .build())))
            .build();

    KubernetesSessionFactory.ensureVolumeMount(container, "dshm", "/dev/shm");

    assertThat(container.getVolumeMounts()).hasSize(1);
  }

  @Test
  void ensureVolumeMountAddsWhenMissing() {
    Container container = new ContainerBuilder().withName("test").build();

    KubernetesSessionFactory.ensureVolumeMount(container, "dshm", "/dev/shm");

    assertThat(container.getVolumeMounts()).hasSize(1);
    assertThat(container.getVolumeMounts().get(0).getName()).isEqualTo("dshm");
    assertThat(container.getVolumeMounts().get(0).getMountPath()).isEqualTo("/dev/shm");
  }

  @Test
  void findContainerByNameReturnsCorrectContainer() {
    Container c1 = new ContainerBuilder().withName("browser").build();
    Container c2 = new ContainerBuilder().withName("video").build();

    assertThat(KubernetesSessionFactory.findContainerByName(List.of(c1, c2), "browser"))
        .isSameAs(c1);
    assertThat(KubernetesSessionFactory.findContainerByName(List.of(c1, c2), "video")).isSameAs(c2);
    assertThat(KubernetesSessionFactory.findContainerByName(List.of(c1, c2), "missing")).isNull();
    assertThat(KubernetesSessionFactory.findContainerByName(null, "browser")).isNull();
  }

  // ---- Image mode: buildJobSpec ----

  @Test
  void imageModeBrowserContainerHasCorrectImage() {
    KubernetesSessionFactory factory = createImageFactory(null, null);

    Job job = factory.buildJobSpec("test-job", new ImmutableCapabilities("browserName", "chrome"));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    assertThat(browser).isNotNull();
    assertThat(browser.getImage()).isEqualTo("selenium/standalone-chrome:latest");
  }

  @Test
  void imageModeBrowserContainerHasShmMount() {
    KubernetesSessionFactory factory = createImageFactory(null, null);

    Job job = factory.buildJobSpec("test-job", new ImmutableCapabilities("browserName", "chrome"));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    assertThat(browser.getVolumeMounts())
        .anyMatch(m -> "dshm".equals(m.getName()) && "/dev/shm".equals(m.getMountPath()));
  }

  @Test
  void imageModeHasShmVolume() {
    KubernetesSessionFactory factory = createImageFactory(null, null);

    Job job = factory.buildJobSpec("test-job", new ImmutableCapabilities("browserName", "chrome"));

    List<Volume> volumes = job.getSpec().getTemplate().getSpec().getVolumes();
    assertThat(volumes).anyMatch(v -> "dshm".equals(v.getName()));
  }

  @Test
  void imageModeJobMetadataCorrect() {
    KubernetesSessionFactory factory = createImageFactory(null, null);

    Job job = factory.buildJobSpec("test-job", new ImmutableCapabilities("browserName", "chrome"));

    assertThat(job.getMetadata().getName()).isEqualTo("test-job");
    assertThat(job.getMetadata().getNamespace()).isEqualTo("selenium");
    assertThat(job.getMetadata().getLabels()).containsEntry("app", "selenium-session");
    assertThat(job.getMetadata().getLabels()).containsEntry("se/job-name", "test-job");
    assertThat(job.getMetadata().getLabels()).containsEntry("se/browser", "chrome");
  }

  @Test
  void imageModeOwnerReferenceSetWhenPodIdentityPresent() {
    InheritedPodSpec podSpec =
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
            "pod-uid-123");
    KubernetesSessionFactory factory = createImageFactory(null, null, podSpec);

    Job job = factory.buildJobSpec("test-job", new ImmutableCapabilities("browserName", "chrome"));

    assertThat(job.getMetadata().getOwnerReferences()).hasSize(1);
    assertThat(job.getMetadata().getOwnerReferences().get(0).getName()).isEqualTo("node-pod-abc");
    assertThat(job.getMetadata().getOwnerReferences().get(0).getUid()).isEqualTo("pod-uid-123");
  }

  // ---- Browser container env vars ----

  @Test
  void browserContainerHasVideoFileNameEnvVar() {
    KubernetesSessionFactory factory = createImageFactory(null, null);

    Job job =
        factory.buildJobSpec(
            "test-job", new ImmutableCapabilities("browserName", "chrome", "se:recordVideo", true));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    EnvVar videoFileName = findEnvVar(browser.getEnv(), "SE_VIDEO_FILE_NAME");
    assertThat(videoFileName).isNotNull();
    assertThat(videoFileName.getValue()).isEqualTo("test-job.mp4");
  }

  @Test
  void browserContainerInlineVideoEnvVarsWhenNoVideoImage() {
    KubernetesSessionFactory factory = createImageFactory(null, null);

    Job job =
        factory.buildJobSpec(
            "test-job", new ImmutableCapabilities("browserName", "chrome", "se:recordVideo", true));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    assertThat(findEnvVar(browser.getEnv(), "SE_RECORD_VIDEO"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("true");
    assertThat(findEnvVar(browser.getEnv(), "SE_VIDEO_RECORD_STANDALONE"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("true");
  }

  @Test
  void browserContainerInlineVideoEnvVarsWhenVideoImageFalse() {
    KubernetesSessionFactory factory = createImageFactory("false", "/opt/selenium/assets");

    Job job =
        factory.buildJobSpec(
            "test-job", new ImmutableCapabilities("browserName", "chrome", "se:recordVideo", true));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    assertThat(findEnvVar(browser.getEnv(), "SE_RECORD_VIDEO"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("true");
    assertThat(findEnvVar(browser.getEnv(), "SE_VIDEO_RECORD_STANDALONE"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("true");
    // No video sidecar container should be added
    Container video =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "video");
    assertThat(video).isNull();
  }

  @Test
  void browserContainerNoInlineVideoEnvVarsWhenVideoImagePresent() {
    KubernetesSessionFactory factory =
        createImageFactory("selenium/video:latest", "/opt/selenium/assets");

    Job job =
        factory.buildJobSpec(
            "test-job", new ImmutableCapabilities("browserName", "chrome", "se:recordVideo", true));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    assertThat(findEnvVar(browser.getEnv(), "SE_RECORD_VIDEO")).isNull();
    assertThat(findEnvVar(browser.getEnv(), "SE_VIDEO_RECORD_STANDALONE")).isNull();
  }

  @Test
  void browserContainerNoVideoEnvVarsWhenNotRecording() {
    KubernetesSessionFactory factory = createImageFactory(null, null);

    Job job = factory.buildJobSpec("test-job", new ImmutableCapabilities("browserName", "chrome"));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    assertThat(findEnvVar(browser.getEnv(), "SE_VIDEO_FILE_NAME")).isNull();
    assertThat(findEnvVar(browser.getEnv(), "SE_RECORD_VIDEO")).isNull();
  }

  @Test
  void browserContainerScreenResolutionFromCaps() {
    KubernetesSessionFactory factory = createImageFactory(null, null);

    Job job =
        factory.buildJobSpec(
            "test-job",
            new ImmutableCapabilities("browserName", "chrome", "se:screenResolution", "1920x1080"));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    assertThat(findEnvVar(browser.getEnv(), "SE_SCREEN_WIDTH"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("1920");
    assertThat(findEnvVar(browser.getEnv(), "SE_SCREEN_HEIGHT"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("1080");
  }

  @Test
  void browserContainerTimezoneFromCaps() {
    KubernetesSessionFactory factory = createImageFactory(null, null);

    Job job =
        factory.buildJobSpec(
            "test-job",
            new ImmutableCapabilities("browserName", "chrome", "se:timeZone", "US/Pacific"));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    assertThat(findEnvVar(browser.getEnv(), "TZ"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("US/Pacific");
  }

  // ---- Inline video volume mount ----

  @Test
  void imageModeInlineVideoMountsVideosVolume() {
    KubernetesSessionFactory factory = createImageFactory(null, "/opt/selenium/assets");

    Job job =
        factory.buildJobSpec(
            "test-job", new ImmutableCapabilities("browserName", "chrome", "se:recordVideo", true));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    assertThat(browser.getVolumeMounts())
        .anyMatch(m -> "session-assets".equals(m.getName()) && "/videos".equals(m.getMountPath()));
  }

  @Test
  void imageModeNoVideosMountWhenNotRecording() {
    KubernetesSessionFactory factory = createImageFactory(null, "/opt/selenium/assets");

    Job job = factory.buildJobSpec("test-job", new ImmutableCapabilities("browserName", "chrome"));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    assertThat(browser.getVolumeMounts()).noneMatch(m -> "/videos".equals(m.getMountPath()));
  }

  // ---- Video sidecar container (image mode) ----

  @Test
  void imageModeVideoSidecarCreatedWhenVideoImagePresent() {
    KubernetesSessionFactory factory =
        createImageFactory("selenium/video:latest", "/opt/selenium/assets");

    Job job =
        factory.buildJobSpec(
            "test-job", new ImmutableCapabilities("browserName", "chrome", "se:recordVideo", true));

    Container video =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "video");
    assertThat(video).isNotNull();
    assertThat(video.getImage()).isEqualTo("selenium/video:latest");
  }

  @Test
  void imageModeVideoSidecarHasCorrectEnvVars() {
    KubernetesSessionFactory factory =
        createImageFactory("selenium/video:latest", "/opt/selenium/assets");

    Job job =
        factory.buildJobSpec(
            "test-job", new ImmutableCapabilities("browserName", "chrome", "se:recordVideo", true));

    Container video =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "video");
    assertThat(findEnvVar(video.getEnv(), "DISPLAY_CONTAINER_NAME"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("localhost");
    assertThat(findEnvVar(video.getEnv(), "SE_VIDEO_FILE_NAME"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("test-job.mp4");
    assertThat(findEnvVar(video.getEnv(), "SE_VIDEO_RECORD_STANDALONE"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("true");
  }

  @Test
  void imageModeVideoSidecarHasVideosMountPath() {
    KubernetesSessionFactory factory =
        createImageFactory("selenium/video:latest", "/opt/selenium/assets");

    Job job =
        factory.buildJobSpec(
            "test-job", new ImmutableCapabilities("browserName", "chrome", "se:recordVideo", true));

    Container video =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "video");
    assertThat(video.getVolumeMounts())
        .anyMatch(m -> "session-assets".equals(m.getName()) && "/videos".equals(m.getMountPath()));
  }

  @Test
  void imageModeVideoSidecarScreenResolutionFromCaps() {
    KubernetesSessionFactory factory =
        createImageFactory("selenium/video:latest", "/opt/selenium/assets");

    Job job =
        factory.buildJobSpec(
            "test-job",
            new ImmutableCapabilities(
                "browserName", "chrome",
                "se:recordVideo", true,
                "se:screenResolution", "1920x1080"));

    Container video =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "video");
    assertThat(findEnvVar(video.getEnv(), "SE_SCREEN_WIDTH"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("1920");
    assertThat(findEnvVar(video.getEnv(), "SE_SCREEN_HEIGHT"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("1080");
  }

  @Test
  void imageModeNoVideoSidecarWhenNotRecording() {
    KubernetesSessionFactory factory =
        createImageFactory("selenium/video:latest", "/opt/selenium/assets");

    Job job = factory.buildJobSpec("test-job", new ImmutableCapabilities("browserName", "chrome"));

    Container video =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "video");
    assertThat(video).isNull();
  }

  // ---- Template mode: video sidecar ----

  @Test
  void templateModeVideoContainerEnvVarsMerged() {
    Job template = createMinimalJobTemplate();
    // Add a video container to the template
    template
        .getSpec()
        .getTemplate()
        .getSpec()
        .getContainers()
        .add(new ContainerBuilder().withName("video").withImage("selenium/video:latest").build());

    KubernetesSessionFactory factory =
        createTemplateFactory(template, "selenium/video:latest", "/opt/selenium/assets");

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome", "se:recordVideo", true));

    Container video =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "video");
    assertThat(video).isNotNull();
    assertThat(findEnvVar(video.getEnv(), "DISPLAY_CONTAINER_NAME"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("localhost");
    assertThat(findEnvVar(video.getEnv(), "SE_VIDEO_FILE_NAME"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("test-job.mp4");
    assertThat(findEnvVar(video.getEnv(), "SE_VIDEO_RECORD_STANDALONE"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("true");
  }

  @Test
  void templateModeVideoContainerHasVideosMountPath() {
    Job template = createMinimalJobTemplate();
    template
        .getSpec()
        .getTemplate()
        .getSpec()
        .getContainers()
        .add(new ContainerBuilder().withName("video").withImage("selenium/video:latest").build());

    KubernetesSessionFactory factory =
        createTemplateFactory(template, "selenium/video:latest", "/opt/selenium/assets");

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome", "se:recordVideo", true));

    Container video =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "video");
    assertThat(video.getVolumeMounts())
        .anyMatch(m -> "session-assets".equals(m.getName()) && "/videos".equals(m.getMountPath()));
  }

  @Test
  void templateModeInlineVideoMountsOnBrowserContainer() {
    Job template = createMinimalJobTemplate();
    KubernetesSessionFactory factory =
        createTemplateFactory(template, null, "/opt/selenium/assets");

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome", "se:recordVideo", true));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    assertThat(browser.getVolumeMounts())
        .anyMatch(m -> "session-assets".equals(m.getName()) && "/videos".equals(m.getMountPath()));
    assertThat(findEnvVar(browser.getEnv(), "SE_RECORD_VIDEO"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("true");
    assertThat(findEnvVar(browser.getEnv(), "SE_VIDEO_RECORD_STANDALONE"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("true");
  }

  @Test
  void templateModeInlineVideoEnvVarsWhenVideoImageFalse() {
    Job template = createMinimalJobTemplate();
    KubernetesSessionFactory factory =
        createTemplateFactory(template, "false", "/opt/selenium/assets");

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job", new ImmutableCapabilities("browserName", "chrome", "se:recordVideo", true));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    assertThat(findEnvVar(browser.getEnv(), "SE_RECORD_VIDEO"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("true");
    assertThat(findEnvVar(browser.getEnv(), "SE_VIDEO_RECORD_STANDALONE"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("true");
    // /videos mount should be on browser container for inline recording
    assertThat(browser.getVolumeMounts())
        .anyMatch(m -> "session-assets".equals(m.getName()) && "/videos".equals(m.getMountPath()));
    // No video sidecar container
    Container video =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "video");
    assertThat(video).isNull();
  }

  @Test
  void templateModeBrowserContainerEnvVarsMerged() {
    Job template = createMinimalJobTemplate();
    KubernetesSessionFactory factory =
        createTemplateFactory(template, null, "/opt/selenium/assets");

    Job job =
        factory.buildJobSpecFromTemplate(
            "test-job",
            new ImmutableCapabilities(
                "browserName", "chrome",
                "se:recordVideo", true,
                "se:screenResolution", "1280x720",
                "se:timeZone", "Europe/Berlin"));

    Container browser =
        KubernetesSessionFactory.findContainerByName(
            job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    assertThat(findEnvVar(browser.getEnv(), "SE_VIDEO_FILE_NAME"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("test-job.mp4");
    assertThat(findEnvVar(browser.getEnv(), "SE_SCREEN_WIDTH"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("1280");
    assertThat(findEnvVar(browser.getEnv(), "SE_SCREEN_HEIGHT"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("720");
    assertThat(findEnvVar(browser.getEnv(), "TZ"))
        .isNotNull()
        .extracting(EnvVar::getValue)
        .isEqualTo("Europe/Berlin");
  }
}
