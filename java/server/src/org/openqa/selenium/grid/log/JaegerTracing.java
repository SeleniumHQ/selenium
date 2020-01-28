package org.openqa.selenium.grid.log;

import io.opentelemetry.sdk.trace.export.SpanExporter;

import java.lang.reflect.Method;

/**
 * We use an awful lof of reflection here because it's the only way we can
 * get this to work without requiring the selenium server take a dependency
 * on Jaeger, which may not be needed in all cases.
 */
class JaegerTracing {

  static SpanExporter findJaegerExporter() {
    String host = System.getProperty("JAEGER_AGENT_HOST");
    if (host == null) {
      return null;
    }

    String rawPort = System.getProperty("JAEGER_AGENT_PORT");
    int port = -1;
    try {
      port = Integer.parseInt(rawPort);
    } catch (NumberFormatException ignored) {
      return null;
    }
    if (port == -1) {
      return null;
    }

    try {
      Object jaegerChannel = createManagedChannel(host, port);
      SpanExporter toReturn = (SpanExporter) createJaegerGrpcSpanExporter(jaegerChannel);

      if (toReturn != null) {
        System.out.printf("Attaching Jaeger tracing to %s:%s\n", host, port);
      }

      return toReturn;
    } catch (ReflectiveOperationException e) {
      return null;
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
    //   .setDeadline(30000)
    //   .build();

    ClassLoader cl = Thread.currentThread().getContextClassLoader();

    Class<?> exporterClazz = Class.forName("io.opentelemetry.exporters.jaeger.JaegerGrpcSpanExporter", true, cl);
    Method newBuilder = exporterClazz.getMethod("newBuilder");
    Object builderObj = newBuilder.invoke(exporterClazz);

    Class<?> builderClazz = builderObj.getClass();

    Method setServiceName = builderClazz.getMethod("setServiceName", String.class);
    builderObj = setServiceName.invoke(builderObj, System.getProperty("JAEGER_SERVICE_NAME", "selenium"));

    Class<?> managedChannelClazz = Class.forName("io.grpc.ManagedChannel", true, cl);
    Method setChannel = builderClazz.getMethod("setChannel", managedChannelClazz);
    builderObj = setChannel.invoke(builderObj, jaegerChannel);

    Method setDeadline = builderClazz.getMethod("setDeadline", long.class);
    builderObj = setDeadline.invoke(builderObj, 30000);

    Method build = builderClazz.getMethod("build");
    return build.invoke(builderObj);
  }
}
