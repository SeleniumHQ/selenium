SUITES = glob(['*Tests.java'])

java_test(name = 'common',
  srcs = SUITES,
  labels = [
    'small',
  ],
  deps = [
    ':tests',
    '//third_party/java/junit:junit',
  ],
)

java_library(name = 'tests',
  srcs = glob(['*.java'], exclude = SUITES),
  deps = [
    '//java/client/src/org/openqa/selenium:selenium',
    '//java/client/src/org/openqa/selenium/remote:remote',
    '//java/server/src/org/openqa/grid:grid',
    '//third_party/java/assertj:assertj',
    '//third_party/java/beust:jcommander',
    '//third_party/java/gson:gson',
    '//third_party/java/junit:junit',
  ],
)
