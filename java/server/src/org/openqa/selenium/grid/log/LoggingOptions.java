package org.openqa.selenium.grid.log;

import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.remote.tracing.DistributedTracer;

import java.util.Arrays;
import java.util.Enumeration;
import java.util.Objects;
import java.util.logging.Handler;
import java.util.logging.LogManager;
import java.util.logging.Logger;

public class LoggingOptions {

  private final Config config;

  public LoggingOptions(Config config) {
    this.config = Objects.requireNonNull(config);
  }

  public boolean isUsingStructuredLogging() {
    return config.getBool("logging", "structured-logs").orElse(false);
  }

  public boolean isUsingPlainLogs() {
    return config.getBool("logging", "plain-logs").orElse(true);
  }

  public DistributedTracer getTracer() {
    return DistributedTracer.builder().detect().build();
  }

  public void configureLogging() {
    if (!config.getBool("logging", "enable").orElse(true)) {
      return;
    }

    // Remove all handlers from existing loggers
    LogManager logManager = LogManager.getLogManager();
    Enumeration<String> names = logManager.getLoggerNames();
    while (names.hasMoreElements()) {
      Logger logger = logManager.getLogger(names.nextElement());
      Arrays.stream(logger.getHandlers()).forEach(logger::removeHandler);
    }

    // Now configure the root logger, since everything should flow up to that
    Logger logger = logManager.getLogger("");

    if (isUsingPlainLogs()) {
      Handler handler = new FlushingHandler(System.out);
      handler.setFormatter(new TerseFormatter());
      logger.addHandler(handler);
    }

    if (isUsingStructuredLogging()) {
      Handler handler = new FlushingHandler(System.out);
      handler.setFormatter(new JsonFormatter());
      logger.addHandler(handler);
    }
  }

}
