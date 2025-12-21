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

import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.BatchV1Api;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.models.V1Job;
import io.kubernetes.client.openapi.models.V1Pod;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.node.DefaultActiveSession;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.Tracer;

public class KubernetesSession extends DefaultActiveSession {

  private static final Logger LOG = Logger.getLogger(KubernetesSession.class.getName());
  private final ApiClient kubernetesClient;
  private final String namespace;
  private final String jobName;
  private final String podName;
  private final String videoPodName;
  private final KubernetesAssetsPath assetsPath;

  KubernetesSession(
      ApiClient kubernetesClient,
      String namespace,
      String jobName,
      String podName,
      String videoPodName,
      Tracer tracer,
      HttpClient client,
      SessionId id,
      URL url,
      Capabilities stereotype,
      Capabilities capabilities,
      Dialect downstream,
      Dialect upstream,
      Instant startTime,
      KubernetesAssetsPath assetsPath) {
    super(tracer, client, id, url, downstream, upstream, stereotype, capabilities, startTime);
    this.kubernetesClient = Require.nonNull("Kubernetes client", kubernetesClient);
    this.namespace = Require.nonNull("Namespace", namespace);
    this.jobName = Require.nonNull("Job name", jobName);
    this.podName = Require.nonNull("Pod name", podName);
    this.videoPodName = videoPodName;
    this.assetsPath = Require.nonNull("Assets path", assetsPath);
  }

  @Override
  public void stop() {
    if (videoPodName != null) {
      deleteVideoPod();
    }
    saveLogs();
    deleteJob();
    super.stop();
  }

  private void deleteVideoPod() {
    try {
      CoreV1Api coreApi = new CoreV1Api(kubernetesClient);
      coreApi.deleteNamespacedPod(videoPodName, namespace);
      LOG.info(String.format("Deleted video pod: %s", videoPodName));
    } catch (Exception e) {
      LOG.log(
          Level.WARNING,
          String.format("Error deleting video pod %s: %s", videoPodName, e.getMessage()),
          e);
    }
  }

  private void saveLogs() {
    String sessionAssetsPath = assetsPath.getHostPath(getId());
    String seleniumServerLog = String.format("%s/selenium-server.log", sessionAssetsPath);
    try {
      CoreV1Api coreApi = new CoreV1Api(kubernetesClient);
      String logs = coreApi.readNamespacedPodLog(podName, namespace).execute();
      if (logs != null) {
        List<String> logLines = List.of(logs.split("\n"));
        Files.write(Paths.get(seleniumServerLog), logLines);
      }
    } catch (Exception e) {
      LOG.log(Level.WARNING, "Error saving logs", e);
    }
  }

  private void deleteJob() {
    try {
      BatchV1Api batchApi = new BatchV1Api(kubernetesClient);
      batchApi.deleteNamespacedJob(jobName, namespace);
      LOG.info(String.format("Deleted Kubernetes job: %s", jobName));
    } catch (Exception e) {
      LOG.log(
          Level.WARNING,
          String.format("Error deleting job %s: %s", jobName, e.getMessage()),
          e);
    }
  }
}
