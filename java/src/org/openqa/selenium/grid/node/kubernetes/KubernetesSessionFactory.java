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

import static java.util.Optional.ofNullable;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;

import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.ContainerBuilder;
import io.fabric8.kubernetes.api.model.ContainerPortBuilder;
import io.fabric8.kubernetes.api.model.DeletionPropagation;
import io.fabric8.kubernetes.api.model.EmptyDirVolumeSourceBuilder;
import io.fabric8.kubernetes.api.model.EnvVar;
import io.fabric8.kubernetes.api.model.EnvVarBuilder;
import io.fabric8.kubernetes.api.model.ObjectMetaBuilder;
import io.fabric8.kubernetes.api.model.OwnerReference;
import io.fabric8.kubernetes.api.model.OwnerReferenceBuilder;
import io.fabric8.kubernetes.api.model.PersistentVolumeClaimVolumeSourceBuilder;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodCondition;
import io.fabric8.kubernetes.api.model.PodIP;
import io.fabric8.kubernetes.api.model.PodList;
import io.fabric8.kubernetes.api.model.PodSpecBuilder;
import io.fabric8.kubernetes.api.model.PodTemplateSpecBuilder;
import io.fabric8.kubernetes.api.model.Quantity;
import io.fabric8.kubernetes.api.model.ResourceRequirementsBuilder;
import io.fabric8.kubernetes.api.model.Volume;
import io.fabric8.kubernetes.api.model.VolumeBuilder;
import io.fabric8.kubernetes.api.model.VolumeMount;
import io.fabric8.kubernetes.api.model.VolumeMountBuilder;
import io.fabric8.kubernetes.api.model.batch.v1.Job;
import io.fabric8.kubernetes.api.model.batch.v1.JobBuilder;
import io.fabric8.kubernetes.api.model.batch.v1.JobSpecBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientException;
import io.fabric8.kubernetes.client.LocalPortForward;
import io.fabric8.kubernetes.client.Watch;
import io.fabric8.kubernetes.client.Watcher;
import io.fabric8.kubernetes.client.WatcherException;
import io.fabric8.kubernetes.client.utils.Serialization;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TimeZone;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.PersistentCapabilities;
import org.openqa.selenium.RetrySessionRequestException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.UsernameAndPassword;
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
  private static final int BROWSER_PORT = 4444;
  private static final int MAX_JOB_NAME_LENGTH = 63;
  private static final String SHM_VOLUME_NAME = "dshm";
  private static final String SHM_SIZE_LIMIT = "2Gi";
  private static final String ASSETS_VOLUME_NAME = "session-assets";
  private static final String VIDEO_MOUNT_PATH = "/videos";
  private static final Duration SERVER_START_CONNECT_TIMEOUT = Duration.ofSeconds(2);

  private final Tracer tracer;
  private final HttpClient.Factory clientFactory;
  private final Duration sessionTimeout;
  private final Duration serverStartTimeout;
  private final Supplier<KubernetesClient> kubeClientSupplier;
  private volatile KubernetesClient kubeClient;
  private final String namespace;
  private final String browserImage;
  private final Capabilities stereotype;
  private final @Nullable String imagePullPolicy;
  private final @Nullable String serviceAccount;
  private final Map<String, Quantity> resourceRequests;
  private final Map<String, Quantity> resourceLimits;
  private final Map<String, String> nodeSelector;
  private final @Nullable String videoImage;
  private final @Nullable String assetsPath;
  private final InheritedPodSpec inheritedPodSpec;
  private final @Nullable Job jobTemplate;
  private final long terminationGracePeriodSeconds;
  private final boolean usePortForwarding;
  private final Predicate<Capabilities> predicate;
  private final @Nullable OwnerReference nodePodOwnerReference;

  public KubernetesSessionFactory(
      Tracer tracer,
      HttpClient.Factory clientFactory,
      Duration sessionTimeout,
      Duration serverStartTimeout,
      Supplier<KubernetesClient> kubeClientSupplier,
      String namespace,
      String browserImage,
      Capabilities stereotype,
      String imagePullPolicy,
      @Nullable String serviceAccount,
      Map<String, Quantity> resourceRequests,
      Map<String, Quantity> resourceLimits,
      Map<String, String> nodeSelector,
      @Nullable String videoImage,
      @Nullable String assetsPath,
      InheritedPodSpec inheritedPodSpec,
      long terminationGracePeriodSeconds,
      boolean usePortForwarding,
      Predicate<Capabilities> predicate) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.clientFactory = Require.nonNull("HTTP client", clientFactory);
    this.sessionTimeout = Require.nonNull("Session timeout", sessionTimeout);
    this.serverStartTimeout = Require.nonNull("Server start timeout", serverStartTimeout);
    this.kubeClientSupplier = Require.nonNull("KubernetesClient supplier", kubeClientSupplier);
    this.kubeClient = kubeClientSupplier.get();
    this.namespace = Require.nonNull("Namespace", namespace);
    this.browserImage = Require.nonNull("Browser image", browserImage);
    this.stereotype = ImmutableCapabilities.copyOf(Require.nonNull("Stereotype", stereotype));
    this.imagePullPolicy = Require.nonNull("Image pull policy", imagePullPolicy);
    this.serviceAccount = serviceAccount;
    this.resourceRequests = Require.nonNull("Resource requests", resourceRequests);
    this.resourceLimits = Require.nonNull("Resource limits", resourceLimits);
    this.nodeSelector = Require.nonNull("Node selector", nodeSelector);
    this.videoImage = videoImage;
    this.assetsPath = assetsPath;
    this.inheritedPodSpec = Require.nonNull("Inherited pod spec", inheritedPodSpec);
    this.terminationGracePeriodSeconds = terminationGracePeriodSeconds;
    this.jobTemplate = null;
    this.usePortForwarding = usePortForwarding;
    this.predicate = Require.nonNull("Accepted capabilities predicate", predicate);
    this.nodePodOwnerReference = createNodePodOwnerReference(this.inheritedPodSpec);
  }

  public KubernetesSessionFactory(
      Tracer tracer,
      HttpClient.Factory clientFactory,
      Duration sessionTimeout,
      Duration serverStartTimeout,
      Supplier<KubernetesClient> kubeClientSupplier,
      String namespace,
      String browserImage,
      Capabilities stereotype,
      Job jobTemplate,
      @Nullable String videoImage,
      @Nullable String assetsPath,
      long terminationGracePeriodSeconds,
      boolean usePortForwarding,
      Predicate<Capabilities> predicate) {
    this(
        tracer,
        clientFactory,
        sessionTimeout,
        serverStartTimeout,
        kubeClientSupplier,
        namespace,
        browserImage,
        stereotype,
        jobTemplate,
        videoImage,
        assetsPath,
        InheritedPodSpec.empty(),
        terminationGracePeriodSeconds,
        usePortForwarding,
        predicate);
  }

  public KubernetesSessionFactory(
      Tracer tracer,
      HttpClient.Factory clientFactory,
      Duration sessionTimeout,
      Duration serverStartTimeout,
      Supplier<KubernetesClient> kubeClientSupplier,
      String namespace,
      String browserImage,
      Capabilities stereotype,
      Job jobTemplate,
      @Nullable String videoImage,
      @Nullable String assetsPath,
      InheritedPodSpec inheritedPodSpec,
      long terminationGracePeriodSeconds,
      boolean usePortForwarding,
      Predicate<Capabilities> predicate) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.clientFactory = Require.nonNull("HTTP client", clientFactory);
    this.sessionTimeout = Require.nonNull("Session timeout", sessionTimeout);
    this.serverStartTimeout = Require.nonNull("Server start timeout", serverStartTimeout);
    this.kubeClientSupplier = Require.nonNull("KubernetesClient supplier", kubeClientSupplier);
    this.kubeClient = kubeClientSupplier.get();
    this.namespace = Require.nonNull("Namespace", namespace);
    this.browserImage = Require.nonNull("Browser image", browserImage);
    this.stereotype = ImmutableCapabilities.copyOf(Require.nonNull("Stereotype", stereotype));
    this.jobTemplate = Require.nonNull("Job template", jobTemplate);
    this.imagePullPolicy = null;
    this.serviceAccount = null;
    this.resourceRequests = Map.of();
    this.resourceLimits = Map.of();
    this.nodeSelector = Map.of();
    this.videoImage = videoImage;
    this.assetsPath = assetsPath;
    this.inheritedPodSpec = Require.nonNull("Inherited pod spec", inheritedPodSpec);
    this.terminationGracePeriodSeconds = terminationGracePeriodSeconds;
    this.usePortForwarding = usePortForwarding;
    this.predicate = Require.nonNull("Accepted capabilities predicate", predicate);
    this.nodePodOwnerReference = createNodePodOwnerReference(this.inheritedPodSpec);
  }

  @Override
  public Capabilities getStereotype() {
    return stereotype;
  }

  @Override
  public boolean test(Capabilities capabilities) {
    return predicate.test(capabilities);
  }

  /**
   * Executes a K8s API call with automatic connection refresh on stale connection errors. If the
   * call fails due to a closed connection (e.g. idle timeout from Vert.x/Netty), the client is
   * rebuilt from the supplier and the call is retried once.
   */
  private <T> T withK8sRetry(Supplier<T> action) {
    try {
      return action.get();
    } catch (KubernetesClientException e) {
      if (isConnectionError(e)) {
        LOG.info("K8s API connection lost, refreshing client and retrying: " + e.getMessage());
        refreshClient();
        return action.get();
      }
      throw e;
    }
  }

  private synchronized void refreshClient() {
    try {
      kubeClient.close();
    } catch (Exception e) {
      LOG.log(Level.FINE, "Error closing stale K8s client", e);
    }
    kubeClient = kubeClientSupplier.get();
  }

  static boolean isConnectionError(Throwable e) {
    Throwable t = e;
    while (t != null) {
      String msg = t.getMessage();
      if (msg != null && msg.contains("Connection was closed")) {
        return true;
      }
      t = t.getCause();
    }
    return false;
  }

  @Override
  public Either<WebDriverException, ActiveSession> apply(CreateSessionRequest sessionRequest) {
    LOG.info("Starting K8s session for " + sessionRequest.getDesiredCapabilities());

    String browserName = sessionRequest.getDesiredCapabilities().getBrowserName();
    if (browserName.isEmpty()) {
      browserName = "unknown";
    } else {
      browserName = browserName.toLowerCase();
    }
    long timestamp = System.currentTimeMillis();
    String uniqueId = UUID.randomUUID().toString().substring(0, 8);
    String jobName = generateJobName(browserName, timestamp, uniqueId);

    try (Span span = tracer.getCurrentContext().createSpan("kubernetes_session_factory.apply")) {
      AttributeMap attributeMap = tracer.createAttributeMap();
      attributeMap.put(AttributeKey.LOGGER_CLASS.getKey(), this.getClass().getName());

      LOG.info(String.format("Creating K8s Job: %s in namespace: %s", jobName, namespace));

      Job job =
          jobTemplate != null
              ? buildJobSpecFromTemplate(jobName, sessionRequest.getDesiredCapabilities())
              : buildJobSpec(jobName, sessionRequest.getDesiredCapabilities());

      try {
        withK8sRetry(
            () -> kubeClient.batch().v1().jobs().inNamespace(namespace).resource(job).create());
      } catch (KubernetesClientException e) {
        String message = String.format("Failed to create K8s Job %s: %s", jobName, e.getMessage());
        LOG.warning(message);
        return Either.left(new RetrySessionRequestException(message));
      }

      attributeMap.put("k8s.job.name", jobName);
      attributeMap.put("k8s.namespace", namespace);
      attributeMap.put("k8s.browser.image", browserImage);

      // Wait for Pod to be running and get its name and IP
      String[] podInfo;
      try {
        podInfo = waitForPodRunning(jobName);
      } catch (WebDriverException e) {
        span.setAttribute(AttributeKey.ERROR.getKey(), true);
        span.setStatus(Status.CANCELLED);

        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(
            AttributeKey.EXCEPTION_MESSAGE.getKey(),
            "Pod failed to reach Running state: " + e.getMessage());
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

        deleteJob(jobName);
        String message =
            String.format("Pod for Job %s failed to start: %s", jobName, e.getMessage());
        LOG.warning(message);
        return Either.left(new RetrySessionRequestException(message));
      }

      String podName = podInfo[0];
      String podIp = podInfo[1];

      LocalPortForward portForward = null;
      String connectHost;
      int connectPort;
      if (usePortForwarding) {
        try {
          portForward =
              withK8sRetry(
                  () ->
                      kubeClient
                          .pods()
                          .inNamespace(namespace)
                          .withName(podName)
                          .portForward(BROWSER_PORT));
          connectHost = "localhost";
          connectPort = portForward.getLocalPort();
          LOG.info(
              String.format(
                  "Port-forwarding %s:%d → localhost:%d", podName, BROWSER_PORT, connectPort));
        } catch (KubernetesClientException e) {
          deleteJob(jobName);
          return Either.left(
              new RetrySessionRequestException("Failed to set up port-forward: " + e.getMessage()));
        }
      } else {
        connectHost = podIp;
        connectPort = BROWSER_PORT;
      }

      URL remoteAddress = getUrl(connectHost, connectPort);
      ClientConfig baseConfig =
          ClientConfig.defaultConfig().baseUrl(remoteAddress).readTimeout(sessionTimeout);
      baseConfig = applyBasicAuth(baseConfig);
      ClientConfig pollingConfig = baseConfig.connectionTimeout(SERVER_START_CONNECT_TIMEOUT);
      HttpClient pollingClient = clientFactory.createClient(pollingConfig);

      attributeMap.put("k8s.pod.name", podName);
      attributeMap.put("k8s.pod.ip", podIp);
      attributeMap.put("k8s.server.url", remoteAddress.toString());

      LOG.info(
          String.format("Waiting for server to start (job: %s, url: %s)", jobName, remoteAddress));
      try {
        waitForServerToStart(pollingClient, serverStartTimeout);
      } catch (TimeoutException e) {
        span.setAttribute(AttributeKey.ERROR.getKey(), true);
        span.setStatus(Status.CANCELLED);

        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(
            AttributeKey.EXCEPTION_MESSAGE.getKey(),
            "Unable to connect to browser server in K8s Pod: " + e.getMessage());
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

        closePortForward(portForward);
        deleteJob(jobName);
        String message = String.format("Unable to connect to browser server (job: %s)", jobName);
        LOG.warning(message);
        return Either.left(new RetrySessionRequestException(message));
      } finally {
        pollingClient.close();
      }
      LOG.info(String.format("Server is ready (job: %s)", jobName));

      HttpClient client = clientFactory.createClient(baseConfig);

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
            "Unable to create session. Deleting K8s Job: " + e.getMessage());
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

        closePortForward(portForward);
        deleteJob(jobName);
        String message = "Unable to create session: " + e.getMessage();
        LOG.log(Level.WARNING, message, e);
        client.close();
        return Either.left(new SessionNotCreatedException(message));
      }

      SessionId id = new SessionId(response.getSessionId());
      Capabilities capabilities = new ImmutableCapabilities((Map<?, ?>) response.getValue());
      Capabilities mergedCapabilities = sessionRequest.getDesiredCapabilities().merge(capabilities);
      mergedCapabilities =
          addForwardCdpEndpoint(mergedCapabilities, connectHost, connectPort, id.toString());

      if (assetsPath != null) {
        saveSessionCapabilities(mergedCapabilities, id.toString());
      }

      Dialect downstream =
          sessionRequest.getDownstreamDialects().contains(result.getDialect())
              ? result.getDialect()
              : W3C;
      attributeMap.put(AttributeKey.DOWNSTREAM_DIALECT.getKey(), downstream.toString());
      attributeMap.put(AttributeKey.DRIVER_RESPONSE.getKey(), response.toString());

      span.addEvent("Kubernetes driver service created session", attributeMap);
      LOG.fine(
          String.format("Created session: %s - %s (job: %s)", id, mergedCapabilities, jobName));
      String videoFileName = null;
      if (recordVideoForSession(sessionRequest.getDesiredCapabilities())
          && !isVideoFileNameAuto()) {
        videoFileName =
            resolveVideoFileName(jobName, sessionRequest.getDesiredCapabilities(), id) + ".mp4";
      }
      return Either.right(
          new KubernetesSession(
              jobName,
              namespace,
              kubeClient,
              podName,
              assetsPath,
              videoFileName,
              terminationGracePeriodSeconds,
              portForward,
              tracer,
              client,
              id,
              remoteAddress,
              stereotype,
              mergedCapabilities,
              downstream,
              result.getDialect(),
              Instant.now()));
    }
  }

  private String generateJobName(String browserName, long timestamp, String uniqueId) {
    String name = String.format("selenium-session-%s-%d-%s", browserName, timestamp, uniqueId);
    if (name.length() > MAX_JOB_NAME_LENGTH) {
      // Truncate browser name to fit within the K8s 63-char limit
      int fixedPartLength =
          "selenium-session-".length()
              + 1
              + String.valueOf(timestamp).length()
              + 1
              + uniqueId.length();
      int maxBrowserLength = MAX_JOB_NAME_LENGTH - fixedPartLength;
      if (maxBrowserLength > 0) {
        browserName = browserName.substring(0, Math.min(browserName.length(), maxBrowserLength));
      } else {
        browserName = "";
      }
      name = String.format("selenium-session-%s-%d-%s", browserName, timestamp, uniqueId);
      if (name.length() > MAX_JOB_NAME_LENGTH) {
        name = name.substring(0, MAX_JOB_NAME_LENGTH);
      }
    }
    return name;
  }

  @Nullable
  private static OwnerReference createNodePodOwnerReference(
      @Nullable InheritedPodSpec inheritedPodSpec) {
    if (inheritedPodSpec == null || !inheritedPodSpec.hasNodePodOwnerReference()) {
      return null;
    }

    return new OwnerReferenceBuilder()
        .withApiVersion("v1")
        .withKind("Pod")
        .withName(inheritedPodSpec.getNodePodName())
        .withUid(inheritedPodSpec.getNodePodUid())
        .build();
  }

  private ObjectMetaBuilder buildJobMetadata(String jobName, Map<String, String> labels) {
    ObjectMetaBuilder metadataBuilder =
        new ObjectMetaBuilder().withName(jobName).withNamespace(namespace).withLabels(labels);
    if (nodePodOwnerReference != null) {
      metadataBuilder.withOwnerReferences(nodePodOwnerReference);
    }
    return metadataBuilder;
  }

  Job buildJobSpec(String jobName, Capabilities sessionCapabilities) {
    Map<String, String> labels = new HashMap<>();
    // Inherited labels first (lowest precedence)
    if (!inheritedPodSpec.getLabels().isEmpty()) {
      labels.putAll(inheritedPodSpec.getLabels());
    }
    // Session labels win over inherited
    labels.put("app", "selenium-session");
    labels.put("se/job-name", jobName);
    String browser = sessionCapabilities.getBrowserName();
    if (!browser.isEmpty()) {
      labels.put("se/browser", browser.toLowerCase());
    }

    Map<String, String> annotations = new HashMap<>();
    if (!inheritedPodSpec.getAnnotations().isEmpty()) {
      annotations.putAll(inheritedPodSpec.getAnnotations());
    }

    List<Container> containers = new ArrayList<>();
    containers.add(buildBrowserContainer(jobName, sessionCapabilities));

    if (videoImage != null
        && !videoImage.equalsIgnoreCase("false")
        && recordVideoForSession(sessionCapabilities)) {
      containers.add(buildVideoContainer(jobName, sessionCapabilities));
    }

    List<Volume> volumes = new ArrayList<>();

    // Shared memory volume for browser (Chrome needs >64MB /dev/shm)
    volumes.add(
        new VolumeBuilder()
            .withName(SHM_VOLUME_NAME)
            .withEmptyDir(
                new EmptyDirVolumeSourceBuilder()
                    .withMedium("Memory")
                    .withSizeLimit(new Quantity(SHM_SIZE_LIMIT))
                    .build())
            .build());

    // Assets volume shared between browser and video containers
    if (assetsPath != null) {
      String assetsClaimName = inheritedPodSpec.getAssetsClaimName();
      if (assetsClaimName != null) {
        // PVC shared with Node Pod for persistent session artifacts
        volumes.add(
            new VolumeBuilder()
                .withName(ASSETS_VOLUME_NAME)
                .withPersistentVolumeClaim(
                    new PersistentVolumeClaimVolumeSourceBuilder()
                        .withClaimName(assetsClaimName)
                        .build())
                .build());
        LOG.info(String.format("Using PVC '%s' for session assets", assetsClaimName));
      } else {
        // Fallback: emptyDir for video sharing between containers in the same Pod
        volumes.add(
            new VolumeBuilder()
                .withName(ASSETS_VOLUME_NAME)
                .withEmptyDir(new EmptyDirVolumeSourceBuilder().build())
                .build());
      }
    }

    PodSpecBuilder podSpecBuilder =
        new PodSpecBuilder()
            .withRestartPolicy("Never")
            .withContainers(containers)
            .withVolumes(volumes)
            .withTerminationGracePeriodSeconds(terminationGracePeriodSeconds);

    // serviceAccountName (already resolved: CLI → inherited → omit)
    if (serviceAccount != null && !serviceAccount.isEmpty()) {
      podSpecBuilder.withServiceAccountName(serviceAccount);
    }

    // nodeSelector (already resolved: CLI → inherited → omit)
    if (!nodeSelector.isEmpty()) {
      podSpecBuilder.withNodeSelector(nodeSelector);
    }

    // Inherited-only fields (no CLI override)
    if (!inheritedPodSpec.getTolerations().isEmpty()) {
      podSpecBuilder.withTolerations(inheritedPodSpec.getTolerations());
    }
    if (inheritedPodSpec.getAffinity() != null) {
      podSpecBuilder.withAffinity(inheritedPodSpec.getAffinity());
    }
    if (!inheritedPodSpec.getImagePullSecrets().isEmpty()) {
      podSpecBuilder.withImagePullSecrets(inheritedPodSpec.getImagePullSecrets());
    }
    if (inheritedPodSpec.getDnsPolicy() != null) {
      podSpecBuilder.withDnsPolicy(inheritedPodSpec.getDnsPolicy());
    }
    if (inheritedPodSpec.getDnsConfig() != null) {
      podSpecBuilder.withDnsConfig(inheritedPodSpec.getDnsConfig());
    }
    if (inheritedPodSpec.getSecurityContext() != null) {
      podSpecBuilder.withSecurityContext(inheritedPodSpec.getSecurityContext());
    }
    if (inheritedPodSpec.getPriorityClassName() != null) {
      podSpecBuilder.withPriorityClassName(inheritedPodSpec.getPriorityClassName());
    }

    long sessionTimeoutSeconds = sessionTimeout.getSeconds();

    ObjectMetaBuilder templateMetaBuilder = new ObjectMetaBuilder().withLabels(labels);
    if (!annotations.isEmpty()) {
      templateMetaBuilder.withAnnotations(annotations);
    }

    return new JobBuilder()
        .withMetadata(buildJobMetadata(jobName, labels).build())
        .withSpec(
            new JobSpecBuilder()
                .withBackoffLimit(0)
                .withTtlSecondsAfterFinished(30)
                .withActiveDeadlineSeconds(sessionTimeoutSeconds)
                .withTemplate(
                    new PodTemplateSpecBuilder()
                        .withMetadata(templateMetaBuilder.build())
                        .withSpec(podSpecBuilder.build())
                        .build())
                .build())
        .build();
  }

  private void setEnvVarsToContainer(List<EnvVar> envVars) {
    // Forward SE_* and LANGUAGE env vars from the current process
    System.getenv().entrySet().stream()
        .filter(
            entry ->
                entry.getKey().startsWith("SE_") || entry.getKey().equalsIgnoreCase("LANGUAGE"))
        .forEach(
            entry ->
                envVars.add(
                    new EnvVarBuilder()
                        .withName(entry.getKey())
                        .withValue(entry.getValue())
                        .build()));
  }

  private void setCapsToEnvVars(Capabilities sessionCapabilities, List<EnvVar> envVars) {
    // Screen resolution from capabilities
    Optional<Dimension> screenResolution = ofNullable(getScreenResolution(sessionCapabilities));
    screenResolution.ifPresent(
        dimension -> {
          envVars.add(
              new EnvVarBuilder()
                  .withName("SE_SCREEN_WIDTH")
                  .withValue(String.valueOf(dimension.getWidth()))
                  .build());
          envVars.add(
              new EnvVarBuilder()
                  .withName("SE_SCREEN_HEIGHT")
                  .withValue(String.valueOf(dimension.getHeight()))
                  .build());
        });

    // Timezone from capabilities
    Optional<TimeZone> timeZone = ofNullable(getTimeZone(sessionCapabilities));
    timeZone.ifPresent(
        zone -> envVars.add(new EnvVarBuilder().withName("TZ").withValue(zone.getID()).build()));
  }

  private List<EnvVar> buildSessionEnvVars(String jobName, Capabilities sessionCapabilities) {
    List<EnvVar> envVars = new ArrayList<>();
    // Passing env vars set to the child container
    setEnvVarsToContainer(envVars);
    // Capabilities set to env vars with higher precedence
    setCapsToEnvVars(sessionCapabilities, envVars);

    // Video recording env vars (inline and external use the same naming).
    // If SE_VIDEO_FILE_NAME is already "auto" from the environment, respect it and let the
    // recorder handle naming. Otherwise, set it to jobName because sessionId is not yet available.
    if (recordVideoForSession(sessionCapabilities)) {
      if (!isVideoFileNameAuto()) {
        envVars.add(
            new EnvVarBuilder().withName("SE_VIDEO_FILE_NAME").withValue(jobName + ".mp4").build());
      }

      // Inline video recording: browser container records directly (no sidecar)
      if (isNoVideoSidecar()) {
        envVars.add(new EnvVarBuilder().withName("SE_RECORD_VIDEO").withValue("true").build());
        envVars.add(
            new EnvVarBuilder().withName("SE_VIDEO_RECORD_STANDALONE").withValue("true").build());
      }
    }

    return envVars;
  }

  private String resolveVideoFileName(String jobName, Capabilities sessionCapabilities) {
    return ofNullable(getVideoFileName(sessionCapabilities, "se:videoName"))
        .or(() -> ofNullable(getVideoFileName(sessionCapabilities, "se:name")))
        .orElse(jobName);
  }

  private String resolveVideoFileName(
      String jobName, Capabilities sessionCapabilities, SessionId sessionId) {
    String baseName = resolveVideoFileName(jobName, sessionCapabilities);
    // Append sessionId suffix when the video name came from caps (se:videoName or se:name)
    // and SE_VIDEO_FILE_NAME_SUFFIX is not explicitly disabled (default: true).
    boolean nameFromCaps = !baseName.equals(jobName);
    String suffixEnv = System.getenv("SE_VIDEO_FILE_NAME_SUFFIX");
    boolean appendSuffix = suffixEnv == null || !suffixEnv.equalsIgnoreCase("false");
    if (nameFromCaps && appendSuffix) {
      return baseName + "_" + sessionId;
    }
    return baseName;
  }

  private Container buildBrowserContainer(String jobName, Capabilities sessionCapabilities) {
    List<EnvVar> envVars = buildSessionEnvVars(jobName, sessionCapabilities);

    List<VolumeMount> volumeMounts = new ArrayList<>();
    volumeMounts.add(
        new VolumeMountBuilder().withName(SHM_VOLUME_NAME).withMountPath("/dev/shm").build());

    // Mount assets volume for session artifacts (capabilities, logs, video)
    if (assetsPath != null) {
      volumeMounts.add(
          new VolumeMountBuilder().withName(ASSETS_VOLUME_NAME).withMountPath(assetsPath).build());

      // Inline video recording: mount /videos on browser container (same as external sidecar)
      if (isNoVideoSidecar() && recordVideoForSession(sessionCapabilities)) {
        volumeMounts.add(
            new VolumeMountBuilder()
                .withName(ASSETS_VOLUME_NAME)
                .withMountPath(VIDEO_MOUNT_PATH)
                .build());
      }
    }

    ContainerBuilder containerBuilder =
        new ContainerBuilder()
            .withName("browser")
            .withImage(browserImage)
            .withImagePullPolicy(imagePullPolicy)
            .withPorts(
                new ContainerPortBuilder()
                    .withContainerPort(BROWSER_PORT)
                    .withProtocol("TCP")
                    .build())
            .withEnv(envVars)
            .withVolumeMounts(volumeMounts);

    // Resource requirements
    if (!resourceRequests.isEmpty() || !resourceLimits.isEmpty()) {
      ResourceRequirementsBuilder resourcesBuilder = new ResourceRequirementsBuilder();
      if (!resourceRequests.isEmpty()) {
        resourcesBuilder.withRequests(resourceRequests);
      }
      if (!resourceLimits.isEmpty()) {
        resourcesBuilder.withLimits(resourceLimits);
      }
      containerBuilder.withResources(resourcesBuilder.build());
    }

    return containerBuilder.build();
  }

  private List<EnvVar> buildVideoEnvVars(String jobName, Capabilities sessionCapabilities) {
    List<EnvVar> envVars = new ArrayList<>();
    setEnvVarsToContainer(envVars);
    setCapsToEnvVars(sessionCapabilities, envVars);
    envVars.add(
        new EnvVarBuilder().withName("DISPLAY_CONTAINER_NAME").withValue("localhost").build());
    envVars.add(
        new EnvVarBuilder().withName("SE_VIDEO_RECORD_STANDALONE").withValue("true").build());
    if (!isVideoFileNameAuto()) {
      envVars.add(
          new EnvVarBuilder().withName("SE_VIDEO_FILE_NAME").withValue(jobName + ".mp4").build());
    }
    return envVars;
  }

  private Container buildVideoContainer(String jobName, Capabilities sessionCapabilities) {
    List<EnvVar> envVars = buildVideoEnvVars(jobName, sessionCapabilities);

    List<VolumeMount> volumeMounts = new ArrayList<>();
    // Mount assets volume at /videos for video sidecar output
    if (assetsPath != null) {
      volumeMounts.add(
          new VolumeMountBuilder()
              .withName(ASSETS_VOLUME_NAME)
              .withMountPath(VIDEO_MOUNT_PATH)
              .build());
    }

    return new ContainerBuilder()
        .withName("video")
        .withImage(videoImage)
        .withImagePullPolicy(imagePullPolicy)
        .withEnv(envVars)
        .withVolumeMounts(volumeMounts)
        .build();
  }

  @Nullable
  private String getVideoFileName(Capabilities sessionRequestCapabilities, String capabilityName) {
    String trimRegex = getVideoFileNameTrimRegex();
    Optional<Object> testName =
        ofNullable(sessionRequestCapabilities.getCapability(capabilityName));
    if (testName.isPresent()) {
      String name = testName.get().toString();
      if (!name.isEmpty()) {
        name = name.replaceAll(" ", "_").replaceAll(trimRegex, "");
        if (name.length() > 251) {
          name = name.substring(0, 251);
        }
        return name;
      }
    }
    return null;
  }

  private String getVideoFileNameTrimRegex() {
    String defaultRegex = "[^a-zA-Z0-9-_]";
    String envRegex = System.getenv("SE_VIDEO_FILE_NAME_TRIM_REGEX");
    if (envRegex == null || envRegex.isEmpty()) {
      return defaultRegex;
    }
    try {
      Pattern.compile(envRegex);
      return envRegex;
    } catch (PatternSyntaxException e) {
      LOG.warning(
          String.format(
              "Invalid SE_VIDEO_FILE_NAME_TRIM_REGEX '%s': %s. Using default: %s",
              envRegex, e.getMessage(), defaultRegex));
      return defaultRegex;
    }
  }

  private boolean isNoVideoSidecar() {
    return videoImage == null || videoImage.equalsIgnoreCase("false");
  }

  private boolean isVideoFileNameAuto() {
    return "auto".equalsIgnoreCase(System.getenv("SE_VIDEO_FILE_NAME"));
  }

  Job buildJobSpecFromTemplate(String jobName, Capabilities sessionCapabilities) {
    // Deep copy via YAML round-trip so the original template is not mutated
    Job job = Serialization.unmarshal(Serialization.asYaml(jobTemplate), Job.class);

    // Override Job metadata
    Map<String, String> labels = new HashMap<>();
    if (job.getMetadata() != null && job.getMetadata().getLabels() != null) {
      labels.putAll(job.getMetadata().getLabels());
    }
    labels.put("app", "selenium-session");
    labels.put("se/job-name", jobName);
    String browser = sessionCapabilities.getBrowserName();
    if (!browser.isEmpty()) {
      labels.put("se/browser", browser.toLowerCase());
    }

    job.setMetadata(buildJobMetadata(jobName, labels).build());

    // Override Job spec fields
    long sessionTimeoutSeconds = sessionTimeout.getSeconds();
    job.getSpec().setBackoffLimit(0);
    job.getSpec().setTtlSecondsAfterFinished(30);
    job.getSpec().setActiveDeadlineSeconds(sessionTimeoutSeconds);

    // Override Pod template labels
    Map<String, String> podLabels = new HashMap<>();
    if (job.getSpec().getTemplate().getMetadata() != null
        && job.getSpec().getTemplate().getMetadata().getLabels() != null) {
      podLabels.putAll(job.getSpec().getTemplate().getMetadata().getLabels());
    }
    podLabels.putAll(labels);
    if (job.getSpec().getTemplate().getMetadata() == null) {
      job.getSpec().getTemplate().setMetadata(new ObjectMetaBuilder().build());
    }
    job.getSpec().getTemplate().getMetadata().setLabels(podLabels);

    // Override restartPolicy and termination grace period
    job.getSpec().getTemplate().getSpec().setRestartPolicy("Never");
    job.getSpec()
        .getTemplate()
        .getSpec()
        .setTerminationGracePeriodSeconds(terminationGracePeriodSeconds);

    // Merge browser container
    Container browserContainer =
        findContainerByName(job.getSpec().getTemplate().getSpec().getContainers(), "browser");
    if (browserContainer != null) {
      mergeBrowserContainer(browserContainer, jobName, sessionCapabilities);
    }

    // Ensure /dev/shm volume exists
    ensureShmVolume(job);

    // Ensure assets volume exists if configured
    if (assetsPath != null) {
      ensureAssetsVolume(job);
      ensureVolumeMount(browserContainer, ASSETS_VOLUME_NAME, assetsPath);

      // Inline video recording: mount /videos on browser container (same as external sidecar)
      if (isNoVideoSidecar() && recordVideoForSession(sessionCapabilities)) {
        ensureVolumeMount(browserContainer, ASSETS_VOLUME_NAME, VIDEO_MOUNT_PATH);
      }
    }

    // Handle external video sidecar container
    if (videoImage != null
        && !videoImage.equalsIgnoreCase("false")
        && recordVideoForSession(sessionCapabilities)) {
      Container videoContainer =
          findContainerByName(job.getSpec().getTemplate().getSpec().getContainers(), "video");
      if (videoContainer != null) {
        // Template already has a video container — just ensure env vars
        mergeVideoContainerEnv(videoContainer, jobName, sessionCapabilities);
      } else {
        // Add the standard video sidecar
        job.getSpec()
            .getTemplate()
            .getSpec()
            .getContainers()
            .add(buildVideoContainer(jobName, sessionCapabilities));
      }
    }

    return job;
  }

  @Nullable
  static Container findContainerByName(@Nullable List<Container> containers, String name) {
    if (containers == null) {
      return null;
    }
    return containers.stream().filter(c -> name.equals(c.getName())).findFirst().orElse(null);
  }

  private void mergeBrowserContainer(
      Container container, String jobName, Capabilities sessionCapabilities) {
    // Merge session env vars — session vars win on name conflict
    List<EnvVar> sessionEnvVars = buildSessionEnvVars(jobName, sessionCapabilities);
    mergeEnvVars(container, sessionEnvVars);

    // Ensure port 4444
    ensurePort(container, BROWSER_PORT);

    // Ensure /dev/shm mount
    ensureVolumeMount(container, SHM_VOLUME_NAME, "/dev/shm");

    // Inline video recording: mount /videos on browser container (same as external sidecar)
    if (assetsPath != null && isNoVideoSidecar() && recordVideoForSession(sessionCapabilities)) {
      ensureVolumeMount(container, ASSETS_VOLUME_NAME, VIDEO_MOUNT_PATH);
    }
  }

  private void mergeVideoContainerEnv(
      Container videoContainer, String jobName, Capabilities sessionCapabilities) {
    mergeEnvVars(videoContainer, buildVideoEnvVars(jobName, sessionCapabilities));

    // Ensure video mount path
    if (assetsPath != null) {
      ensureVolumeMount(videoContainer, ASSETS_VOLUME_NAME, VIDEO_MOUNT_PATH);
    }
  }

  static void mergeEnvVars(Container container, List<EnvVar> sessionEnvVars) {
    List<EnvVar> existing = container.getEnv();
    if (existing == null) {
      existing = new ArrayList<>();
      container.setEnv(existing);
    }

    // Build set of session var names for conflict resolution
    Map<String, EnvVar> sessionMap = new HashMap<>();
    for (EnvVar ev : sessionEnvVars) {
      sessionMap.put(ev.getName(), ev);
    }

    // Remove template vars that conflict with session vars (session wins)
    existing.removeIf(ev -> sessionMap.containsKey(ev.getName()));

    // Add all session vars
    existing.addAll(sessionEnvVars);
  }

  static void ensurePort(Container container, int port) {
    if (container.getPorts() == null) {
      container.setPorts(new ArrayList<>());
    }
    boolean hasPort =
        container.getPorts().stream()
            .anyMatch(p -> p.getContainerPort() != null && p.getContainerPort() == port);
    if (!hasPort) {
      container
          .getPorts()
          .add(new ContainerPortBuilder().withContainerPort(port).withProtocol("TCP").build());
    }
  }

  static void ensureVolumeMount(
      @Nullable Container container, String volumeName, String mountPath) {
    if (container == null) {
      return;
    }
    List<VolumeMount> mounts = container.getVolumeMounts();
    if (mounts == null) {
      mounts = new ArrayList<>();
      container.setVolumeMounts(mounts);
    }
    boolean hasMount = mounts.stream().anyMatch(m -> volumeName.equals(m.getName()));
    if (!hasMount) {
      mounts.add(new VolumeMountBuilder().withName(volumeName).withMountPath(mountPath).build());
    }
  }

  private void ensureShmVolume(Job job) {
    List<Volume> volumes = job.getSpec().getTemplate().getSpec().getVolumes();
    if (volumes == null) {
      volumes = new ArrayList<>();
      job.getSpec().getTemplate().getSpec().setVolumes(volumes);
    }
    boolean hasShm = volumes.stream().anyMatch(v -> SHM_VOLUME_NAME.equals(v.getName()));
    if (!hasShm) {
      volumes.add(
          new VolumeBuilder()
              .withName(SHM_VOLUME_NAME)
              .withEmptyDir(
                  new EmptyDirVolumeSourceBuilder()
                      .withMedium("Memory")
                      .withSizeLimit(new Quantity(SHM_SIZE_LIMIT))
                      .build())
              .build());
    }
  }

  private void ensureAssetsVolume(Job job) {
    List<Volume> volumes = job.getSpec().getTemplate().getSpec().getVolumes();
    if (volumes == null) {
      volumes = new ArrayList<>();
      job.getSpec().getTemplate().getSpec().setVolumes(volumes);
    }
    boolean hasAssets = volumes.stream().anyMatch(v -> ASSETS_VOLUME_NAME.equals(v.getName()));
    if (!hasAssets) {
      String assetsClaimName = inheritedPodSpec.getAssetsClaimName();
      if (assetsClaimName != null) {
        volumes.add(
            new VolumeBuilder()
                .withName(ASSETS_VOLUME_NAME)
                .withPersistentVolumeClaim(
                    new PersistentVolumeClaimVolumeSourceBuilder()
                        .withClaimName(assetsClaimName)
                        .build())
                .build());
      } else {
        volumes.add(
            new VolumeBuilder()
                .withName(ASSETS_VOLUME_NAME)
                .withEmptyDir(new EmptyDirVolumeSourceBuilder().build())
                .build());
      }
    }
  }

  private String[] waitForPodRunning(String jobName) {
    try {
      return doWaitForPodRunning(jobName);
    } catch (KubernetesClientException | SessionNotCreatedException e) {
      if (isConnectionError(e)) {
        LOG.info(
            String.format(
                "K8s connection lost while waiting for pod (job: %s), refreshing and retrying",
                jobName));
        refreshClient();
        return doWaitForPodRunning(jobName);
      }
      throw e;
    }
  }

  private String[] doWaitForPodRunning(String jobName) {
    CompletableFuture<String[]> future = new CompletableFuture<>();

    try (Watch ignored =
        kubeClient
            .pods()
            .inNamespace(namespace)
            .withLabel("job-name", jobName)
            .watch(
                new Watcher<>() {
                  @Override
                  public void eventReceived(Action action, Pod pod) {
                    if (action == Action.DELETED) {
                      future.completeExceptionally(
                          new SessionNotCreatedException(
                              String.format("Pod for job %s was deleted", jobName)));
                      return;
                    }
                    if (action == Action.ERROR) {
                      future.completeExceptionally(
                          new SessionNotCreatedException(
                              String.format("Error watching pod for job %s", jobName)));
                      return;
                    }
                    evaluatePodStatus(pod, jobName, future);
                  }

                  @Override
                  public void onClose(@Nullable WatcherException cause) {
                    if (!future.isDone() && cause != null) {
                      future.completeExceptionally(
                          new SessionNotCreatedException(
                              String.format(
                                  "Watch closed for job %s: %s", jobName, cause.getMessage())));
                    }
                  }
                })) {

      // Check current state to handle race where pod became ready before watch was established
      PodList podList =
          kubeClient.pods().inNamespace(namespace).withLabel("job-name", jobName).list();
      if (podList != null && podList.getItems() != null) {
        for (Pod pod : podList.getItems()) {
          evaluatePodStatus(pod, jobName, future);
          if (future.isDone()) {
            break;
          }
        }
      }

      return future.get(serverStartTimeout.toMillis(), TimeUnit.MILLISECONDS);
    } catch (ExecutionException e) {
      Throwable cause = e.getCause();
      if (cause instanceof WebDriverException) {
        throw (WebDriverException) cause;
      }
      throw new SessionNotCreatedException("Pod failed: " + cause.getMessage(), cause);
    } catch (java.util.concurrent.TimeoutException e) {
      throw new TimeoutException(
          String.format("Timed out waiting for pod to be running (job: %s)", jobName));
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new SessionNotCreatedException("Interrupted waiting for pod to start");
    }
  }

  private void evaluatePodStatus(Pod pod, String jobName, CompletableFuture<String[]> future) {
    if (future.isDone()) {
      return;
    }
    if (pod.getStatus() == null || pod.getStatus().getPhase() == null) {
      return;
    }

    String phase = pod.getStatus().getPhase();

    if ("Failed".equals(phase)) {
      String reason = pod.getStatus().getReason();
      future.completeExceptionally(
          new SessionNotCreatedException(
              String.format("Pod for job %s failed: %s", jobName, reason)));
      return;
    }

    // Check for image pull errors in container statuses
    if (pod.getStatus().getContainerStatuses() != null) {
      for (var cs : pod.getStatus().getContainerStatuses()) {
        if (cs.getState() != null && cs.getState().getWaiting() != null) {
          String waitReason = cs.getState().getWaiting().getReason();
          if ("ImagePullBackOff".equals(waitReason) || "ErrImagePull".equals(waitReason)) {
            future.completeExceptionally(
                new SessionNotCreatedException(
                    String.format(
                        "Image pull failed for job %s: %s",
                        jobName, cs.getState().getWaiting().getMessage())));
            return;
          }
        }
      }
    }

    // Check for Unschedulable condition
    if (pod.getStatus().getConditions() != null) {
      for (PodCondition c : pod.getStatus().getConditions()) {
        if ("PodScheduled".equals(c.getType())
            && "False".equals(c.getStatus())
            && "Unschedulable".equals(c.getReason())) {
          future.completeExceptionally(
              new SessionNotCreatedException(
                  String.format("Pod for job %s is unschedulable: %s", jobName, c.getMessage())));
          return;
        }
      }
    }

    String podIp = resolvePodIp(pod);
    if ("Running".equals(phase) && podIp != null && isPodReady(pod)) {
      String name = pod.getMetadata() != null ? pod.getMetadata().getName() : jobName;
      future.complete(new String[] {name, podIp});
    }
  }

  private boolean isPodReady(Pod pod) {
    if (pod.getStatus() == null) {
      return false;
    }

    if (pod.getStatus().getConditions() != null) {
      Optional<PodCondition> readyCondition =
          pod.getStatus().getConditions().stream()
              .filter(c -> "Ready".equals(c.getType()))
              .findFirst();
      if (readyCondition.isPresent()) {
        return "True".equals(readyCondition.get().getStatus());
      }
    }

    if (pod.getStatus().getContainerStatuses() != null) {
      return pod.getStatus().getContainerStatuses().stream()
          .allMatch(cs -> Boolean.TRUE.equals(cs.getReady()));
    }

    return true;
  }

  @Nullable
  private String resolvePodIp(Pod pod) {
    if (pod.getStatus() == null) {
      return null;
    }
    List<@Nullable PodIP> podIps = pod.getStatus().getPodIPs();
    if (podIps != null) {
      for (PodIP podIp : podIps) {
        if (podIp != null && podIp.getIp() != null && !podIp.getIp().isBlank()) {
          return podIp.getIp();
        }
      }
    }
    String podIp = pod.getStatus().getPodIP();
    if (podIp != null && !podIp.isBlank()) {
      return podIp;
    }
    return null;
  }

  private void waitForServerToStart(HttpClient client, Duration duration) {
    Wait<Object> wait =
        new FluentWait<>(new Object()).withTimeout(duration).ignoring(UncheckedIOException.class);

    wait.until(
        obj -> {
          HttpResponse response = client.execute(new HttpRequest(GET, "/status"));
          LOG.fine(response::contentAsString);
          if (401 == response.getStatus()) {
            LOG.warning(
                "Server requires basic authentication. "
                    + "Set SE_ROUTER_USERNAME and SE_ROUTER_PASSWORD environment variables "
                    + "to provide credentials.");
          }
          return 200 == response.getStatus();
        });
  }

  private ClientConfig applyBasicAuth(ClientConfig clientConfig) {
    String routerUsername = System.getenv("SE_ROUTER_USERNAME");
    String routerPassword = System.getenv("SE_ROUTER_PASSWORD");
    if (routerUsername != null
        && !routerUsername.isEmpty()
        && routerPassword != null
        && !routerPassword.isEmpty()) {
      return clientConfig.authenticateAs(new UsernameAndPassword(routerUsername, routerPassword));
    }
    return clientConfig;
  }

  private Capabilities addForwardCdpEndpoint(
      Capabilities sessionCapabilities, String podIp, int port, String sessionId) {
    String forwardCdpPath = String.format("ws://%s:%s/session/%s/se/fwd", podIp, port, sessionId);
    return new PersistentCapabilities(sessionCapabilities)
        .setCapability("se:forwardCdp", forwardCdpPath);
  }

  private void closePortForward(@Nullable LocalPortForward portForward) {
    if (portForward != null) {
      try {
        portForward.close();
      } catch (IOException e) {
        LOG.log(Level.WARNING, "Failed to close port-forward", e);
      }
    }
  }

  private void deleteJob(String jobName) {
    try {
      kubeClient
          .batch()
          .v1()
          .jobs()
          .inNamespace(namespace)
          .withName(jobName)
          .withPropagationPolicy(DeletionPropagation.FOREGROUND)
          .delete();
    } catch (KubernetesClientException e) {
      LOG.log(
          Level.WARNING,
          String.format("Failed to delete K8s Job %s/%s: %s", namespace, jobName, e.getMessage()),
          e);
    }
  }

  private void saveSessionCapabilities(Capabilities sessionCapabilities, String sessionId) {
    String capsToJson = new Json().toJson(sessionCapabilities);
    try {
      java.nio.file.Path sessionDir = Paths.get(assetsPath, sessionId);
      Files.createDirectories(sessionDir);
      Files.writeString(
          sessionDir.resolve("sessionCapabilities.json"), capsToJson, Charset.defaultCharset());
    } catch (IOException e) {
      LOG.log(Level.WARNING, "Failed to save session capabilities", e);
    }
  }

  private URL getUrl(String host, int port) {
    try {
      return new URL(String.format("http://%s:%s/wd/hub", host, port));
    } catch (MalformedURLException e) {
      throw new SessionNotCreatedException(e.getMessage(), e);
    }
  }

  @Nullable
  private TimeZone getTimeZone(Capabilities sessionRequestCapabilities) {
    Optional<Object> timeZone = ofNullable(sessionRequestCapabilities.getCapability("se:timeZone"));
    if (timeZone.isPresent()) {
      String tz = timeZone.get().toString();
      if (List.of(TimeZone.getAvailableIDs()).contains(tz)) {
        return TimeZone.getTimeZone(tz);
      }
    }
    String envTz = System.getenv("TZ");
    if (List.of(TimeZone.getAvailableIDs()).contains(envTz)) {
      return TimeZone.getTimeZone(envTz);
    }
    return null;
  }

  private boolean recordVideoForSession(Capabilities sessionRequestCapabilities) {
    Optional<Object> recordVideo =
        ofNullable(sessionRequestCapabilities.getCapability("se:recordVideo"));
    return recordVideo.isPresent() && Boolean.parseBoolean(recordVideo.get().toString());
  }

  @Nullable
  private Dimension getScreenResolution(Capabilities sessionRequestCapabilities) {
    Optional<Object> screenResolution =
        ofNullable(sessionRequestCapabilities.getCapability("se:screenResolution"));
    if (screenResolution.isEmpty()) {
      return null;
    }
    try {
      String[] resolution = screenResolution.get().toString().split("x");
      int screenWidth = Integer.parseInt(resolution[0]);
      int screenHeight = Integer.parseInt(resolution[1]);
      if (screenWidth > 0 && screenHeight > 0) {
        return new Dimension(screenWidth, screenHeight);
      }
    } catch (Exception e) {
      LOG.warning("Values provided for screenResolution are not valid: " + screenResolution);
    }
    return null;
  }
}
