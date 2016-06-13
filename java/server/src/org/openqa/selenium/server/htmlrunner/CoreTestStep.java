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

package org.openqa.selenium.server.htmlrunner;

import com.google.common.collect.ImmutableMap;

import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;

import org.openqa.selenium.WebDriver;

import java.lang.reflect.Method;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.logging.Logger;

public class CoreTestStep {

  private static Logger LOG = Logger.getLogger("Selenium Core test step");

  private static ImmutableMap<String, SeleneseCommand> COMMANDS = buildCommands();
  private final SeleneseCommand seleneseCommand;
  private final String command;
  private final String locator;
  private final String value;

  public CoreTestStep(String command, String locator, String value) {
    seleneseCommand = COMMANDS.get(command);
    this.command = command;
    this.locator = locator;
    this.value = value;

    if (seleneseCommand == null) {
      throw new SeleniumException("Unknown command: " + command);
    }
  }

  public void run(Results results, WebDriver driver, Selenium selenium) {
    LOG.info(String.format("%s | %s \t|%s\t|", command, locator, value));
    seleneseCommand.execute(driver, selenium, locator, value);
  }

  private static ImmutableMap<String, SeleneseCommand> buildCommands() {
    ImmutableMap.Builder<String, SeleneseCommand> commands = ImmutableMap.builder();
    Set<String> seenNames = new HashSet<>();

    // seed the seen names with methods we definitely don't want folks accessing
    seenNames.add("addCustomRequestHeader");
    seenNames.add("allowNativeXpath");
    seenNames.add("pause");
    seenNames.add("rollup");
    seenNames.add("setBrowserLogLevel");
    seenNames.add("setExtensionJs");
    seenNames.add("start");
    seenNames.add("stop");

    for (final Method method : Selenium.class.getMethods()) {
      if (!seenNames.add(method.getName())) {
        continue;
      }

      if (method.getParameterCount() > 3) {
        continue;
      }

      SeleneseCommand underlyingCommand = (driver, selenium, locator, value) -> {
        try {
          switch (method.getParameterCount()) {
            case 0:
              return method.invoke(selenium);

            case 1:
              return method.invoke(selenium, locator);

            case 2:
              return method.invoke(selenium, locator, value);

            default:
              throw new RuntimeException("Exceptionally unlikely to get here");
          }
        } catch (ReflectiveOperationException e) {
          for (Throwable cause = e; cause != null; cause = cause.getCause()) {
            if (cause instanceof SeleniumException) {
              throw (SeleniumException) cause;
            }
          }
          throw new SeleniumException(
            String.format("Unable to emulate %s ('%s', '%s')", method.getName(), locator, value),
            e);
        }
      };
      commands.put(method.getName(), underlyingCommand);

      // Methods of the form getFoo(target) result in commands:
      // getFoo, assertFoo, verifyFoo, assertNotFoo, verifyNotFoo
      // storeFoo, waitForFoo, and waitForNotFoo.
      final String shortName;
      if (method.getName().startsWith("get")) {
        shortName = method.getName().substring("get".length());
      } else if (method.getName().startsWith("is")) {
        shortName = method.getName().substring("is".length());
      } else {
        shortName = null;
      }

      if (shortName != null) {
        SeleneseCommand performComparison = (driver, selenium, locator, value) -> {
          Object result = underlyingCommand.execute(driver, selenium, locator, value);
          if ("is".equals(shortName)) {
            return (Boolean) result;
          }

          String comparisonValue;
          switch (method.getParameterCount()) {
            case 0:
              comparisonValue = locator;
              break;

            case 1:
              comparisonValue = value;
              break;

            default:
              throw new RuntimeException("Unsure how to process this assert: " + method.getName());
          }
          return Objects.equals(comparisonValue, String.valueOf(result));
        };

        commands.put("assert" + shortName, (driver, selenium, locator, value) -> {
          boolean result = (Boolean) performComparison.execute(driver, selenium, locator, value);
          if (!result) {
            throw new SeleniumException("Assertion failed");
          }
          return null;
        });

        commands.put("assertNot" + shortName, (driver, selenium, locator, value) -> {
          boolean result = (Boolean) performComparison.execute(driver, selenium, locator, value);
          if (result) {
            throw new SeleniumException("Negative assertion failed");
          }
          return null;
        });

        commands.put("verify" + shortName, (driver, selenium, locator, value) -> {
          boolean result = (Boolean) performComparison.execute(driver, selenium, locator, value);
          if (!result) {
            System.out.println("Verification failed");
          }
          return null;
        });

        commands.put("verifyNot" + shortName, (driver, selenium, locator, value) -> {
          boolean result = (Boolean) performComparison.execute(driver, selenium, locator, value);
          if (result) {
            System.out.println("Negative verification failed");
          }
          return null;
        });
      }
    }

    commands.put("pause", (driver, selenium, locator, value) -> {
      try {
        long timeout = Long.parseLong(locator);
        Thread.sleep(timeout);
        return null;
      } catch (NumberFormatException e) {
        throw new SeleniumException("Unable to parse timeout: " + locator);
      } catch (InterruptedException e) {
        System.exit(255);
        throw new RuntimeException("We never get this far");
      }
    });

    return commands.build();
  }

  private interface SeleneseCommand {
    Object execute(WebDriver driver, Selenium selenium, String locator, String value)
      throws SeleniumException;
  }
}
