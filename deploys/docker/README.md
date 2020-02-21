# Building Docker images

The docker images here are configured to be deployed to a docker registry
running locally. This can be started by:

  1. Install docker for your machine. You may want to configure it to use
     more memory and CPU than it defaults to.
  1. Following the steps to set up a [local registry](https://docs.docker.com/registry/deploying/#run-a-local-registry).
  2. Verify the registry works as expected by following [these steps](https://docs.docker.com/registry/deploying/#copy-an-image-from-docker-hub-to-your-registry).

If you're feeling brave: `docker run -d -p 5000:5000 --restart=always --name registry registry:2.7.1`

It is assumed that the registry will be available at http://localhost:5000.
