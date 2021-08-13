// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.remote.tracing.opentelemetry;

import io.opentelemetry.sdk.trace.export.SpanExporter;

import java.lang.reflect.Method;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * We use an awful lof of reflection here because it's the only way we can
 * get this to work without requiring the selenium server take a dependency
 * on Jaeger, which may not be needed in all cases.
 */
class JaegerTracing {

  private static final Logger LOGGER = Logger.getLogger(JaegerTracing.class.getName());

  static Optional<SpanExporter> findJaegerExporter() {
    String host = System.getProperty("JAEGER_AGENT_HOST");
    if (host == null) {
      return Optional.empty();
    }

    String rawPort = System.getProperty("JAEGER_AGENT_PORT", "14250");
    int port = -1;
    try {
      port = Integer.parseInt(rawPort);
    } catch (NumberFormatException e) {
      LOGGER.log(Level.WARNING, "Error parsing port from JAEGER_AGENT_PORT environment variable", e);
      return Optional.empty();
    }
    if (port == -1) {
      return Optional.empty();
    }

    try {
      Object jaegerChannel = createManagedChannel(host, port);
      SpanExporter toReturn = (SpanExporter) createJaegerGrpcSpanExporter(jaegerChannel);

      if (toReturn == null) {
        return Optional.empty();
      }

      LOGGER.info(String.format("Attaching Jaeger tracing to %s:%s", host, port));
      return Optional.of(toReturn);
    } catch (ReflectiveOperationException e) {
      LOGGER.log(Level.WARNING, "Cannot instantiate Jaeger tracer", e);
      return Optional.empty();
    }
  }

  private static Object createManagedChannel(String host, int port) throws ReflectiveOperationException {
    // Equivalent to:
    // ManagedChannelBuilder.forAddress(host, port).usePlaintext().build();

    ClassLoader cl = Thread.currentThread().getContextClassLoader();

    Class<?> builderClazz = Class.forName("io.grpc.ManagedChannelBuilder", true, cl);
    Method forAddress = builderClazz.getMethod("forAddress", String.class, int.class);
    Object value = forAddress.invoke(null, host, port);

    Method usePlaintext = builderClazz.getMethod("usePlaintext");
    value = usePlaintext.invoke(value);

    Method build = builderClazz.getMethod("build");
    return build.invoke(value);
  }

  private static Object createJaegerGrpcSpanExporter(Object jaegerChannel) throws ReflectiveOperationException {
    // Equivalent to:
    // return JaegerGrpcSpanExporter.newBuilder()
    //   .setServiceName("selenium")
    //   .setChannel(jaegerChannel)
    //   .setDeadlineMs(30000)
    //   .build();

    ClassLoader cl = Thread.currentThread().getContextClassLoader();

    Class<?> exporterClazz = Class.forName("io.opentelemetry.exporter.jaeger.JaegerGrpcSpanExporter", true, cl);
    Method newBuilder = exporterClazz.getMethod("builder");
    Object builderObj = newBuilder.invoke(exporterClazz);

    Class<?> builderClazz = builderObj.getClass();

    Class<?> managedChannelClazz = Class.forName("io.grpc.ManagedChannel", true, cl);
    Method setChannel = builderClazz.getMethod("setChannel", managedChannelClazz);
    builderObj = setChannel.invoke(builderObj, jaegerChannel);

    Method setTimeout = builderClazz.getMethod("setTimeout", long.class, TimeUnit.class);
    builderObj = setTimeout.invoke(builderObj, 3000, TimeUnit.MILLISECONDS);

    Method build = builderClazz.getMethod("build");
    return build.invoke(builderObj);
  }
}
