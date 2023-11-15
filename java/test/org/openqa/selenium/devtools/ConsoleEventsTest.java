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

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.devtools.events.ConsoleEvent;
import org.openqa.selenium.devtools.idealized.runtime.model.RemoteObject;
import org.openqa.selenium.environment.webserver.Page;
import org.openqa.selenium.testing.Ignore;

class ConsoleEventsTest extends DevToolsTestBase {

  @Test
  @Ignore(value = FIREFOX, reason = "https://bugzilla.mozilla.org/show_bug.cgi?id=1819965")
  public void canWatchConsoleEvents()
      throws InterruptedException, ExecutionException, TimeoutException {
    String page =
        appServer.create(
            new Page()
                .withBody("<div id='button' onclick='helloWorld()'>click me</div>")
                .withScripts("function helloWorld() { console.log('Hello, world!') }"));
    driver.get(page);

    CompletableFuture<ConsoleEvent> future = new CompletableFuture<>();
    devTools.getDomains().events().addConsoleListener(future::complete);
    driver.findElement(By.id("button")).click();
    ConsoleEvent event = future.get(5, TimeUnit.SECONDS);

    assertThat(event.getType()).isEqualTo("log");
    assertThat(event.getMessages()).containsExactly("Hello, world!");
  }

  @Test
  @Ignore(value = FIREFOX, reason = "https://bugzilla.mozilla.org/show_bug.cgi?id=1819965")
  public void canWatchConsoleEventsWithArgs()
      throws InterruptedException, ExecutionException, TimeoutException {
    String page =
        appServer.create(
            new Page()
                .withBody("<div id='button' onclick='helloWorld()'>click me</div>")
                .withScripts("function helloWorld() { console.log(\"array\", [1, 2, 3]) }"));
    driver.get(page);

    CompletableFuture<ConsoleEvent> future = new CompletableFuture<>();
    devTools.getDomains().events().addConsoleListener(future::complete);
    driver.findElement(By.id("button")).click();
    ConsoleEvent event = future.get(5, TimeUnit.SECONDS);

    assertThat(event.getType()).isEqualTo("log");
    List<Object> args = event.getArgs();
    // Ensure args returned by CDP protocol are maintained
    assertThat(args).isNotInstanceOf((RemoteObject.class));
  }
}
