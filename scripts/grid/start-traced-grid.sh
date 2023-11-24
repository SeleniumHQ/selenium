#!/usr/bin/env bash

SE_JAR=bazel-bin/java/src/org/openqa/selenium/grid/selenium
TRACE_CP=$(coursier fetch -p io.opentelemetry:opentelemetry-exporter-jaeger:1.0.0 io.grpc:grpc-netty:1.35.0)

ps auxw | grep "$SE_JAR" | awk '{print $2}' | xargs kill -9

bazel build grid

java -Dotel.traces.exporter=jaeger -Dotel.exporter.jaeger.endpoint=http://localhost:14250 -Dotel.resource.attributes=service.name=selenium-sessions -jar "$SE_JAR" --ext "$TRACE_CP" sessions &
java -Dotel.traces.exporter=jaeger -Dotel.exporter.jaeger.endpoint=http://localhost:14250 -Dotel.resource.attributes=service.name=selenium-queue -jar "$SE_JAR" --ext "$TRACE_CP" sessionqueue &
java -Dotel.traces.exporter=jaeger -Dotel.exporter.jaeger.endpoint=http://localhost:14250 -Dotel.resource.attributes=service.name=selenium-distributor -jar "$SE_JAR" --ext "$TRACE_CP" distributor -s http://192.168.86.20:5556 --sq http://192.168.86.20:5559 &
java -Dotel.traces.exporter=jaeger -Dotel.exporter.jaeger.endpoint=http://localhost:14250 -Dotel.resource.attributes=service.name=selenium-router -jar "$SE_JAR" --ext "$TRACE_CP" router -s http://192.168.86.20:5556 --sq http://192.168.86.20:5559 -d http://192.168.86.20:5553 &
sleep 2
java -Dotel.traces.exporter=jaeger -Dotel.exporter.jaeger.endpoint=http://localhost:14250 -Dotel.resource.attributes=service.name=selenium-node -jar "$SE_JAR" --ext "$TRACE_CP" node -D selenium/standalone-firefox:latest '{"browserName": "firefox"}' --max-sessions 1 --detect-drivers false
