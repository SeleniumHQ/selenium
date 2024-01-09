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

import static org.openqa.selenium.remote.DriverCommand.GET;
import static org.openqa.selenium.remote.DriverCommand.PRINT_PAGE;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.BiFunction;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.bidi.Network;
import org.openqa.selenium.bidi.Script;
import org.openqa.selenium.bidi.browsingcontext.BrowsingContext;
import org.openqa.selenium.bidi.browsingcontext.ReadinessState;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;
import org.openqa.selenium.print.PageMargin;
import org.openqa.selenium.print.PageSize;
import org.openqa.selenium.print.PrintOptions;

public class BiDiCommandMapper {

  private static Json JSON = new Json();

  private final RemoteWebDriver driver;

  private final AtomicReference<BrowsingContext> currentContext = new AtomicReference<>();
  private final AtomicReference<Script> script = new AtomicReference<>();
  private final AtomicReference<Network> network = new AtomicReference<>();

  private final Map<String, BiFunction<Command, RemoteWebDriver, Response>> commandHandlerMap =
      new HashMap<>();

  // Each browsing context has an associated id, maintains state
  // We will need to maintain a map of all the browsingContext to run further commands
  // Switching between tabs etc might be tricky
  private final Map<String, BrowsingContext> browsingContextMap = new ConcurrentHashMap<>();

  public BiDiCommandMapper(RemoteWebDriver driver) {
    this.driver = driver;
    init(this.driver);
  }

  private void init(RemoteWebDriver driver) {
    script.set(new Script(driver));
    network.set(new Network(driver));

    BrowsingContext parentContext = new BrowsingContext(driver, driver.getWindowHandle());
    browsingContextMap.put(parentContext.getId(), parentContext);
    currentContext.set(parentContext);

    commandHandlerMap.put(
        GET,
        (command, webDriver) -> {
          String pageLoadStrategy =
              (String) webDriver.getCapabilities().getCapability("pageLoadStrategy");
          currentContext
              .get()
              .navigate(
                  (String) command.getParameters().get("url"),
                  ReadinessState.getReadinessState(pageLoadStrategy));
          return new Response(webDriver.getSessionId());
        });

    commandHandlerMap.put(
        PRINT_PAGE,
        (command, webDriver) -> {
          String result = currentContext.get().print(serializePrintOptions(command));
          Response response = new Response(webDriver.getSessionId());
          response.setValue(result);
          return response;
        });
  }

  public BiFunction<Command, RemoteWebDriver, Response> map(Command command) {
    // This is not optimal
    // But each time Classic calls switchTo, we need to identify the current browsing context to run
    // commands
    // Maybe we need a way where every time switchTo commands are called, only then we update the
    // current browsing context
    String currentWindowHandle = driver.getWindowHandle();
    BrowsingContext browsingContext =
        browsingContextMap.computeIfAbsent(
            currentWindowHandle, windowHandle -> new BrowsingContext(driver, windowHandle));

    browsingContextMap.putIfAbsent(currentWindowHandle, browsingContext);
    currentContext.set(browsingContext);

    if (commandHandlerMap.containsKey(command.getName())) {
      return commandHandlerMap.get(command.getName());
    } else {
      throw new UnsupportedCommandException();
    }
  }

  private PrintOptions serializePrintOptions(Command command) {
    try (StringReader reader = new StringReader(JSON.toJson(command.getParameters()));
        JsonInput input = JSON.newInput(reader)) {
      PrintOptions printOptions = new PrintOptions();

      input.beginObject();
      while (input.hasNext()) {
        switch (input.nextName()) {
          case "page":
            Map<String, Double> map = input.read(new TypeToken<Map<String, Double>>() {}.getType());
            if (map.size() != 0) {
              printOptions.setPageSize(new PageSize(map.get("height"), map.get("width")));
            }
            break;

          case "orientation":
            String orientation = input.read(String.class);
            if (orientation.equals("portrait")) {
              printOptions.setOrientation(PrintOptions.Orientation.PORTRAIT);
            } else {
              printOptions.setOrientation(PrintOptions.Orientation.LANDSCAPE);
            }
            break;

          case "scale":
            printOptions.setScale(input.read(Double.class));
            break;

          case "shrinkToFit":
            printOptions.setShrinkToFit(input.read(Boolean.class));
            break;

          case "background":
            printOptions.setBackground(input.read(Boolean.class));
            break;

          case "pageRanges":
            List<String> pageRanges = input.read(new TypeToken<ArrayList<String>>() {}.getType());
            printOptions.setPageRanges(pageRanges);
            break;

          case "margin":
            Map<String, Double> marginMap =
                input.read(new TypeToken<Map<String, Double>>() {}.getType());
            if (marginMap.size() != 0) {
              printOptions.setPageMargin(
                  new PageMargin(
                      marginMap.get("top"),
                      marginMap.get("bottom"),
                      marginMap.get("left"),
                      marginMap.get("right")));
            }
            break;

          default:
            input.skipValue();
            break;
        }
      }

      input.endObject();
      return printOptions;
    }
  }
}
