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

package org.openqa.selenium.devtools.events;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import com.google.common.io.Resources;
import java.io.IOException;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.HasDevTools;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.logging.EventType;

public class CdpEventTypes {

  private static final Json JSON = new Json();

  private CdpEventTypes() {
    // Utility class.
  }

  public static EventType<ConsoleEvent> consoleEvent(Consumer<ConsoleEvent> handler) {
    Require.nonNull("Handler", handler);

    return new EventType<ConsoleEvent>() {
      public void consume(ConsoleEvent event) {
        handler.accept(event);
      }

      @Override
      public void initializeListener(WebDriver webDriver) {
        Require.precondition(
            webDriver instanceof HasDevTools, "Loggable must implement HasDevTools");

        DevTools tools = ((HasDevTools) webDriver).getDevTools();
        tools.createSessionIfThereIsNotOne(webDriver.getWindowHandle());

        tools.getDomains().events().addConsoleListener(handler);
      }
    };
  }

  public static EventType<Void> domMutation(Consumer<DomMutationEvent> handler) {
    Require.nonNull("Handler", handler);

    URL url = CdpEventTypes.class.getResource("/org/openqa/selenium/devtools/mutation-listener.js");
    if (url == null) {
      throw new IllegalStateException("Unable to find helper script");
    }
    String script;
    try {
      script = Resources.toString(url, UTF_8);
    } catch (IOException e) {
      throw new IllegalStateException("Unable to read helper script");
    }

    return new EventType<Void>() {
      @Override
      public void consume(Void event) {
        handler.accept(null);
      }

      @Override
      public void initializeListener(WebDriver driver) {
        Require.precondition(driver instanceof HasDevTools, "Loggable must implement HasDevTools");

        DevTools tools = ((HasDevTools) driver).getDevTools();
        tools.createSessionIfThereIsNotOne(driver.getWindowHandle());

        tools.getDomains().javascript().pin("__webdriver_attribute", script);

        // And add the script to the current page
        ((JavascriptExecutor) driver).executeScript(script);

        tools
            .getDomains()
            .javascript()
            .addBindingCalledListener(
                json -> {
                  Map<String, Object> values = JSON.toType(json, MAP_TYPE);
                  String id = (String) values.get("target");

                  List<WebElement> elements =
                      driver.findElements(
                          By.cssSelector(String.format("*[data-__webdriver_id='%s']", id)));

                  if (!elements.isEmpty()) {
                    DomMutationEvent event =
                        new DomMutationEvent(
                            elements.get(0),
                            String.valueOf(values.get("name")),
                            String.valueOf(values.get("value")),
                            String.valueOf(values.get("oldValue")));
                    handler.accept(event);
                  }
                });
      }
    };
  }
}
