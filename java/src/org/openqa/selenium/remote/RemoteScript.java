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

import static org.openqa.selenium.json.Json.MAP_TYPE;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;
import org.openqa.selenium.Beta;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.bidi.log.ConsoleLogEntry;
import org.openqa.selenium.bidi.log.JavascriptLogEntry;
import org.openqa.selenium.bidi.module.LogInspector;
import org.openqa.selenium.bidi.script.ChannelValue;
import org.openqa.selenium.bidi.script.EvaluateResult;
import org.openqa.selenium.bidi.script.EvaluateResultExceptionValue;
import org.openqa.selenium.bidi.script.EvaluateResultSuccess;
import org.openqa.selenium.bidi.script.LocalValue;
import org.openqa.selenium.bidi.script.RemoteValue;
import org.openqa.selenium.io.Read;
import org.openqa.selenium.json.Json;

@Beta
class RemoteScript implements Script {

  private static final Json JSON = new Json();
  private final BiDi biDi;
  private final LogInspector logInspector;
  private final org.openqa.selenium.bidi.module.Script script;

  private final WebDriver driver;

  public RemoteScript(WebDriver driver) {
    this.driver = driver;
    this.biDi = ((HasBiDi) driver).getBiDi();
    this.logInspector = new LogInspector(driver);
    this.script = new org.openqa.selenium.bidi.module.Script(driver);
  }

  @Override
  public String addConsoleMessageHandler(Consumer<ConsoleLogEntry> consumer) {
    return this.logInspector.onConsoleEntry(consumer);
  }

  @Override
  public void removeConsoleMessageHandler(String id) {
    this.biDi.removeListener(id);
  }

  @Override
  public String addJavaScriptErrorHandler(Consumer<JavascriptLogEntry> consumer) {
    return this.logInspector.onJavaScriptException(consumer);
  }

  @Override
  public void removeJavaScriptErrorHandler(String id) {
    this.biDi.removeListener(id);
  }

  @Override
  public String addDomMutationHandler(Consumer<DomMutation> consumer) {
    String scriptValue =
        readModuleResource("/org/openqa/selenium/remote/bidi-mutation-listener.js");

    this.script.addPreloadScript(scriptValue, List.of(new ChannelValue("channel_name")));

    return this.script.onMessage(message -> {
      String value = message.getData().getValue().get().toString();

      Map<String, Object> values = JSON.toType(value, MAP_TYPE);
      String id = (String) values.get("target");

      List<WebElement> elements;

      synchronized (this) {
        elements =
            this.driver.findElements(
                By.cssSelector(String.format("*[data-__webdriver_id='%s']", id)));
      }

      if (!elements.isEmpty()) {
        DomMutation event =
            new DomMutation(
                elements.get(0),
                String.valueOf(values.get("name")),
                String.valueOf(values.get("value")),
                String.valueOf(values.get("oldValue")));
        consumer.accept(event);
      }
    });
  }

  @Override
  public void removeDomMutationHandler(String id) {
    this.biDi.removeListener(id);
  }

  @Override
  public String pin(String script) {
    return this.script.addPreloadScript(script);
  }

  @Override
  public void unpin(String id) {
    this.script.removePreloadScript(id);
  }

  @Override
  public RemoteValue execute(String script, Object... args) {
    String browsingContextId = this.driver.getWindowHandle();

    List<LocalValue> arguments = new ArrayList<>();

    Arrays.stream(args).forEach(arg -> arguments.add(LocalValue.getArgument(arg)));

    EvaluateResult result =
        this.script.callFunctionInBrowsingContext(
            browsingContextId,
            script,
            true,
            Optional.of(arguments),
            Optional.empty(),
            Optional.empty());

    if (result.getResultType().equals(EvaluateResult.Type.SUCCESS)) {
      return ((EvaluateResultSuccess) result).getResult();
    } else {
      throw new WebDriverException(
          "Error while executing script: "
              + ((EvaluateResultExceptionValue) result).getExceptionDetails().getText());
    }
  }

  /**
   * Reads a resource packaged in this module. The lookup has to happen in this module rather than
   * in {@link Read}: {@link Class#getResourceAsStream(String)} is caller-sensitive, and on the
   * module path the resource's package is not opened to the {@code api} module.
   */
  private static String readModuleResource(String resource) {
    try (InputStream stream = RemoteScript.class.getResourceAsStream(resource)) {
      if (stream == null) {
        throw new IllegalArgumentException("Resource not found: " + resource);
      }
      return Read.toString(stream);
    } catch (IOException e) {
      throw new UncheckedIOException("Failed to read resource " + resource, e);
    }
  }
}
