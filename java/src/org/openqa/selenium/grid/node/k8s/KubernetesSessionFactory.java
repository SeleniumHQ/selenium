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

import static java.util.Optional.ofNullable;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;

import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.BatchV1Api;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.models.*;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.function.Predicate;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.PersistentCapabilities;
import org.openqa.selenium.RetrySessionRequestException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.node.ActiveSession;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ProtocolHandshake;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.AttributeMap;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;

public class KubernetesSessionFactory implements SessionFactory {

  private static final Logger LOG = Logger.getLogger(KubernetesSessionFactory.class.getName());
  private static final Json JSON = new Json();

  private final Tracer tracer;
  private final HttpClient.Factory clientFactory;
  private final Duration sessionTimeout;
  private final Duration serverStartTimeout;
  private final ApiClient kubernetesClient;
  private final String namespace;
  private final String browserImage;
  private final Capabilities stereotype;
  private final Map<String, String> imageProperties;
  private final String videoImage;
  private final KubernetesAssetsPath assetsPath;
  private final Predicate<Capabilities> predicate;
  private final Map<String, String> resourceLimits;
  private final Map<String, String> resourceRequests;
  private final Map<String, String> labels;
  private final Map<String, String> annotations;

  public KubernetesSessionFactory(
      Tracer tracer,
      HttpClient.Factory clientFactory,
      Duration sessionTimeout,
      Duration serverStartTimeout,
      ApiClient kubernetesClient,
      String namespace,
      String browserImage,
      Capabilities stereotype,
      Map<String, String> imageProperties,
      String videoImage,
      KubernetesAssetsPath assetsPath,
      Predicate<Capabilities> predicate,
      Map<String, String> resourceLimits,
      Map<String, String> resourceRequests,
      Map<String, String> labels,
      Map<String, String> annotations) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.clientFactory = Require.nonNull("HTTP client", clientFactory);
    this.sessionTimeout = Require.nonNull("Session timeout", sessionTimeout);
    this.serverStartTimeout = Require.nonNull("Server start timeout", serverStartTimeout);
    this.kubernetesClient = Require.nonNull("Kubernetes client", kubernetesClient);
    this.namespace = Require.nonNull("Namespace", namespace);
    this.browserImage = Require.nonNull("Browser image", browserImage);
    this.stereotype = ImmutableCapabilities.copyOf(Require.nonNull("Stereotype", stereotype));
    this.imageProperties = Require.nonNull("Image properties", imageProperties);
    this.videoImage = videoImage;
    this.assetsPath = assetsPath;
    this.predicate = Require.nonNull("Accepted capabilities predicate", predicate);
    this.resourceLimits = Require.nonNull("Resource limits", resourceLimits);
    this.resourceRequests = Require.nonNull("Resource requests", resourceRequests);
    this.labels = Require.nonNull("Labels", labels);
    this.annotations = Require.nonNull("Annotations", annotations);
  }

  @Override
  public Capabilities getStereotype() {
    return stereotype;
  }

  @Override
  public boolean test(Capabilities capabilities) {
    return predicate.test(capabilities);
  }

  @Override
  public Either<WebDriverException, ActiveSession> apply(CreateSessionRequest sessionRequest) {
    LOG.info("Starting Kubernetes session for " + sessionRequest.getDesiredCapabilities());

    // Generate unique identifier for Job and Pod naming
    String browserName = sessionRequest.getDesiredCapabilities().getBrowserName();
    if (browserName != null && !browserName.isEmpty()) {
      browserName = browserName.toLowerCase();
    } else {
      browserName = "unknown";
    }
    long timestamp = System.currentTimeMillis();
    String uniqueId = UUID.randomUUID().toString().substring(0, 8);
    String sessionIdentifier = String.format("%s-%d-%s", browserName, timestamp, uniqueId);
    String jobName = "selenium-session-" + sessionIdentifier;

    try (Span span = tracer.getCurrentContext().createSpan("kubernetes_session_factory.apply")) {
      AttributeMap attributeMap = tracer.createAttributeMap();
      attributeMap.put(AttributeKey.LOGGER_CLASS.getKey(), this.getClass().getName());

      LOG.info("Creating Kubernetes Job: " + jobName);

      // Create the Job
      V1Job job = createBrowserJob(jobName, sessionRequest.getDesiredCapabilities(), sessionIdentifier);
      V1Job createdJob;
      String podName;

      try {
        BatchV1Api batchApi = new BatchV1Api(kubernetesClient);
        createdJob = batchApi.createNamespacedJob(namespace, job).execute();
        LOG.info("Job created: " + createdJob.getMetadata().getName());

        // Wait for pod to be created and get its name
        podName = waitForPodCreation(jobName);
        LOG.info("Pod created: " + podName);

        // Wait for pod to be running
        waitForPodRunning(podName);
        LOG.info("Pod is running: " + podName);

        // Get pod IP
        String podIp = getPodIp(podName);
        URL remoteAddress = new URL(String.format("http://%s:4444", podIp));

        attributeMap.put("kubernetes.browser.image", browserImage);
        attributeMap.put("kubernetes.job.name", jobName);
        attributeMap.put("kubernetes.pod.name", podName);
        attributeMap.put("kubernetes.pod.ip", podIp);
        attributeMap.put("kubernetes.server.url", remoteAddress.toString());

        // Create HTTP client
        ClientConfig clientConfig =
            ClientConfig.defaultConfig().baseUrl(remoteAddress).readTimeout(sessionTimeout);
        HttpClient client = clientFactory.createClient(clientConfig);

        LOG.info(String.format("Waiting for server to start (pod: %s, url %s)", podName, remoteAddress));
        try {
          waitForServerToStart(client, serverStartTimeout);
        } catch (TimeoutException e) {
          span.setAttribute(AttributeKey.ERROR.getKey(), true);
          span.setStatus(Status.CANCELLED);
          EXCEPTION.accept(attributeMap, e);
          attributeMap.put(
              AttributeKey.EXCEPTION_MESSAGE.getKey(),
              "Unable to connect to Kubernetes pod. Deleting job: " + e.getMessage());
          span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

          deleteJob(jobName);
          String message = String.format("Unable to connect to Kubernetes pod (job: %s)", jobName);
          LOG.warning(message);
          client.close();
          return Either.left(new RetrySessionRequestException(message));
        }
        LOG.info(String.format("Server is ready (pod: %s)", podName));

        // Create session
        Command command =
            new Command(null, DriverCommand.NEW_SESSION(sessionRequest.getDesiredCapabilities()));
        ProtocolHandshake.Result result;
        Response response;
        try {
          result = new ProtocolHandshake().createSession(client, command);
          response = result.createResponse();
          attributeMap.put(AttributeKey.DRIVER_RESPONSE.getKey(), response.toString());
        } catch (IOException | RuntimeException e) {
          span.setAttribute(AttributeKey.ERROR.getKey(), true);
          span.setStatus(Status.CANCELLED);
          EXCEPTION.accept(attributeMap, e);
          attributeMap.put(
              AttributeKey.EXCEPTION_MESSAGE.getKey(),
              "Unable to create session. Deleting job: " + e.getMessage());
          span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

          deleteJob(jobName);
          String message = "Unable to create session: " + e.getMessage();
          LOG.log(Level.WARNING, message, e);
          client.close();
          return Either.left(new SessionNotCreatedException(message));
        }

        SessionId id = new SessionId(response.getSessionId());
        Capabilities capabilities = new ImmutableCapabilities((Map<?, ?>) response.getValue());
        Capabilities mergedCapabilities = sessionRequest.getDesiredCapabilities().merge(capabilities);
        mergedCapabilities = addForwardCdpEndpoint(mergedCapabilities, podIp, id.toString());

        // Handle video recording pod
        String videoPodName = null;
        Optional<KubernetesAssetsPath> path = ofNullable(this.assetsPath);
        if (path.isPresent()) {
          String podPath = path.get().getPodPath(id);
          saveSessionCapabilities(mergedCapabilities, podPath);
          String hostPath = path.get().getHostPath(id);
          videoPodName = startVideoPod(mergedCapabilities, podIp, hostPath, sessionIdentifier);
        }

        Dialect downstream =
            sessionRequest.getDownstreamDialects().contains(result.getDialect())
                ? result.getDialect()
                : W3C;
        attributeMap.put(AttributeKey.DOWNSTREAM_DIALECT.getKey(), downstream.toString());
        attributeMap.put(AttributeKey.DRIVER_RESPONSE.getKey(), response.toString());

        span.addEvent("Kubernetes driver service created session", attributeMap);
        LOG.fine(
            String.format(
                "Created session: %s - %s (job: %s, pod: %s)",
                id, mergedCapabilities, jobName, podName));

        return Either.right(
            new KubernetesSession(
                kubernetesClient,
                namespace,
                jobName,
                podName,
                videoPodName,
                tracer,
                client,
                id,
                remoteAddress,
                stereotype,
                mergedCapabilities,
                downstream,
                result.getDialect(),
                Instant.now(),
                assetsPath));

      } catch (Exception e) {
        String message = "Failed to create Kubernetes Job: " + e.getMessage();
        LOG.log(Level.SEVERE, message, e);
        return Either.left(new SessionNotCreatedException(message));
      }
    } catch (Exception e) {
      String message = "Unexpected error creating Kubernetes session: " + e.getMessage();
      LOG.log(Level.SEVERE, message, e);
      return Either.left(new SessionNotCreatedException(message));
    }
  }

  private V1Job createBrowserJob(String jobName, Capabilities capabilities, String sessionIdentifier) {
    // Build environment variables
    List<V1EnvVar> envVars = new ArrayList<>();
    envVars.add(new V1EnvVar().name("SE_NODE_MAX_SESSIONS").value("1"));
    envVars.add(new V1EnvVar().name("SE_NODE_SESSION_TIMEOUT").value(String.valueOf(sessionTimeout.getSeconds())));

    // Add screen resolution if specified
    Object screenResolution = capabilities.getCapability("se:screenResolution");
    if (screenResolution != null) {
      envVars.add(new V1EnvVar().name("SE_SCREEN_WIDTH").value(screenResolution.toString().split("x")[0]));
      envVars.add(new V1EnvVar().name("SE_SCREEN_HEIGHT").value(screenResolution.toString().split("x")[1]));
    }

    // Add timezone if specified
    Object timeZone = capabilities.getCapability("se:timeZone");
    if (timeZone != null) {
      envVars.add(new V1EnvVar().name("TZ").value(timeZone.toString()));
    }

    // Build resource requirements
    V1ResourceRequirements resources = new V1ResourceRequirements();
    if (!resourceRequests.isEmpty()) {
      Map<String, io.kubernetes.client.custom.Quantity> requests = new HashMap<>();
      resourceRequests.forEach((k, v) -> requests.put(k, io.kubernetes.client.custom.Quantity.fromString(v)));
      resources.setRequests(requests);
    }
    if (!resourceLimits.isEmpty()) {
      Map<String, io.kubernetes.client.custom.Quantity> limits = new HashMap<>();
      resourceLimits.forEach((k, v) -> limits.put(k, io.kubernetes.client.custom.Quantity.fromString(v)));
      resources.setLimits(limits);
    }

    // Build container
    V1Container container = new V1Container()
        .name("selenium-browser")
        .image(browserImage)
        .env(envVars)
        .resources(resources)
        .addPortsItem(new V1ContainerPort().containerPort(4444).protocol("TCP"));

    // Build pod spec
    V1PodSpec podSpec = new V1PodSpec()
        .restartPolicy("Never")
        .addContainersItem(container);

    // Build pod template
    Map<String, String> podLabels = new HashMap<>(labels);
    podLabels.put("selenium-session", sessionIdentifier);
    podLabels.put("app", "selenium");
    podLabels.put("component", "browser");

    V1PodTemplateSpec podTemplate = new V1PodTemplateSpec()
        .metadata(new V1ObjectMeta()
            .labels(podLabels)
            .annotations(annotations))
        .spec(podSpec);

    // Build job spec
    V1JobSpec jobSpec = new V1JobSpec()
        .template(podTemplate)
        .backoffLimit(0) // Don't retry failed jobs
        .ttlSecondsAfterFinished(300); // Clean up after 5 minutes

    // Build job
    Map<String, String> jobLabels = new HashMap<>(labels);
    jobLabels.put("selenium-session", sessionIdentifier);
    jobLabels.put("app", "selenium");

    return new V1Job()
        .apiVersion("batch/v1")
        .kind("Job")
        .metadata(new V1ObjectMeta()
            .name(jobName)
            .namespace(namespace)
            .labels(jobLabels)
            .annotations(annotations))
        .spec(jobSpec);
  }

  private String waitForPodCreation(String jobName) throws TimeoutException {
    CoreV1Api coreApi = new CoreV1Api(kubernetesClient);
    String labelSelector = "job-name=" + jobName;

    Wait<CoreV1Api> wait = new FluentWait<>(coreApi)
        .withTimeout(Duration.ofSeconds(30))
        .pollingEvery(Duration.ofSeconds(1))
        .ignoring(Exception.class);

    try {
      return wait.until(api -> {
        try {
          V1PodList podList = api.listNamespacedPod(namespace).execute();
          if (podList.getItems() != null && !podList.getItems().isEmpty()) {
            for (V1Pod pod : podList.getItems()) {
              if (pod.getMetadata().getLabels() != null &&
                  jobName.equals(pod.getMetadata().getLabels().get("job-name"))) {
                return pod.getMetadata().getName();
              }
            }
          }
        } catch (Exception e) {
          LOG.log(Level.FINE, "Waiting for pod creation", e);
        }
        return null;
      });
    } catch (org.openqa.selenium.TimeoutException e) {
      throw new TimeoutException("Timeout waiting for pod creation for job: " + jobName);
    }
  }

  private void waitForPodRunning(String podName) throws TimeoutException {
    CoreV1Api coreApi = new CoreV1Api(kubernetesClient);

    Wait<CoreV1Api> wait = new FluentWait<>(coreApi)
        .withTimeout(Duration.ofSeconds(60))
        .pollingEvery(Duration.ofSeconds(2))
        .ignoring(Exception.class);

    try {
      wait.until(api -> {
        try {
          V1Pod pod = api.readNamespacedPod(podName, namespace).execute();
          String phase = pod.getStatus().getPhase();
          return "Running".equals(phase);
        } catch (Exception e) {
          LOG.log(Level.FINE, "Waiting for pod to be running", e);
        }
        return false;
      });
    } catch (org.openqa.selenium.TimeoutException e) {
      throw new TimeoutException("Timeout waiting for pod to be running: " + podName);
    }
  }

  private String getPodIp(String podName) throws Exception {
    CoreV1Api coreApi = new CoreV1Api(kubernetesClient);
    V1Pod pod = coreApi.readNamespacedPod(podName, namespace).execute();
    return pod.getStatus().getPodIP();
  }

  private void waitForServerToStart(HttpClient client, Duration timeout) {
    HttpRequest request = new HttpRequest(GET, "/status");
    Wait<HttpClient> wait = new FluentWait<>(client)
        .withTimeout(timeout)
        .pollingEvery(Duration.ofMillis(500))
        .ignoring(RuntimeException.class);

    wait.until(c -> {
      HttpResponse response = c.execute(request);
      LOG.fine(string(response));
      return 200 == response.getStatus();
    });
  }

  private Capabilities addForwardCdpEndpoint(
      Capabilities sessionCapabilities, String podIp, String sessionId) {
    String cdpPath = String.format("/session/%s/se/cdp", sessionId);
    return new PersistentCapabilities(sessionCapabilities)
        .setCapability("se:cdp", URI.create(String.format("ws://%s:4444%s", podIp, cdpPath)));
  }

  private void saveSessionCapabilities(Capabilities capabilities, String path) {
    try {
      Files.createDirectories(Paths.get(path));
      String capsJson = JSON.toJson(capabilities);
      Files.write(Paths.get(path, "capabilities.json"), capsJson.getBytes(Charset.defaultCharset()));
    } catch (IOException e) {
      LOG.log(Level.WARNING, "Failed to save session capabilities", e);
    }
  }

  private String startVideoPod(Capabilities capabilities, String podIp, String hostPath, String sessionIdentifier) {
    if (videoImage == null || "false".equals(videoImage)) {
      return null;
    }

    Boolean recordVideo = (Boolean) capabilities.getCapability("se:recordVideo");
    if (recordVideo == null || !recordVideo) {
      return null;
    }

    try {
      String videoPodName = "selenium-video-" + sessionIdentifier;

      V1Container videoContainer = new V1Container()
          .name("video-recorder")
          .image(videoImage)
          .addEnvItem(new V1EnvVar().name("DISPLAY_CONTAINER_NAME").value(podIp))
          .addEnvItem(new V1EnvVar().name("FILE_NAME").value(sessionIdentifier + ".mp4"));

      V1PodSpec podSpec = new V1PodSpec()
          .restartPolicy("Never")
          .addContainersItem(videoContainer);

      Map<String, String> podLabels = new HashMap<>(labels);
      podLabels.put("selenium-session", sessionIdentifier);
      podLabels.put("app", "selenium");
      podLabels.put("component", "video");

      V1Pod videoPod = new V1Pod()
          .apiVersion("v1")
          .kind("Pod")
          .metadata(new V1ObjectMeta()
              .name(videoPodName)
              .namespace(namespace)
              .labels(podLabels))
          .spec(podSpec);

      CoreV1Api coreApi = new CoreV1Api(kubernetesClient);
      coreApi.createNamespacedPod(namespace, videoPod);
      LOG.info("Video recording pod created: " + videoPodName);
      return videoPodName;
    } catch (Exception e) {
      LOG.log(Level.WARNING, "Failed to create video recording pod", e);
      return null;
    }
  }

  private void deleteJob(String jobName) {
    try {
      BatchV1Api batchApi = new BatchV1Api(kubernetesClient);
      batchApi.deleteNamespacedJob(jobName, namespace);
    } catch (Exception e) {
      LOG.log(Level.WARNING, "Failed to delete job: " + jobName, e);
    }
  }
}
