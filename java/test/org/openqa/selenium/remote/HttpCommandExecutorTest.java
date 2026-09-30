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

package org.openqa.selenium.remote;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;

/**
 * Subclasses outside Selenium (e.g. Appium's AppiumCommandExecutor) compile against these fields,
 * so their visibility is part of the binary API until they go through the deprecation policy.
 */
@Tag("UnitTests")
class HttpCommandExecutorTest {

  @Test
  void clientFieldStaysPublic() throws NoSuchFieldException {
    Field client = HttpCommandExecutor.class.getDeclaredField("client");

    assertThat(Modifier.isPublic(client.getModifiers())).isTrue();
  }

  @Test
  void httpClientFactoryFieldStaysProtected() throws NoSuchFieldException {
    Field factory = HttpCommandExecutor.class.getDeclaredField("httpClientFactory");

    assertThat(Modifier.isProtected(factory.getModifiers())).isTrue();
  }

  @Test
  @SuppressWarnings("removal")
  void keepsTheFactoryPassedToTheConstructor() throws MalformedURLException {
    HttpClient.Factory factory = HttpClient.Factory.createDefault();
    ClientConfig config = ClientConfig.defaultConfig().baseUrl(new URL("http://localhost:4444"));

    HttpCommandExecutor executor = new HttpCommandExecutor(Map.of(), config, factory);

    assertThat(executor.httpClientFactory).isSameAs(factory);
  }

  @Test
  @SuppressWarnings("removal")
  void hasNoFactoryWhenCreatedFromAClient() throws MalformedURLException {
    URL url = new URL("http://localhost:4444");
    HttpClient client = HttpClient.Factory.createDefault().createClient(url);

    HttpCommandExecutor executor = new HttpCommandExecutor(client, url);

    assertThat(executor.client).isSameAs(client);
    assertThat(executor.httpClientFactory).isNull();
  }
}
