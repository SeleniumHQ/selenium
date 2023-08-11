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

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.stream.Collectors;
import org.openqa.selenium.By;
import org.openqa.selenium.InvalidArgumentException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.Require;

// Very deliberately kept package private.
class ElementLocation {

  private final Map<Class<? extends By>, ElementFinder> finders = new HashMap<>();

  public ElementLocation() {
    finders.put(By.cssSelector("a").getClass(), ElementFinder.REMOTE);
    finders.put(By.linkText("a").getClass(), ElementFinder.REMOTE);
    finders.put(By.partialLinkText("a").getClass(), ElementFinder.REMOTE);
    finders.put(By.tagName("a").getClass(), ElementFinder.REMOTE);
    finders.put(By.xpath("//a").getClass(), ElementFinder.REMOTE);
  }

  public WebElement findElement(
      RemoteWebDriver driver,
      SearchContext context,
      BiFunction<String, Object, CommandPayload> createPayload,
      By locator) {

    Require.nonNull("WebDriver", driver);
    Require.nonNull("Context for finding elements", context);
    Require.nonNull("Method for creating remote requests", createPayload);
    Require.nonNull("Locator", locator);

    ElementFinder mechanism = finders.get(locator.getClass());
    if (mechanism != null) {
      return mechanism.findElement(driver, context, createPayload, locator);
    }

    // We prefer to use the remote version if possible
    if (locator instanceof By.Remotable) {
      try {
        WebElement element =
            ElementFinder.REMOTE.findElement(driver, context, createPayload, locator);
        finders.put(locator.getClass(), ElementFinder.REMOTE);
        return element;
      } catch (NoSuchElementException e) {
        finders.put(locator.getClass(), ElementFinder.REMOTE);
        throw e;
      } catch (InvalidArgumentException e) {
        // Fall through
      }
    }

    // But if that's not an option, then default to using the locator
    // itself for finding things.
    try {
      WebElement element =
          ElementFinder.CONTEXT.findElement(driver, context, createPayload, locator);
      finders.put(locator.getClass(), ElementFinder.CONTEXT);
      return element;
    } catch (NoSuchElementException e) {
      finders.put(locator.getClass(), ElementFinder.CONTEXT);
      throw e;
    }
  }

  public List<WebElement> findElements(
      RemoteWebDriver driver,
      SearchContext context,
      BiFunction<String, Object, CommandPayload> createPayload,
      By locator) {

    Require.nonNull("WebDriver", driver);
    Require.nonNull("Context for finding elements", context);
    Require.nonNull("Method for creating remote requests", createPayload);
    Require.nonNull("Locator", locator);

    ElementFinder finder = finders.get(locator.getClass());
    if (finder != null) {
      return finder.findElements(driver, context, createPayload, locator);
    }

    // We prefer to use the remote version if possible
    if (locator instanceof By.Remotable) {
      try {
        List<WebElement> element =
            ElementFinder.REMOTE.findElements(driver, context, createPayload, locator);
        finders.put(locator.getClass(), ElementFinder.REMOTE);
        return element;
      } catch (NoSuchElementException e) {
        finders.put(locator.getClass(), ElementFinder.REMOTE);
        throw e;
      } catch (InvalidArgumentException e) {
        // Fall through
      }
    }

    // But if that's not an option, then default to using the locator
    // itself for finding things.
    List<WebElement> elements =
        ElementFinder.CONTEXT.findElements(driver, context, createPayload, locator);

    // Only store the finder if we actually completed successfully.
    finders.put(locator.getClass(), ElementFinder.CONTEXT);
    return elements;
  }

  private enum ElementFinder {
    CONTEXT {
      @Override
      WebElement findElement(
          RemoteWebDriver driver,
          SearchContext context,
          BiFunction<String, Object, CommandPayload> createPayload,
          By locator) {
        WebElement element = locator.findElement(context);
        return massage(driver, context, element, locator);
      }

      @Override
      List<WebElement> findElements(
          RemoteWebDriver driver,
          SearchContext context,
          BiFunction<String, Object, CommandPayload> createPayload,
          By locator) {
        List<WebElement> elements = locator.findElements(context);
        return elements.stream()
            .map(e -> massage(driver, context, e, locator))
            .collect(Collectors.toList());
      }
    },
    REMOTE {
      @Override
      WebElement findElement(
          RemoteWebDriver driver,
          SearchContext context,
          BiFunction<String, Object, CommandPayload> createPayload,
          By locator) {
        By.Remotable.Parameters params = ((By.Remotable) locator).getRemoteParameters();
        CommandPayload commandPayload = createPayload.apply(params.using(), params.value());

        Response response = driver.execute(commandPayload);
        WebElement element = (WebElement) response.getValue();
        if (element == null) {
          throw new NoSuchElementException("Unable to find element with locator " + locator);
        }
        return massage(driver, context, element, locator);
      }

      @Override
      List<WebElement> findElements(
          RemoteWebDriver driver,
          SearchContext context,
          BiFunction<String, Object, CommandPayload> createPayload,
          By locator) {
        By.Remotable.Parameters params = ((By.Remotable) locator).getRemoteParameters();
        CommandPayload commandPayload = createPayload.apply(params.using(), params.value());

        Response response = driver.execute(commandPayload);
        @SuppressWarnings("unchecked")
        List<WebElement> elements = (List<WebElement>) response.getValue();

        if (elements == null) { // see https://github.com/SeleniumHQ/selenium/issues/4555
          return Collections.emptyList();
        }

        return elements.stream()
            .map(e -> massage(driver, context, e, locator))
            .collect(Collectors.toList());
      }
    };

    abstract WebElement findElement(
        RemoteWebDriver driver,
        SearchContext context,
        BiFunction<String, Object, CommandPayload> createPayload,
        By locator);

    abstract List<WebElement> findElements(
        RemoteWebDriver driver,
        SearchContext context,
        BiFunction<String, Object, CommandPayload> createPayload,
        By locator);

    protected WebElement massage(
        RemoteWebDriver driver, SearchContext context, WebElement element, By locator) {
      if (!(element instanceof RemoteWebElement)) {
        return element;
      }

      RemoteWebElement remoteElement = (RemoteWebElement) element;
      if (locator instanceof By.Remotable) {
        By.Remotable.Parameters params = ((By.Remotable) locator).getRemoteParameters();
        remoteElement.setFoundBy(context, params.using(), String.valueOf(params.value()));
      }
      remoteElement.setFileDetector(driver.getFileDetector());
      remoteElement.setParent(driver);

      return remoteElement;
    }
  }
}
