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

package org.openqa.selenium.devtools;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assumptions.assumeThat;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.testing.Safely.safelyCall;

import com.google.common.net.MediaType;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.HasAuthentication;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.grid.security.BasicAuthenticationFilter;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.drivers.Browser;

class CdpFacadeTest extends DevToolsTestBase {

  private static NettyAppServer server;

  @BeforeAll
  public static void startServer() {
    server =
        new NettyAppServer(
            new BasicAuthenticationFilter("test", "test")
                .andFinally(
                    req ->
                        new HttpResponse()
                            .addHeader("Content-Type", MediaType.HTML_UTF_8.toString())
                            .setContent(Contents.string("<h1>authorized</h1>", UTF_8))));
    server.start();
  }

  @AfterAll
  public static void stopServer() {
    safelyCall(() -> server.stop());
  }

  @Test
  @NotYetImplemented(value = Browser.FIREFOX, reason = "Network interception not yet supported")
  public void networkInterceptorAndAuthHandlersDoNotFight() {
    assumeThat(driver).isInstanceOf(HasAuthentication.class);

    // First of all register the auth details
    ((HasAuthentication) driver).register(UsernameAndPassword.of("test", "test"));

    // Verify things look okay
    driver.get(server.whereIs("/"));
    String message = driver.findElement(By.tagName("h1")).getText();

    assertThat(message).contains("authorized");

    // Now replace the content of the page using network interception
    try (NetworkInterceptor interceptor =
        new NetworkInterceptor(
            driver,
            Route.matching(req -> true)
                .to(() -> req -> new HttpResponse().setContent(utf8String("I like cheese"))))) {

      driver.get(server.whereIs("/"));
      message = driver.findElement(By.tagName("body")).getText();

      assertThat(message).isEqualTo("I like cheese");
    }

    // And now verify that we've cleaned up the state
    driver.get(server.whereIs("/"));
    message = driver.findElement(By.tagName("h1")).getText();

    assertThat(message).contains("authorized");
  }

  @Test
  @NotYetImplemented(value = Browser.FIREFOX, reason = "Network interception not yet supported")
  public void canAuthenticate() {
    assumeThat(driver).isInstanceOf(HasAuthentication.class);

    ((HasAuthentication) driver).register(UsernameAndPassword.of("test", "test"));

    driver.get(server.whereIs("/"));
    String message = driver.findElement(By.tagName("h1")).getText();

    assertThat(message).contains("authorized");
  }
}
