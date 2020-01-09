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

package org.openqa.selenium.grid.log;

import io.opentracing.Tracer;
import io.opentracing.contrib.tracerresolver.TracerResolver;
import io.opentracing.noop.NoopTracerFactory;
import org.openqa.selenium.grid.config.Config;

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

  public Tracer getTracer() {
    Tracer tracer = TracerResolver.resolveTracer();
    return tracer == null ? NoopTracerFactory.create() : tracer;
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
