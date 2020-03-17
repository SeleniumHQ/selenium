load("@rules_jvm_external//:defs.bzl", "maven_install")
load("@rules_jvm_external//:specs.bzl", "maven")

def selenium_java_deps():
    jetty_version = "9.4.27.v20200227"
    netty_version = "4.1.47.Final"
    opentelemetry_version = "0.2.4"

    maven_install(
        artifacts = [
            "com.beust:jcommander:1.78",
            "com.github.javaparser:javaparser-core:3.15.14",
            "com.google.code.gson:gson:2.8.6",
            "com.google.guava:guava:28.2-jre",
            "com.google.auto:auto-common:0.10",
            "com.google.auto.service:auto-service:1.0-rc6",
            "com.google.auto.service:auto-service-annotations:1.0-rc6",
            "com.squareup.okhttp3:okhttp:4.4.1",
            "com.squareup.okio:okio:2.4.3",
            "com.typesafe.netty:netty-reactive-streams:2.0.4",
            "io.lettuce:lettuce-core:5.2.2.RELEASE",
            "io.netty:netty-buffer:%s" % netty_version,
            "io.netty:netty-codec-haproxy:%s" % netty_version,
            "io.netty:netty-codec-http:%s" % netty_version,
            "io.netty:netty-common:%s" % netty_version,
            "io.netty:netty-handler:%s" % netty_version,
            "io.netty:netty-transport:%s" % netty_version,
            "io.netty:netty-transport-native-epoll:%s" % netty_version,
            "io.netty:netty-transport-native-epoll:jar:linux-x86_64:%s" % netty_version,
            "io.netty:netty-transport-native-kqueue:%s" % netty_version,
            "io.netty:netty-transport-native-kqueue:jar:osx-x86_64:%s" % netty_version,
            "io.netty:netty-transport-native-unix-common:%s" % netty_version,
            "io.opentelemetry:opentelemetry-api:%s" % opentelemetry_version,
            "io.opentelemetry:opentelemetry-context-prop:%s" % opentelemetry_version,
            "io.opentelemetry:opentelemetry-exporters-inmemory:%s" % opentelemetry_version,
            "io.opentelemetry:opentelemetry-exporters-logging:%s" % opentelemetry_version,
            "io.opentelemetry:opentelemetry-sdk:%s" % opentelemetry_version,
            "it.ozimov:embedded-redis:0.7.2",
            "javax.servlet:javax.servlet-api:3.1.0",
            maven.artifact(
                group = "junit",
                artifact = "junit",
                version = "4.13",
                exclusions = [
                    "org.hamcrest:hamcrest-all",
                    "org.hamcrest:hamcrest-core",
                    "org.hamcrest:hamcrest-library",
                ],
            ),
            "net.bytebuddy:byte-buddy:1.10.8",
            "net.sourceforge.htmlunit:htmlunit:2.38.0",
            "net.sourceforge.htmlunit:htmlunit-core-js:2.38.0",
            "org.apache.commons:commons-exec:1.3",
            "org.assertj:assertj-core:3.15.0",
            "org.asynchttpclient:async-http-client:2.11.0",
            "org.eclipse.jetty:jetty-http:%s" % jetty_version,
            "org.eclipse.jetty:jetty-security:%s" % jetty_version,
            "org.eclipse.jetty:jetty-server:%s" % jetty_version,
            "org.eclipse.jetty:jetty-servlet:%s" % jetty_version,
            "org.eclipse.jetty:jetty-servlets:%s" % jetty_version,
            "org.eclipse.jetty:jetty-util:%s" % jetty_version,
            "org.eclipse.mylyn.github:org.eclipse.egit.github.core:2.1.5",
            "org.hamcrest:hamcrest:2.2",
            "org.mockito:mockito-core:3.3.0",
            "org.slf4j:slf4j-jdk14:1.7.30",
            "org.testng:testng:7.1.0",
            "org.zeromq:jeromq:0.5.2",
            "xyz.rogfam:littleproxy:2.0.0-beta-5",
            "org.seleniumhq.selenium:htmlunit-driver:2.38.0",
        ],
        excluded_artifacts = [
            "org.hamcrest:hamcrest-all", # Replaced by hamcrest 2
            "org.hamcrest:hamcrest-core",
            "io.netty:netty-all", # Depend on the actual things you need
        ],
        override_targets = {
            "org.seleniumhq.selenium:selenium-api": "@//java/client/src/org/openqa/selenium:core",
            "org.seleniumhq.selenium:selenium-remote-driver": "@//java/client/src/org/openqa/selenium/remote:remote",
            "org.seleniumhq.selenium:selenium-support": "@//java/client/src/org/openqa/selenium/support",
        },
        fail_on_missing_checksum = True,
        fetch_sources = True,
        strict_visibility = True,
        repositories = [
            "https://repo1.maven.org/maven2",
            "https://jcenter.bintray.com/",
            "https://maven.google.com",
        ],
        maven_install_json = "@selenium//java:maven_install.json",
    )
