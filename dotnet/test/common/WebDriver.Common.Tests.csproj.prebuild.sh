#!/bin/bash
echo "Building test web server"
bazel build //java/test/org/openqa/selenium/environment:appserver_deploy.jar
