package org.openqa.selenium.grid.server;

import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.remote.tracing.DistributedTracer;

import java.util.Objects;

public class LoggingOptions {

  private final Config config;

  public LoggingOptions(Config config) {
    this.config = Objects.requireNonNull(config);
  }

  public DistributedTracer getTracer() {
    return DistributedTracer.builder().detect().build();
  }

}
