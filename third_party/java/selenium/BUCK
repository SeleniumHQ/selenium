prebuilt_jar(
  name = 'htmlunit-driver',
  maven_coords = 'org.seleniumhq.selenium:htmlunit-driver:jar:2.32.2-SNAPSHOT',
  binary_jar = 'htmlunit-driver-2.32.2-SNAPSHOT.jar',
  source_jar = 'htmlunit-driver-2.32.2-SNAPSHOT-sources.jar',
  deps = [
    '//java/client/src/org/openqa/selenium/remote:remote',
    '//java/client/src/org/openqa/selenium/support:support',
    '//third_party/java/htmlunit:htmlunit'
  ],
  visibility = [
    '//java/client/test/org/openqa/selenium/htmlunit:htmlunit',
    '//java/client/test/org/openqa/selenium/testing/drivers:drivers',
    '//java/server/src/org/openqa/selenium/remote/server:standalone-server-lib',
    '//java/server/test/org/openqa/grid/e2e:tests',
    '//java/client/test/org/openqa/selenium/testing:test-base',
  ],
)
