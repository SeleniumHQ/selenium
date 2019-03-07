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

package org.openqa.grid.internal.utils.configuration.json;

import org.openqa.grid.common.GridConfiguredJson;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Stream;

public abstract class CommonJsonConfiguration {

  static <T extends CommonJsonConfiguration> T fromResourceOrFile(
      String resourceOrFilePath, Class<T> configurationClass)
  {
    return fromJson(loadJsonFromResourceOrFile(resourceOrFilePath), configurationClass);
  }

  static <T extends CommonJsonConfiguration> T fromJson(
      JsonInput jsonInput, Class<T> configurationClass)
  {
    try {
      return GridConfiguredJson.toType(jsonInput, configurationClass);
    } catch (GridConfigurationException e) {
      throw e;
    } catch (Throwable e) {
      throw new GridConfigurationException(e.getMessage(), e);
    }
  }

  private static JsonInput loadJsonFromResourceOrFile(String source) {
    try {
      return new Json().newInput(readFileOrResource(source));
    } catch (RuntimeException e) {
      throw new GridConfigurationException("Unable to load configuration from " + source, e);
    }
  }

  private static Reader readFileOrResource(String source) {
    Stream<Function<String, InputStream>> suppliers = Stream.of(
        (path) -> {
          try {
            return new FileInputStream(path);
          } catch (FileNotFoundException e) {
            return null;
          } },
        (path) -> Thread.currentThread().getContextClassLoader()
            .getResourceAsStream("org/openqa/grid/common/" + path),
        (path) -> Thread.currentThread().getContextClassLoader().getResourceAsStream(path),
        (path) -> new ByteArrayInputStream(path.getBytes())
    );

    InputStream in = suppliers
        .map(supplier -> supplier.apply(source))
        .filter(Objects::nonNull)
        .findFirst()
        .orElseThrow(() -> new RuntimeException("Resource or file not found: " + source));

    return new BufferedReader(new InputStreamReader(in));
  }

  private String role;

  private Boolean debug = false;
  private String log;
  private String host;
  private Integer port;
  private Integer timeout;
  private Integer browserTimeout;
  private Integer jettyMaxThreads;
  
  public CommonJsonConfiguration() {}
  
  public CommonJsonConfiguration(CommonJsonConfiguration commonJsonConfig) {
	  role = commonJsonConfig.role;
	  debug = commonJsonConfig.debug;
	  log = commonJsonConfig.log;
	  host = commonJsonConfig.host;
	  port = commonJsonConfig.port;
	  timeout = commonJsonConfig.timeout;
	  browserTimeout = commonJsonConfig.browserTimeout;
	  jettyMaxThreads = commonJsonConfig.jettyMaxThreads;
  }

  protected String getRole() {
    return role;
  }

  /**
   * Enable {@code LogLevel.FINE} log messages. Default {@code false}.
   */
  public Boolean getDebug() {
    return debug;
  }

  /**
   *   Filename to use for logging. Defaults to {@code null}.
   */
  public String getLog() {
    return log;
  }

  /**
   * Hostname or IP to use. Defaults to {@code null}. Automatically determined when {@code null}.
   */
  public String getHost() {
    return host;
  }

  /**
   * Port to bind to. Default determined by configuration type.
   */
  public Integer getPort() {
    return port;
  }

  /**
   * Client timeout. Default 1800 sec.
   */
  public Integer getTimeout() {
    return timeout;
  }

  /**
   * Browser timeout. Default 0 (indefinite wait).
   */
  public Integer getBrowserTimeout() {
    return browserTimeout;
  }

  /**
   *   Max threads for Jetty. Defaults to {@code null}.
   */
  public Integer getJettyMaxThreads() {
    return jettyMaxThreads;
  }
}
