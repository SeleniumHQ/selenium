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

package org.openqa.selenium.grid.node.relay;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.grid.server.NetworkOptions;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.StringReader;
import java.time.Duration;
import java.util.Collection;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

@SuppressWarnings("DuplicatedCode")
public class RelayOptionsTest {

  @Test
  public void basicConfigurationIsParsedSuccessfully() {
    String[] rawConfig = new String[]{
      "[relay]",
      "url = 'http://localhost:9999'",
      "configs = [\"2\", '{\"browserName\": \"chrome\"}']",
      };
    Config config = new TomlConfig(new StringReader(String.join("\n", rawConfig)));
    NetworkOptions networkOptions = new NetworkOptions(config);
    Tracer tracer = DefaultTestTracer.createTracer();
    HttpClient.Factory httpClientFactory = networkOptions.getHttpClientFactory(tracer);
    RelayOptions relayOptions = new RelayOptions(config);
    Map<Capabilities, Collection<SessionFactory>>
      sessionFactories = relayOptions.getSessionFactories(
      tracer,
      httpClientFactory,
      Duration.ofSeconds(300));

    Capabilities chrome = sessionFactories
      .keySet()
      .stream()
      .filter(capabilities -> "chrome".equals(capabilities.getBrowserName()))
      .findFirst()
      .orElseThrow(() -> new AssertionError("No value returned"));

    assertThat(sessionFactories.get(chrome).size()).isEqualTo(2);
    assertThat(relayOptions.getServiceUri().toString()).isEqualTo("http://localhost:9999");
  }

  @Test
  public void hostAndPortAreParsedSuccessfully() {
    String[] rawConfig = new String[]{
      "[relay]",
      "host = '127.0.0.1'",
      "port = '9999'",
      "configs = [\"5\", '{\"browserName\": \"firefox\"}']",
      };
    Config config = new TomlConfig(new StringReader(String.join("\n", rawConfig)));
    RelayOptions relayOptions = new RelayOptions(config);
    assertThat(relayOptions.getServiceUri().toString()).isEqualTo("http://127.0.0.1:9999");
  }

  @Test
  public void statusUrlIsParsedSuccessfully() {
    String[] rawConfig = new String[]{
      "[relay]",
      "host = '127.0.0.1'",
      "port = '8888'",
      "status-endpoint = '/statusEndpoint'",
      "configs = [\"5\", '{\"browserName\": \"firefox\"}']",
      };
    Config config = new TomlConfig(new StringReader(String.join("\n", rawConfig)));
    RelayOptions relayOptions = new RelayOptions(config);
    assertThat(relayOptions.getServiceUri().toString()).isEqualTo("http://127.0.0.1:8888");
    assertThat(relayOptions.getServiceStatusUri().toString())
      .isEqualTo("http://127.0.0.1:8888/statusEndpoint");
  }

  @Test
  public void missingConfigsThrowsConfigException() {
    String[] rawConfig = new String[]{
      "[relay]",
      "host = '127.0.0.1'",
      "port = '9999'",
      };
    Config config = new TomlConfig(new StringReader(String.join("\n", rawConfig)));
    NetworkOptions networkOptions = new NetworkOptions(config);
    Tracer tracer = DefaultTestTracer.createTracer();
    HttpClient.Factory httpClientFactory = networkOptions.getHttpClientFactory(tracer);
    assertThatExceptionOfType(ConfigException.class)
      .isThrownBy(() -> new RelayOptions(config)
        .getSessionFactories(tracer, httpClientFactory, Duration.ofSeconds(300)));
  }

  @Test
  public void incompleteConfigsThrowsConfigException() {
    String[] rawConfig = new String[]{
      "[relay]",
      "host = '127.0.0.1'",
      "port = '9999'",
      "configs = ['{\"browserName\": \"firefox\"}']",
      };
    Config config = new TomlConfig(new StringReader(String.join("\n", rawConfig)));
    NetworkOptions networkOptions = new NetworkOptions(config);
    Tracer tracer = DefaultTestTracer.createTracer();
    HttpClient.Factory httpClientFactory = networkOptions.getHttpClientFactory(tracer);
    assertThatExceptionOfType(ConfigException.class)
      .isThrownBy(() -> new RelayOptions(config)
        .getSessionFactories(tracer, httpClientFactory, Duration.ofSeconds(300)));
  }

}
