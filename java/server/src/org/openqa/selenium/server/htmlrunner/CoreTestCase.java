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


import com.google.common.base.Joiner;
import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

public class CoreTestCase {

  private static final Logger LOG = Logger.getLogger(CoreTestCase.class.getName());

  private static final ImmutableMap<String, CoreStepFactory> STEP_FACTORY =
    ImmutableMap.<String, CoreStepFactory>builder()
    .putAll(new ReflectivelyDiscoveredSteps().get())
    .putAll(new NonReflectiveSteps().get())
    .build();
  private String url;

  public CoreTestCase(String url) {
    this.url = Preconditions.checkNotNull(url);
  }

  public void run(Results results, WebDriver driver, Selenium selenium, URL baseUrl) {
    String currentUrl = driver.getCurrentUrl();
    if (!url.equals(currentUrl)) {
      driver.get(url);
    }

    // Grabbing the steps modifies the underlying HTML...
    List<LoggableStep> steps = findCommands(driver, baseUrl);
    // ... which we now grab so we can process it later.
    String rawSource = getLoggableTests(driver);

    TestState state = new TestState();
    List<StepResult> stepResults = new ArrayList<>(steps.size());
    NextStepDecorator decorator = NextStepDecorator.IDENTITY;
    for (LoggableStep step : steps) {
      LOG.finest(step.toString());
      decorator = Preconditions.checkNotNull(decorator.evaluate(step, selenium, state), step);
      stepResults.add(new StepResult(step, decorator.getCause()));
      if (!decorator.isOkayToContinueTest()) {
        break;
      }
      state.sleepTight();
    }

    results.addTest(rawSource, stepResults);
  }

  private String getLoggableTests(WebDriver driver) {
    return (String) ((JavascriptExecutor) driver).executeScript(Joiner.on("\n").join(
      "var resultHTML = document.body.innerHTML;",
      "if (!resultHTML) { return ''; }",

      "var trElement = document.createElement('tr');",
      "var divElement = document.createElement('div');",
      "divElement.innerHTML = resultHTML;",

      "var cell = document.createElement('td');",
      "cell.appendChild(divElement);",

      "trElement.appendChild(cell);",

      "return trElement.outerHTML;"));
  }

  private List<LoggableStep> findCommands(WebDriver driver, URL baseUrl) {
    if (baseUrl ==  null) {
      // Figure out the base url, if it is not specified and there is one in the test case file.
      List<WebElement> allLinks = driver.findElements(By.xpath("//head/link[@rel='selenium.base']"));
      // Only use the first one (if there's one at all)
      if (!allLinks.isEmpty()) {
        String href = allLinks.get(0).getAttribute("href");
        try {
          baseUrl = new URL(href);
        } catch (MalformedURLException e) {
          throw new SeleniumException("Base URL for test cannot be parsed: " + href);
        }
      }
    }

    // Let's just run and hide in the horror that is JS for the sake of speed.
    //noinspection unchecked
    List<List<String>> rawSteps = (List<List<String>>) ((JavascriptExecutor) driver).executeScript(
      "var toReturn = [];\n" +
      "var tables = document.getElementsByTagName('table');\n" +
      "for (var i = 0; i < tables.length; i++) {" +
      "  for (var rowCount = 0; rowCount < tables[i].rows.length; rowCount++) {\n" +
      "    if (tables[i].rows[rowCount].cells.length < 3) {\n" +
      "      continue;\n" +
      "    }\n" +
      "    var cells = tables[i].rows[rowCount].cells;\n" +
      "    toReturn.push([cells[0].textContent.trim(), cells[1].textContent.trim(), cells[2].textContent.trim()]);\n" +
      // Now modify the row so we know we should add a result later
      "    tables[i].rows[rowCount].className += 'insert-core-result';\n" +
      "  }\n" +
      "}\n" +
      "return toReturn;");

    ImmutableList.Builder<LoggableStep> steps = ImmutableList.builder();
    for (List<String> step : rawSteps) {
      if (!STEP_FACTORY.containsKey(step.get(0))) {
        throw new SeleniumException("Unknown command: " + step.get(0));
      }
      String value = step.get(1);
      steps.add(new LoggableStep(
        STEP_FACTORY.get(step.get(0)).create(value, step.get(2)),
        step.get(0),
        value,
        step.get(2)));
    }
    return steps.build();
  }

  private static class LoggableStep implements CoreStep {
    private final CoreStep actualStep;
    private final String command;
    private final String locator;
    private final String value;

    public LoggableStep(CoreStep toWrap, String command, String locator, String value) {
      this.actualStep = toWrap;
      this.command = command;
      this.locator = locator.replace('\u00A0',' ');
      this.value = value.replace('\u00A0',' ');
    }

    @Override
    public NextStepDecorator execute(Selenium selenium, TestState state) {
      return actualStep.execute(selenium, state);
    }

    @Override
    public String toString() {
      return String.format("|%s | %s | %s |", command, locator, value);
    }
  }

  static class StepResult {
    private final LoggableStep step;
    private final Throwable cause;
    private final String renderableClass;

    public StepResult(LoggableStep step, Throwable cause) {
      this.step = Preconditions.checkNotNull(step);
      this.cause = cause;

      if (cause == null) {
        // I think we can all agree this is shameful
        if (step.command.startsWith("verify") || step.command.startsWith("assert")) {
          this.renderableClass = "status_passed";
        } else {
          this.renderableClass = "status_done";
        }
      } else {
        this.renderableClass = "status_failed";
      }
    }

    public String getRenderableClass() {
      return renderableClass;
    }

    public boolean isSuccessful() {
      return cause == null;
    }

    public boolean isError() {
      return cause instanceof SeleniumException;
    }

    public boolean isFailure() {
      return !isSuccessful() && !isError();
    }

    public String getStepLog() {
      return cause == null ? step.toString()
        : String.format("%s\n%s", step.toString(), cause);
    }
  }
}
