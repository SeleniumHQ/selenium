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

package org.openqa.selenium.testing.drivers;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.LocalFileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.internal.ApacheHttpClient;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;

import java.io.IOException;
import java.net.URL;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

public class GridSupplier implements Supplier<WebDriver> {

  private static OutOfProcessSeleniumServer hub;
  private static OutOfProcessSeleniumServer node;
  private static volatile boolean started;

  private final Capabilities desired;

  public GridSupplier(Capabilities desired) {
    this.desired = desired;
  }

  public WebDriver get() {
    if (desired == null || !Boolean.getBoolean("selenium.browser.grid")) {
      return null;
    }

    if (!started) {
      startServers();
    }

    RemoteWebDriver driver = new RemoteWebDriver(hub.getWebDriverUrl(), desired);
    driver.setFileDetector(new LocalFileDetector());
    return driver;
  }

  private synchronized void startServers() {
    if (started) {
      return;
    }

    try {
      hub = new OutOfProcessSeleniumServer().start("-role", "hub");

      URL hubUrl = hub.getWebDriverUrl();
      hubUrl = new URL(hubUrl.getProtocol(), hubUrl.getHost(), hubUrl.getPort(), hubUrl.getFile());

      node = new OutOfProcessSeleniumServer().start(
          "-role", "node",
          "-hub", String.valueOf(hubUrl));
    } catch (IOException e) {
      throw new RuntimeException(e);
    }

    // Keep polling the status page of the hub until it claims to be ready
    HttpClient client = new ApacheHttpClient.Factory().createClient(hub.getWebDriverUrl());
    JsonToBeanConverter toBean = new JsonToBeanConverter();
    Wait<HttpClient> wait = new FluentWait<>(client)
        .ignoring(RuntimeException.class)
        .withTimeout(30, TimeUnit.SECONDS);
    wait.until(c -> {
      HttpRequest req = new HttpRequest(HttpMethod.GET, "/status");
      HttpResponse response = null;
      try {
        response = c.execute(req, true);
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
      Map<?, ?> value = toBean.convert(Map.class, response.getContentString());

      return ((Map<?, ?>) value.get("value")).get("ready") == Boolean.TRUE;
    });

    started = true;
  }

  public static void main(String[] args) {
    System.setProperty("selenium.browser.grid", "true");
    WebDriver driver = new GridSupplier(DesiredCapabilities.firefox()).get();
    driver.get("http://www.google.com");
  }
}
