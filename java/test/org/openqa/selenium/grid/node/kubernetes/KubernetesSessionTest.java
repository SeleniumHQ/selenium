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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodList;
import io.fabric8.kubernetes.api.model.batch.v1.Job;
import io.fabric8.kubernetes.api.model.batch.v1.JobList;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.dsl.NonNamespaceOperation;
import io.fabric8.kubernetes.client.dsl.PodResource;
import io.fabric8.kubernetes.client.dsl.ScalableResource;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Tracer;

class KubernetesSessionTest {

  @TempDir Path tempDir;

  private KubernetesSession createSession(
      KubernetesClient kubeClient, String assetsPath, String videoFileName) throws Exception {
    HttpClient httpClient = mock(HttpClient.class);
    when(httpClient.execute(any(HttpRequest.class))).thenReturn(new HttpResponse());

    return new KubernetesSession(
        "test-job",
        "selenium",
        kubeClient,
        "test-pod",
        assetsPath,
        videoFileName,
        30L,
        null,
        mock(Tracer.class),
        httpClient,
        new SessionId("test-session-id"),
        new URL("http://localhost:4444"),
        new ImmutableCapabilities(),
        new ImmutableCapabilities(),
        Dialect.W3C,
        Dialect.W3C,
        Instant.now());
  }

  /**
   * Deep stubs stop at links whose return type is a type variable, so the Job and Pod chains are
   * stubbed by hand.
   */
  @SuppressWarnings("unchecked")
  private ScalableResource<Job> stubJobResource(KubernetesClient kubeClient) {
    NonNamespaceOperation<Job, JobList, ScalableResource<Job>> jobsInNamespace =
        mock(NonNamespaceOperation.class);
    ScalableResource<Job> jobResource = mock(ScalableResource.class);
    when(kubeClient.batch().v1().jobs().inNamespace("selenium")).thenReturn(jobsInNamespace);
    when(jobsInNamespace.withName("test-job")).thenReturn(jobResource);
    return jobResource;
  }

  @SuppressWarnings("unchecked")
  private PodResource stubPodResource(KubernetesClient kubeClient) {
    NonNamespaceOperation<Pod, PodList, PodResource> podsInNamespace =
        mock(NonNamespaceOperation.class);
    PodResource podResource = mock(PodResource.class);
    when(kubeClient.pods().inNamespace("selenium")).thenReturn(podsInNamespace);
    when(podsInNamespace.withName("test-pod")).thenReturn(podResource);
    return podResource;
  }

  @Test
  void stopDoesNotWaitForThePodWhenThereIsNoVideoToRelocate() throws Exception {
    KubernetesClient kubeClient = mock(KubernetesClient.class, RETURNS_DEEP_STUBS);
    ScalableResource<Job> jobResource = stubJobResource(kubeClient);

    createSession(kubeClient, null, null).stop();

    verify(jobResource).delete();
    // Polling the Pod only serves the relocation, which has nothing to do here
    verify(kubeClient, never()).pods();
  }

  @Test
  void stopRelocatesTheVideoIntoTheSessionFolder() throws Exception {
    KubernetesClient kubeClient = mock(KubernetesClient.class, RETURNS_DEEP_STUBS);
    stubJobResource(kubeClient);
    // A null Pod means it is already gone, so the termination wait returns immediately
    when(stubPodResource(kubeClient).get()).thenReturn(null);
    Files.writeString(tempDir.resolve("test-job.mp4"), "recorded");

    createSession(kubeClient, tempDir.toString(), "my-test_test-session-id.mp4").stop();

    assertThat(tempDir.resolve("test-session-id").resolve("my-test_test-session-id.mp4")).exists();
    assertThat(tempDir.resolve("test-job.mp4")).doesNotExist();
  }
}
