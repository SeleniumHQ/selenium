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

import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientException;
import io.fabric8.kubernetes.client.LocalPortForward;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.time.Instant;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.node.DefaultActiveSession;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.Tracer;

public class KubernetesSession extends DefaultActiveSession {

  private static final Logger LOG = Logger.getLogger(KubernetesSession.class.getName());
  private static final Duration POD_POLL_INTERVAL = Duration.ofSeconds(2);
  private static final Duration VIDEO_FILE_STABLE_TIMEOUT = Duration.ofSeconds(30);
  private static final Duration VIDEO_FILE_POLL_INTERVAL = Duration.ofMillis(500);

  private final String jobName;
  private final String namespace;
  private final KubernetesClient kubeClient;
  private final String podName;
  private final @Nullable String assetsPath;
  private final @Nullable String videoFileName;
  private final long terminationGracePeriodSeconds;
  private final @Nullable LocalPortForward portForward;

  KubernetesSession(
      String jobName,
      String namespace,
      KubernetesClient kubeClient,
      String podName,
      @Nullable String assetsPath,
      @Nullable String videoFileName,
      long terminationGracePeriodSeconds,
      @Nullable LocalPortForward portForward,
      Tracer tracer,
      HttpClient client,
      SessionId id,
      URL url,
      Capabilities stereotype,
      Capabilities capabilities,
      Dialect downstream,
      Dialect upstream,
      Instant startTime) {
    super(tracer, client, id, url, downstream, upstream, stereotype, capabilities, startTime);
    this.jobName = Require.nonNull("Job name", jobName);
    this.namespace = Require.nonNull("Namespace", namespace);
    this.kubeClient = Require.nonNull("KubernetesClient", kubeClient);
    this.podName = Require.nonNull("Pod name", podName);
    this.assetsPath = assetsPath;
    this.videoFileName = videoFileName;
    this.terminationGracePeriodSeconds = terminationGracePeriodSeconds;
    this.portForward = portForward;
  }

  @Override
  public void stop() {
    LOG.info(String.format("Stopping session, deleting K8s Job: %s/%s", namespace, jobName));
    saveLogs();
    if (portForward != null) {
      try {
        portForward.close();
      } catch (IOException e) {
        LOG.log(Level.WARNING, "Failed to close port-forward for session " + getId(), e);
      }
    }
    // Delete the Job so K8s sends SIGTERM to containers (including video sidecar),
    // then wait for the Pod to fully terminate before touching video files.
    deleteJob();
    waitForPodTerminated();
    relocateVideoFiles();
    super.stop();
  }

  private void deleteJob() {
    try {
      kubeClient.batch().v1().jobs().inNamespace(namespace).withName(jobName).delete();
    } catch (KubernetesClientException e) {
      LOG.log(
          Level.WARNING,
          String.format("Failed to delete K8s Job %s/%s: %s", namespace, jobName, e.getMessage()),
          e);
    }
  }

  private void waitForPodTerminated() {
    // Wait for the termination grace period plus a small buffer for K8s overhead
    Duration timeout = Duration.ofSeconds(terminationGracePeriodSeconds + 10);
    Instant deadline = Instant.now().plus(timeout);
    while (Instant.now().isBefore(deadline)) {
      try {
        Pod pod = kubeClient.pods().inNamespace(namespace).withName(podName).get();
        if (pod == null) {
          LOG.fine(String.format("Pod %s has been removed", podName));
          return;
        }
        String phase = pod.getStatus() != null ? pod.getStatus().getPhase() : null;
        if ("Succeeded".equals(phase) || "Failed".equals(phase)) {
          LOG.fine(String.format("Pod %s reached terminal phase: %s", podName, phase));
          return;
        }
        Thread.sleep(POD_POLL_INTERVAL.toMillis());
      } catch (KubernetesClientException e) {
        // Pod may already be gone (404) — treat as terminated
        LOG.fine(String.format("Pod %s no longer reachable: %s", podName, e.getMessage()));
        return;
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return;
      }
    }
    LOG.warning(
        String.format(
            "Pod %s did not terminate within %ds, proceeding anyway",
            podName, timeout.getSeconds()));
  }

  private void saveLogs() {
    if (assetsPath == null) {
      return;
    }
    try {
      Path sessionDir = Paths.get(assetsPath, getId().toString());
      Files.createDirectories(sessionDir);
      // Stream logs directly to file to avoid loading the entire log into memory
      try (InputStream logStream =
          kubeClient
              .pods()
              .inNamespace(namespace)
              .withName(podName)
              .inContainer("browser")
              .getLogInputStream()) {
        if (logStream != null) {
          Files.copy(
              logStream,
              sessionDir.resolve("selenium-server.log"),
              StandardCopyOption.REPLACE_EXISTING);
          LOG.fine(String.format("Saved browser logs for session %s", getId()));
        }
      }
    } catch (Exception e) {
      LOG.log(Level.WARNING, "Failed to save browser Pod logs", e);
    }
  }

  private void relocateVideoFiles() {
    if (assetsPath == null || videoFileName == null) {
      return;
    }
    Path assetsDir = Paths.get(assetsPath);
    // The recorder writes using jobName (set via SE_VIDEO_FILE_NAME at Job creation time).
    // videoFileName is the fully resolved target name (may include caps-derived name + sessionId).
    Path videoFile = assetsDir.resolve(jobName + ".mp4");
    if (!Files.exists(videoFile)) {
      LOG.fine(String.format("No video file found at %s for session %s", videoFile, getId()));
      return;
    }
    waitForFileStable(videoFile);
    try {
      Path sessionDir = assetsDir.resolve(getId().toString());
      Files.createDirectories(sessionDir);
      Path target = sessionDir.resolve(videoFileName);
      Files.move(videoFile, target, StandardCopyOption.REPLACE_EXISTING);
      LOG.info(
          String.format(
              "Relocated video %s → %s for session %s", videoFile.getFileName(), target, getId()));
    } catch (IOException e) {
      LOG.log(Level.WARNING, "Failed to relocate video file: " + videoFile, e);
    }
  }

  private void waitForFileStable(Path file) {
    Instant deadline = Instant.now().plus(VIDEO_FILE_STABLE_TIMEOUT);
    long previousSize = -1;
    while (Instant.now().isBefore(deadline)) {
      try {
        long currentSize = Files.size(file);
        if (currentSize > 0 && currentSize == previousSize) {
          LOG.fine(
              String.format(
                  "Video file %s stabilized at %d bytes", file.getFileName(), currentSize));
          return;
        }
        previousSize = currentSize;
        Thread.sleep(VIDEO_FILE_POLL_INTERVAL.toMillis());
      } catch (IOException e) {
        LOG.log(Level.WARNING, "Error checking video file size: " + file, e);
        return;
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return;
      }
    }
    LOG.warning(
        String.format(
            "Video file %s did not stabilize within %ds, relocating as-is",
            file.getFileName(), VIDEO_FILE_STABLE_TIMEOUT.getSeconds()));
  }
}
