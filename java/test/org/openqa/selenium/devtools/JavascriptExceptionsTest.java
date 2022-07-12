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

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptException;
import org.openqa.selenium.environment.webserver.Page;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.drivers.Browser;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.assertThat;

public class JavascriptExceptionsTest extends DevToolsTestBase {

  @Test
  @NotYetImplemented(value = Browser.FIREFOX, reason = "`Log` domain not yet supported")
  public void canWatchJavascriptExceptions() throws InterruptedException, ExecutionException, TimeoutException {
    String page = appServer.create(
      new Page()
        .withBody("<div id='button' onclick='helloWorld()'>click me</div>")
        .withScripts("function helloWorld() { throw new Error('Hello, world!') }"));
    driver.get(page);

    CompletableFuture<JavascriptException> future = new CompletableFuture<>();
    devTools.getDomains().events().addJavascriptExceptionListener(future::complete);
    driver.findElement(By.id("button")).click();
    JavascriptException exception = future.get(5, TimeUnit.SECONDS);

    assertThat(exception.getRawMessage()).startsWith("Error: Hello, world!\n");
  }

}
