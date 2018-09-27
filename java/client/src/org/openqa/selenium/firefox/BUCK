load("//:selenium-version.bzl", "SE_VERSION")
load("//java:rules.bzl", "java_library")

java_library(name = 'firefox',
  maven_coords = 'org.seleniumhq.selenium:selenium-firefox-driver:jar:' + SE_VERSION,
  maven_pom_template = '//java/client/src/org/openqa/selenium:template-pom',
  module_info = "module-info.txt",
  srcs = glob(['*.java', 'internal/*.java']),
  resources = [
    ':amd64',
    ':i386',
    ':prefs',
    ':webdriver.xpi',
  ],
  exported_deps = [
    '//java/client/src/org/openqa/selenium/remote:remote',
  ],
  provided_deps = [
    '//third_party/java/service:auto-service',
  ],
  annotation_processor_deps = [
    '//third_party/java/auto:auto-common',
    '//third_party/java/service:auto-service',
    '//third_party/java/guava:guava',
  ],
  annotation_processors = [
    'com.google.auto.service.processor.AutoServiceProcessor',
  ],
  deps = [
    '//third_party/java/guava:guava',
  ],
  visibility = [ 'PUBLIC' ],
)

export_file(name = 'prefs',
  src = '//javascript/firefox-driver:webdriver_prefs',
  out = 'webdriver_prefs.json',
)

export_file(name = 'webdriver.xpi',
  src = '//javascript/firefox-driver:webdriver',
)

export_file(
  name = 'i386',
  src = '//cpp/prebuilt:noblur32',
  out = 'x86/x_ignore_nofocus.so'
)

export_file(
  name = 'amd64',
  src = '//cpp/prebuilt:noblur64',
  out = 'amd64/x_ignore_nofocus.so'
)
