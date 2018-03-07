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

package com.thoughtworks.selenium.webdriven;

import com.google.common.annotations.VisibleForTesting;

import com.thoughtworks.selenium.SeleniumException;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

public class ElementFinder {
  private final static Logger log = Logger.getLogger(ElementFinder.class.getName());
  private final String findElement;
  private final String sizzle;
  private final Map<String, String> additionalLocators = new HashMap<>();

  @VisibleForTesting
  protected ElementFinder() {
    findElement = null;
    sizzle = null;
  }

  public ElementFinder(JavascriptLibrary library) {
    String rawScript = library.getSeleniumScript("findElement.js");
    findElement = "return (" + rawScript + ")(arguments[0]);";

    String linkTextLocator =
        "return (" + library.getSeleniumScript("linkLocator.js") +
            ").call(null, arguments[0], document)";
    add("link", linkTextLocator);

    sizzle = new JavascriptLibrary().readScriptImpl(JavascriptLibrary.PREFIX  + "sizzle.js") +
        "var results = []; " +
        "try { Sizzle(arguments[0], document, results);} " +
        "catch (ignored) {} " +
        "return results.length ? results[0] : null;";
    add("sizzle", sizzle);
  }

  public WebElement findElement(WebDriver driver, String locator) {
    WebElement toReturn = null;

    String strategy = searchAdditionalStrategies(locator);
    if (strategy != null) {
      String actualLocator = locator.substring(locator.indexOf('=') + 1);
      // TODO(simon): Recurse into child documents

      try {
        toReturn =
            (WebElement) ((JavascriptExecutor) driver).executeScript(strategy, actualLocator);

        if (toReturn == null) {
          throw new SeleniumException("Element " + locator + " not found");
        }

        return toReturn;
      } catch (WebDriverException e) {
        throw new SeleniumException("Element " + locator + " not found", e);
      }
    }

    try {
      toReturn = findElementDirectlyIfNecessary(driver, locator);
      if (toReturn != null) {
        return toReturn;
      }
      return (WebElement) ((JavascriptExecutor) driver).executeScript(findElement, locator);
    } catch (WebDriverException e) {
      throw new SeleniumException("Element " + locator + " not found", e);
    }
  }

  public void add(String strategyName, String implementation) {
    additionalLocators.put(strategyName, implementation);
  }

  private String searchAdditionalStrategies(String locator) {
    int index = locator.indexOf('=');
    if (index == -1) {
      return null;
    }


    String key = locator.substring(0, index);
    return additionalLocators.get(key);
  }

  private WebElement findElementDirectlyIfNecessary(WebDriver driver, String locator) {
    if (locator.startsWith("xpath=")) {
      return xpathWizardry(driver, locator.substring("xpath=".length()));
    }
    if (locator.startsWith("//")) {
      return xpathWizardry(driver, locator);
    }

    if (locator.startsWith("css=")) {
      String selector = locator.substring("css=".length());
      try {
        return driver.findElement(By.cssSelector(selector));
      } catch (WebDriverException e) {
        return fallbackToSizzle(driver, selector);
      }
    }

    return null;
  }

  private WebElement xpathWizardry(WebDriver driver, String xpath) {
    try {
      return driver.findElement(By.xpath(xpath));
    } catch (WebDriverException ignored) {
      // Because we have inconsistent return values
    }

    if (xpath.endsWith("/")) {
      return driver.findElement(By.xpath(xpath.substring(0, xpath.length() - 1)));
    }

    throw new NoSuchElementException("Cannot find an element with the xpath: " + xpath);
  }

  private WebElement fallbackToSizzle(WebDriver driver, String locator) {
    WebElement toReturn = (WebElement) ((JavascriptExecutor) driver).executeScript(sizzle, locator);
    if (toReturn != null) {
      log.warning("You are using a Sizzle locator as a CSS Selector. " +
          "Please use the Sizzle library directly via the JavascriptExecutor or a plain CSS " +
          "selector. Your locator was: " + locator);
      return toReturn;
    }
    throw new NoSuchElementException("Cannot locate element even after falling back to Sizzle: " +
        locator);
  }
}
