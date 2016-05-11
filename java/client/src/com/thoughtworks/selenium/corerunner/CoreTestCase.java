package com.thoughtworks.selenium.corerunner;


import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;

import com.thoughtworks.selenium.Selenium;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import java.util.List;

public class CoreTestCase {

  private String url;

  public CoreTestCase(String url) {
    this.url = Preconditions.checkNotNull(url);
  }

  public void run(Results results, WebDriver driver, Selenium selenium) {
    String currentUrl = driver.getCurrentUrl();
    if (!url.equals(currentUrl)) {
      driver.get(url);
    }

    List<CoreTestStep> steps = findCommands(driver);
    for (CoreTestStep step : steps) {
      step.run(results, driver, selenium);
    }
  }

  private List<CoreTestStep> findCommands(WebDriver driver) {
    // Let's just run and hide in the horror that is JS for the sake of speed.
    List<List<String>> rawSteps = (List<List<String>>) ((JavascriptExecutor) driver).executeScript(
      "var toReturn = [];\n" +
      "var tables = document.getElementsByTagName('table');\n" +
      "for (var i = 0; i < tables.length; i++) {" +
      "  for (var rowCount = 0; rowCount < tables[i].rows.length; rowCount++) {\n" +
      "    if (tables[i].rows[rowCount].cells.length < 3) {\n" +
      "      continue;\n" +
      "    }\n" +
      "    var cells = tables[i].rows[rowCount].cells;\n" +
      "    toReturn.push([cells[0].textContent, cells[1].textContent, cells[2].textContent]);\n" +
      "  }\n" +
      "}\n" +
      "return toReturn;");

    ImmutableList.Builder<CoreTestStep> steps = ImmutableList.builder();
    for (List<String> rawStep: rawSteps) {
      steps.add(new CoreTestStep(rawStep.get(0), rawStep.get(1), rawStep.get(2)));
    }
    return steps.build();
  }
}
