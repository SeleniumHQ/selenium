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

import java.io.IOException;
import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;
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

public class BiDiCommandExecutor implements CommandExecutor {

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
  private final Map<String, BrowsingContext> browsingContextMap = new HashMap<>();

  public BiDiCommandExecutor(RemoteWebDriver driver) {
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

  @Override
  public Response execute(Command command) throws IOException {
    if (commandHandlerMap.containsKey(command.getName())) {
      return commandHandlerMap.get(command.getName()).apply(command, driver);
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
            Map<String, Object> map = input.read(String.class);
            if (map.size() != 0) {
              printOptions.setPageSize(
                  new PageSize((double) map.get("height"), (double) map.get("width")));
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
            printOptions.setPageRanges(input.read(new TypeToken<String[]>() {}.getType()));
            break;

          case "margin":
            Map<String, Object> marginMap = input.read(Map.class);
            if (marginMap.size() != 0) {
              printOptions.setPageMargin(
                  new PageMargin(
                      (double) marginMap.get("top"),
                      (double) marginMap.get("bottom"),
                      (double) marginMap.get("left"),
                      (double) marginMap.get("right")));
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
