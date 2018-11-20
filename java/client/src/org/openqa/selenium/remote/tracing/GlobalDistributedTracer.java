package org.openqa.selenium.remote.tracing;

import java.util.concurrent.atomic.AtomicReference;

public class GlobalDistributedTracer {

  private static AtomicReference<DistributedTracer> TRACER = new AtomicReference<>();

  public static void setInstance(DistributedTracer tracer) {
    TRACER.set(tracer);
  }

  public static DistributedTracer getInstance() {
    DistributedTracer tracer = TRACER.get();
    if (tracer == null) {
      throw new IllegalStateException("Tracer has not been set.");
    }
    return tracer;
  }
}
