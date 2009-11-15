/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.internal.seleniumemulation;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.google.common.collect.Maps;
import com.thoughtworks.selenium.SeleniumException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class ElementFinder {
  // TODO(simon): This should not be public
  public static final Pattern STRATEGY_AND_VALUE_PATTERN = Pattern.compile("^(\\p{Alpha}+)=(.*)");
  private final Map<String, LookupStrategy> lookupStrategies = Maps.newHashMap();

  public ElementFinder() {
    setUpElementFindingStrategies();
  }

  public WebElement findElement(WebDriver driver, String locator) {
    LookupStrategy strategy = findStrategy(locator);
    String use = determineWebDriverLocator(locator);

    try {
      return strategy.find(driver, use);
    } catch (NoSuchElementException e) {
      throw new SeleniumException("Element " + locator + " not found");
    }
  }

  public void add(String strategyName, LookupStrategy lookupStrategy) {
    lookupStrategies.put(strategyName, lookupStrategy);
  }
   
  protected LookupStrategy findStrategy(String locator) {
    String strategyName = "implicit";

    Matcher matcher = STRATEGY_AND_VALUE_PATTERN.matcher(locator);
    if (matcher.matches()) {
      strategyName = matcher.group(1);
    }

    LookupStrategy strategy = lookupStrategies.get(strategyName);
    if (strategy == null)
      throw new SeleniumException("No matcher found for " + strategyName);

    return strategy;
  }

  protected String determineWebDriverLocator(String locator) {
    String use = locator;

    Matcher matcher = STRATEGY_AND_VALUE_PATTERN.matcher(locator);
    if (matcher.matches()) {
      use = matcher.group(2);
    }

    return use;
  }

  private void setUpElementFindingStrategies() {
    lookupStrategies.put("alt", new AltLookupStrategy());
    lookupStrategies.put("class", new ClassLookupStrategy());
    lookupStrategies.put("id", new IdLookupStrategy());
    lookupStrategies.put("identifier", new IdentifierLookupStrategy());
    lookupStrategies.put("implicit", new ImplicitLookupStrategy());
    lookupStrategies.put("link", new LinkLookupStrategy());
    lookupStrategies.put("name", new NameLookupStrategy());
    lookupStrategies.put("xpath", new XPathLookupStrategy());
    lookupStrategies.put("dom", new DomTraversalLookupStrategy());
  }
}
