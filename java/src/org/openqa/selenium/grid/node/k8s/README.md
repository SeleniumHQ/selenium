# Kubernetes Node for Selenium Grid

This implementation provides a Kubernetes-based Node for Selenium Grid that creates Kubernetes Jobs for each browser session, similar to how the Docker Node creates containers.

## Overview

The Kubernetes Node implementation consists of the following components:

- **KubernetesSession**: Manages the lifecycle of a browser session running in a Kubernetes Pod
- **KubernetesSessionFactory**: Creates Kubernetes Jobs and establishes connections to browser pods
- **KubernetesOptions**: Parses and manages configuration from config files or CLI flags
- **KubernetesFlags**: Defines command-line flags for Kubernetes configuration
- **KubernetesAssetsPath**: Manages paths for session assets (logs, videos, etc.)

## Architecture

### How It Works

1. **Session Request**: When a new session is requested, the `KubernetesSessionFactory` is invoked
2. **Job Creation**: A Kubernetes Job is created with a Pod spec containing the browser container
3. **Pod Startup**: The factory waits for the Pod to be created and become running
4. **Connection**: Once running, an HTTP client connects to the Pod's IP address
5. **Session Creation**: A WebDriver session is created via the protocol handshake
6. **Session Management**: The `KubernetesSession` manages the active session
7. **Cleanup**: When the session ends, the Job (and its Pod) are deleted

### Comparison with Docker Node

| Feature | Docker Node | Kubernetes Node |
|---------|-------------|-----------------|
| Resource Type | Container | Job → Pod |
| Client Library | Custom Docker client | Official Kubernetes Java client |
| Networking | Docker networks | Kubernetes Pod networking |
| Storage | Volume mounts | PersistentVolumeClaims/EmptyDir |
| Resource Limits | Docker host config | Kubernetes resources |
| Cleanup | Container stop/remove | Job deletion (cascades to Pod) |

## Configuration

### Using Configuration File (TOML)

```toml
[k8s]
namespace = "selenium"
server-start-timeout = 60

configs = [
    "selenium/standalone-chrome:latest", "{\"browserName\": \"chrome\"}",
    "selenium/standalone-firefox:latest", "{\"browserName\": \"firefox\"}"
]

cpu-request = "500m"
memory-request = "1Gi"
cpu-limit = "1"
memory-limit = "2Gi"

labels = ["environment", "production"]
video-image = "selenium/video:latest"
assets-path = "/opt/selenium/assets"
```

### Using CLI Flags

```bash
java -jar selenium-server.jar node \
  --k8s-namespace selenium \
  --k8s selenium/standalone-chrome:latest '{"browserName": "chrome"}' \
  --k8s selenium/standalone-firefox:latest '{"browserName": "firefox"}' \
  --k8s-cpu-request 500m \
  --k8s-memory-request 1Gi \
  --k8s-cpu-limit 1 \
  --k8s-memory-limit 2Gi \
  --k8s-labels environment production team qa \
  --k8s-video-image selenium/video:latest \
  --k8s-assets-path /opt/selenium/assets
```

### Configuration Options

| Option | CLI Flag | Config | Description | Default |
|--------|----------|--------|-------------|---------|
| Kubeconfig Path | `--k8s-kubeconfig` | `k8s.kubeconfig` | Path to kubeconfig file | Default kubeconfig or in-cluster |
| Namespace | `--k8s-namespace` | `k8s.namespace` | Kubernetes namespace | `default` |
| Server Start Timeout | `--k8s-server-start-timeout` | `k8s.server-start-timeout` | Pod startup timeout (seconds) | `60` |
| Browser Configs | `--k8s` or `-K` | `k8s.configs` | Image to capabilities mapping | - |
| CPU Request | `--k8s-cpu-request` | `k8s.cpu-request` | CPU resource request | - |
| Memory Request | `--k8s-memory-request` | `k8s.memory-request` | Memory resource request | - |
| CPU Limit | `--k8s-cpu-limit` | `k8s.cpu-limit` | CPU resource limit | - |
| Memory Limit | `--k8s-memory-limit` | `k8s.memory-limit` | Memory resource limit | - |
| Labels | `--k8s-labels` | `k8s.labels` | Custom Pod labels (key-value pairs) | - |
| Annotations | `--k8s-annotations` | `k8s.annotations` | Custom Pod annotations | - |
| Video Image | `--k8s-video-image` | `k8s.video-image` | Video recording image | `false` (disabled) |
| Assets Path | `--k8s-assets-path` | `k8s.assets-path` | Path for session assets | `/opt/selenium/assets` |
| Image Pull Policy | `--k8s-image-pull-policy` | `k8s.image-pull-policy` | Image pull policy | - |

## Prerequisites

### Kubernetes Cluster

You need access to a Kubernetes cluster with:
- Kubernetes 1.20+ (recommended)
- Sufficient resources for browser pods
- Network connectivity between Grid Node and Pods

### Authentication

The Node can authenticate to Kubernetes using:
1. **In-cluster configuration**: When running inside a Kubernetes cluster with a ServiceAccount
2. **Kubeconfig file**: Specify `--k8s-kubeconfig /path/to/config`
3. **Default kubeconfig**: Uses `~/.kube/config` by default

### RBAC Permissions

The ServiceAccount (or kubeconfig user) needs these permissions:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: selenium-grid-node
  namespace: selenium
rules:
- apiGroups: ["batch"]
  resources: ["jobs"]
  verbs: ["create", "delete", "get", "list"]
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["create", "delete", "get", "list", "watch"]
- apiGroups: [""]
  resources: ["pods/log"]
  verbs: ["get"]
```

## Deployment Examples

### Standalone Node

Deploy the Grid Node as a Kubernetes Deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: selenium-grid-k8s-node
  namespace: selenium
spec:
  replicas: 1
  selector:
    matchLabels:
      app: selenium-grid
      component: k8s-node
  template:
    metadata:
      labels:
        app: selenium-grid
        component: k8s-node
    spec:
      serviceAccountName: selenium-grid-node
      containers:
      - name: node
        image: selenium/node-k8s:latest
        ports:
        - containerPort: 5555
        env:
        - name: SE_EVENT_BUS_HOST
          value: "selenium-hub"
        - name: SE_EVENT_BUS_PUBLISH_PORT
          value: "4442"
        - name: SE_EVENT_BUS_SUBSCRIBE_PORT
          value: "4443"
        volumeMounts:
        - name: config
          mountPath: /opt/selenium/config.toml
          subPath: config.toml
        - name: assets
          mountPath: /opt/selenium/assets
      volumes:
      - name: config
        configMap:
          name: k8s-node-config
      - name: assets
        emptyDir: {}
```

### With Config Map

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: k8s-node-config
  namespace: selenium
data:
  config.toml: |
    [k8s]
    namespace = "selenium"
    configs = [
        "selenium/standalone-chrome:latest", "{\"browserName\": \"chrome\"}",
        "selenium/standalone-firefox:latest", "{\"browserName\": \"firefox\"}"
    ]
    cpu-request = "500m"
    memory-request = "1Gi"
    cpu-limit = "1"
    memory-limit = "2Gi"
```

## Features

### Resource Management

The Kubernetes Node supports fine-grained resource control:

```bash
--k8s-cpu-request 500m        # Request 0.5 CPU cores
--k8s-memory-request 1Gi      # Request 1 GB memory
--k8s-cpu-limit 2             # Limit to 2 CPU cores
--k8s-memory-limit 4Gi        # Limit to 4 GB memory
```

### Custom Labels and Annotations

Add custom metadata to browser Jobs/Pods:

```bash
--k8s-labels environment production team qa managed-by selenium
--k8s-annotations prometheus.io/scrape true prometheus.io/port 4444
```

### Video Recording

Enable video recording for sessions:

```bash
--k8s-video-image selenium/video:latest
```

The video recording pod will be automatically created alongside the browser pod and deleted when the session ends.

### Session Assets

Logs and other session assets are saved to the configured assets path:

```bash
--k8s-assets-path /opt/selenium/assets
```

Each session gets its own directory: `/opt/selenium/assets/{session-id}/`

## Troubleshooting

### Pod Creation Timeout

If pods fail to start within the timeout:
- Increase `--k8s-server-start-timeout`
- Check image pull time with `kubectl describe pod`
- Verify sufficient cluster resources

### Permission Denied

If you see `Forbidden` errors:
- Verify RBAC permissions are correctly configured
- Check ServiceAccount is bound to the Role
- Ensure namespace matches configuration

### Network Connectivity

If the Node cannot connect to Pods:
- Verify Pod networking is functional
- Check firewall rules
- Ensure Network Policies allow traffic

### Logs

View Node logs:
```bash
kubectl logs -f deployment/selenium-grid-k8s-node -n selenium
```

View browser Pod logs:
```bash
kubectl logs selenium-session-chrome-{timestamp}-{uuid} -n selenium
```

## Integration with LocalNodeFactory

The Kubernetes Node is automatically registered with `LocalNodeFactory` if Kubernetes configurations are present:

```java
if (config.getAll("k8s", "configs").isPresent()) {
  new KubernetesOptions(config)
      .getKubernetesSessionFactories(tracer, clientFactory, nodeOptions)
      .forEach((caps, factories) -> factories.forEach(factory -> builder.add(caps, factory)));
}
```

## Differences from OneShotNode

The existing `OneShotNode` is a simple implementation that:
- Runs a single local WebDriver session per pod
- Drains immediately after session creation
- Doesn't create Jobs - just runs the browser locally

This new Kubernetes Node implementation:
- Creates Kubernetes Jobs for each session (like Docker Node creates containers)
- Supports multiple concurrent sessions
- Provides full session lifecycle management
- Integrates with the Grid like Docker Node does

## Development

### Dependencies

The Kubernetes Node uses the official Kubernetes Java client:

```xml
<dependency>
    <groupId>io.kubernetes</groupId>
    <artifactId>client-java</artifactId>
    <version>24.0.0-legacy</version>
</dependency>
```

### Building

```bash
bazel build //java/src/org/openqa/selenium/grid/node/k8s
```

### Testing

```bash
bazel test //java/test/org/openqa/selenium/grid/node/k8s:all
```

## License

Licensed under the Apache License, Version 2.0. See LICENSE file for details.
