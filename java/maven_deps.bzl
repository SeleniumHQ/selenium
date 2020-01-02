load("@rules_jvm_external//:defs.bzl", "maven_install")
load("@rules_jvm_external//:specs.bzl", "maven")

def selenium_java_deps():
    maven_install(
        artifacts = [
            "com.beust:jcommander:1.72",
            "com.github.javaparser:javaparser-core:3.15.5",
            "com.google.code.gson:gson:2.8.6",
            "com.google.guava:guava:28.2-jre",
            "com.google.auto:auto-common:0.10",
            "com.google.auto.service:auto-service:1.0-rc6",
            "com.google.auto.service:auto-service-annotations:1.0-rc6",
            "com.squareup.okhttp3:okhttp:4.2.2",
            "com.typesafe.netty:netty-reactive-streams:2.0.3",
            "io.netty:netty-all:4.1.43.Final",
            "io.opentracing:opentracing-api:0.33.0",
            "io.opentracing:opentracing-noop:0.33.0",
            "io.opentracing.contrib:opentracing-tracerresolver:0.1.8",
            "javax.servlet:javax.servlet-api:3.1.0",
            "junit:junit:4.12",
            "net.bytebuddy:byte-buddy:1.10.2",
            "net.sourceforge.htmlunit:htmlunit:2.36.0",
            "net.sourceforge.htmlunit:htmlunit-core-js:2.36.0",
            "org.apache.commons:commons-exec:1.3",
            "org.assertj:assertj-core:3.13.2",
            "org.asynchttpclient:async-http-client:2.10.3",
            "org.eclipse.jetty:jetty-http:9.4.22.v20191022",
            "org.eclipse.jetty:jetty-security:9.4.22.v20191022",
            "org.eclipse.jetty:jetty-server:9.4.22.v20191022",
            "org.eclipse.jetty:jetty-servlet:9.4.22.v20191022",
            "org.eclipse.jetty:jetty-servlets:9.4.22.v20191022",
            "org.eclipse.jetty:jetty-util:9.4.22.v20191022",
            "org.eclipse.mylyn.github:org.eclipse.egit.github.core:2.1.5",
            "org.hamcrest:hamcrest:2.2",
            "org.mockito:mockito-core:3.1.0",
            "org.testng:testng:6.14.3",
            "org.zeromq:jeromq:0.5.1",
            "xyz.rogfam:littleproxy:2.0.0-beta-5",
            maven.artifact(
                group = "org.seleniumhq.selenium",
                artifact = "htmlunit-driver",
                version = "2.36.0",
                exclusions = [
                    "org.seleniumhq.selenium:selenium-api",
                    "org.seleniumhq.selenium:selenium-remote-driver",
                    "org.seleniumhq.selenium:selenium-support",
                ],
            ),
        ],
        excluded_artifacts = [
            "io.netty:netty-all", # Depend on the actual things you need
        ],
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
