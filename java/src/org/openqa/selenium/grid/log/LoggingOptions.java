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

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.io.UnsupportedEncodingException;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.Locale;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogManager;
import java.util.logging.Logger;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.remote.tracing.empty.NullTracer;
import org.openqa.selenium.remote.tracing.opentelemetry.OpenTelemetryTracer;

public class LoggingOptions {

  static final String LOGGING_SECTION = "logging";
  static final boolean DEFAULT_CONFIGURE_LOGGING = true;
  static final String DEFAULT_LOG_LEVEL = Level.INFO.getName();
  static final boolean DEFAULT_PLAIN_LOGS = true;
  static final boolean DEFAULT_STRUCTURED_LOGS = false;
  static final boolean DEFAULT_TRACING_ENABLED = true;
  public static final boolean DEFAULT_HTTP_LOGS = false;
  private static final Logger LOG = Logger.getLogger(LoggingOptions.class.getName());
  private final Config config;
  private Level level = Level.INFO;
  public static final String DEFAULT_LOG_TIMESTAMP_FORMAT = "HH:mm:ss.SSS";

  public LoggingOptions(Config config) {
    this.config = Require.nonNull("Config", config);
  }

  public boolean isUsingStructuredLogging() {
    return config.getBool(LOGGING_SECTION, "structured-logs").orElse(DEFAULT_STRUCTURED_LOGS);
  }

  public boolean shouldLogHttpLogs() {
    return config.getBool(LOGGING_SECTION, "http-logs").orElse(DEFAULT_HTTP_LOGS);
  }

  public boolean isUsingPlainLogs() {
    return config.getBool(LOGGING_SECTION, "plain-logs").orElse(DEFAULT_PLAIN_LOGS);
  }

  public String getLogEncoding() {
    return config.get(LOGGING_SECTION, "log-encoding").orElse(null);
  }

  public void setLoggingLevel() {
    String configLevel = config.get(LOGGING_SECTION, "log-level").orElse(DEFAULT_LOG_LEVEL);

    try {
      level = Level.parse(configLevel.toUpperCase(Locale.ROOT));
    } catch (IllegalArgumentException e) {
      throw new ConfigException("Unable to determine log level from " + configLevel);
    }
  }

  public Tracer getTracer() {
    boolean tracingEnabled =
        config.getBool(LOGGING_SECTION, "tracing").orElse(DEFAULT_TRACING_ENABLED);
    if (!tracingEnabled) {
      LOG.info("Using null tracer");
      return new NullTracer();
    }

    OpenTelemetryTracer.setHttpLogs(shouldLogHttpLogs());

    return OpenTelemetryTracer.getInstance();
  }

  public void configureLogging() {
    if (!config.getBool(LOGGING_SECTION, "enable").orElse(DEFAULT_CONFIGURE_LOGGING)) {
      return;
    }

    // Remove all handlers from existing loggers
    LogManager logManager = LogManager.getLogManager();
    Enumeration<String> names = logManager.getLoggerNames();
    while (names.hasMoreElements()) {
      Logger logger = logManager.getLogger(names.nextElement());
      if (logger == null) {
        continue;
      }

      Arrays.stream(logger.getHandlers()).forEach(logger::removeHandler);
    }

    // Now configure the root logger, since everything should flow up to that
    Logger logger = logManager.getLogger("");
    setLoggingLevel();
    logger.setLevel(level);
    OutputStream out = getOutputStream();
    String encoding = getLogEncoding();

    if (isUsingPlainLogs()) {
      Handler handler = new FlushingHandler(out);
      handler.setFormatter(new TerseFormatter(getLogTimestampFormat()));
      handler.setLevel(level);
      configureLogEncoding(logger, encoding, handler);
    }

    if (isUsingStructuredLogging()) {
      Handler handler = new FlushingHandler(out);
      handler.setFormatter(new JsonFormatter());
      handler.setLevel(level);
      configureLogEncoding(logger, encoding, handler);
    }
  }

  private void configureLogEncoding(Logger logger, String encoding, Handler handler) {
    String message;
    try {
      if (encoding != null) {
        handler.setEncoding(encoding);
        message = String.format("Using encoding %s", encoding);
      } else {
        message = "Using the system default encoding";
      }
    } catch (UnsupportedEncodingException e) {
      message =
          String.format("Using the system default encoding. Unsupported encoding %s", encoding);
    }
    logger.addHandler(handler);
    logger.log(Level.INFO, message);
  }

  private OutputStream getOutputStream() {
    return config
        .get(LOGGING_SECTION, "log-file")
        .map(
            fileName -> {
              try {
                return (OutputStream) new FileOutputStream(fileName);
              } catch (FileNotFoundException e) {
                throw new UncheckedIOException(e);
              }
            })
        .orElse(System.out);
  }

  public String getLogTimestampFormat() {
    return config.get(LOGGING_SECTION, "log-timestamp-format").orElse(DEFAULT_LOG_TIMESTAMP_FORMAT);
  }
}
