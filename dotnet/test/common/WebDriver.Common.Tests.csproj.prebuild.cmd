if not exist "%1..\..\..\bazel-bin\java\test\org\openqa\selenium\environment\appserver_deploy.jar" (
  echo Building test web server
  pushd "%1..\..\.."
  bazel build //java/test/org/openqa/selenium/environment:appserver_deploy.jar
  popd
)
