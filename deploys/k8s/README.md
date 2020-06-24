# Deploying Locally

In order to deploy locally, perform the following steps:

1. Install docker and enable it's kubernetes integration (or install minikube)
2. Run a [local registry](https://docs.docker.com/registry/deploying/#run-a-local-registry).
3. Verify the registry works as expected by following [these steps](https://docs.docker.com/registry/deploying/#copy-an-image-from-docker-hub-to-your-registry).
4. Create a new namespace for the Selenium deploys: `kubectl create namespace selenium`
5. Deploy the Grid: `bazel run deploys/k8s:grid.apply`

