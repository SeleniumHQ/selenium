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

package org.openqa.selenium.remote.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import com.google.auto.service.AutoService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class HttpClientFactoryTest {

  private String oldProperty;

  @BeforeEach
  public void storeSystemProperty() {
    oldProperty = System.getProperty("webdriver.http.factory");
  }

  @AfterEach
  public void restoreSystemProperty() {
    if (oldProperty != null) {
      System.setProperty("webdriver.http.factory", oldProperty);
    } else {
      System.clearProperty("webdriver.http.factory");
    }
  }

  @Test
  void canCreateDefaultHttpClientFactory() {
    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    assertThat(factory.getClass().getAnnotation(HttpClientName.class).value()).isEqualTo("netty");
  }

  @Test
  void canCreateHttpClientFactoryByName() {
    HttpClient.Factory factory = HttpClient.Factory.create("netty");
    assertThat(factory.getClass().getAnnotation(HttpClientName.class).value()).isEqualTo("netty");
  }

  @Test
  void canCreateCustomClientFactoryByName() {
    HttpClient.Factory factory = HttpClient.Factory.create("cheesy");
    assertThat(factory.getClass().getAnnotation(HttpClientName.class).value()).isEqualTo("cheesy");
  }

  @AutoService(HttpClient.Factory.class)
  @HttpClientName("cheesy")
  @SuppressWarnings("unused")
  public static class CheesyFactory implements HttpClient.Factory {
    @Override
    public HttpClient createClient(ClientConfig config) {
      return null;
    }
  }

  @Test
  void shouldRespectSystemProperties() {
    System.setProperty("webdriver.http.factory", "cheesy");
    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    assertThat(factory.getClass().getAnnotation(HttpClientName.class).value()).isEqualTo("cheesy");
  }

  @Test
  void shouldNotCreateHttpClientFactoryByInvalidName() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> HttpClient.Factory.create("orange"));
  }

  @Test
  void canDetectHttpClientFactoriesWithSameName() {
    assertThatExceptionOfType(IllegalStateException.class)
        .isThrownBy(() -> HttpClient.Factory.create("duplicated"));
  }

  @AutoService(HttpClient.Factory.class)
  @HttpClientName("duplicated")
  @SuppressWarnings("unused")
  public static class Factory1 implements HttpClient.Factory {
    @Override
    public HttpClient createClient(ClientConfig config) {
      return null;
    }
  }

  @AutoService(HttpClient.Factory.class)
  @HttpClientName("duplicated")
  @SuppressWarnings("unused")
  public static class Factory2 implements HttpClient.Factory {
    @Override
    public HttpClient createClient(ClientConfig config) {
      return null;
    }
  }
}
