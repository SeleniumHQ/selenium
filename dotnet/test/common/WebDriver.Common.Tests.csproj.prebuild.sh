#!/bin/bash
if [[ ! -f "%1..\..\..\bazel-bin\java\test\org\openqa\selenium\environment\appserver_deploy.jar" ]]
then
  echo "Building test web server"
  bazel build //java/test/org/openqa/selenium/environment:appserver_deploy.jar
fi
