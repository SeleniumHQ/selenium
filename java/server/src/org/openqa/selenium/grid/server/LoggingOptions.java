package org.openqa.selenium.grid.server;

import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.remote.tracing.DistributedTracer;

import io.jaegertracing.Configuration;

import java.util.Objects;

public class LoggingOptions {

  private final Config config;

  public LoggingOptions(Config config) {
    this.config = Objects.requireNonNull(config);
  }

  public DistributedTracer getTracer() {
    Configuration.SamplerConfiguration samplerConfig =
        Configuration.SamplerConfiguration.fromEnv().withType("const").withParam(1);
    Configuration.ReporterConfiguration reporterConfig =
        Configuration.ReporterConfiguration.fromEnv().withLogSpans(true);
    Configuration config = new Configuration("selenium")
        .withSampler(samplerConfig)
        .withReporter(reporterConfig);

    return DistributedTracer.builder().use(config.getTracer()).build();
  }

}
