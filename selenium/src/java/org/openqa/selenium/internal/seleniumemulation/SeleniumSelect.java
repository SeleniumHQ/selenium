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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;

import com.google.common.collect.Maps;
import com.thoughtworks.selenium.SeleniumException;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class SeleniumSelect {
  private final Map<String, OptionSelectStrategy> optionSelectStrategies = Maps.newHashMap();
  private final ElementFinder finder;

  public SeleniumSelect(ElementFinder finder) {
    this.finder = finder;
    setUpOptionFindingStrategies();
  }

  public static enum Property {
    ID,
    INDEX,
    TEXT,
    VALUE,
  }

  public List<String> getOptions(WebDriver driver, String selectLocator, Property property, boolean fetchAll) {
    WebElement element = finder.findElement(driver, selectLocator);
    List<WebElement> options = element.findElements(By.tagName("option"));

    if (options.size() == 0) {
      throw new SeleniumException("Specified element is not a Select (has no options)");
    }

    List<String> selectedOptions = new ArrayList<String>();

    for (WebElement option : options) {
      if (fetchAll || option.isSelected()) {
        switch (property) {
          case TEXT:
            selectedOptions.add(option.getText());
            break;

          case VALUE:
            selectedOptions.add(option.getValue());
            break;

          case ID:
            selectedOptions.add(option.getAttribute("id"));
            break;

          case INDEX:
            // TODO(simon): Implement this in the IE driver as "getAttribute"
            Object result  = ((JavascriptExecutor) driver)
                .executeScript("return arguments[0].index", option);
            selectedOptions.add(String.valueOf(result));
            break;
        }
      }
    }

    return selectedOptions;
  }

  public boolean isMultiple(WebElement theSelect) {
    String multiple = theSelect.getAttribute("multiple");

    if (multiple == null) { return false; }
    if ("false".equals(multiple)) { return false; }
    if ("".equals(multiple)) { return false; }

    return true;
  }

  public void select(WebDriver driver, String selectLocator, String optionLocator, boolean setSelected, boolean onlyOneOption) {
    WebElement select = finder.findElement(driver, selectLocator);
    List<WebElement> allOptions = select.findElements(By.tagName("option"));

    boolean isMultiple = isMultiple(select);

    if (onlyOneOption && isMultiple) {
      new RemoveAllSelections(finder).apply(driver, new String[] { selectLocator });
    }

    Matcher matcher = ElementFinder.STRATEGY_AND_VALUE_PATTERN
        .matcher(optionLocator);
    String strategyName = "implicit";
    String use = optionLocator;

    if (matcher.matches()) {
      strategyName = matcher.group(1);
      use = matcher.group(2);
    }
    if (use == null) {
      use = "";
    }

    OptionSelectStrategy strategy = optionSelectStrategies.get(strategyName);
    if (strategy == null) {
      throw new SeleniumException(
          strategyName + " (from " + optionLocator + ") is not a method for selecting options");
    }

    if (!strategy.select(allOptions, use, setSelected, isMultiple)) {
      throw new SeleniumException(optionLocator + " is not an option");
    }
  }

  private void setUpOptionFindingStrategies() {
    optionSelectStrategies.put("implicit", new LabelOptionSelectStrategy());
    optionSelectStrategies.put("id", new IdOptionSelectStrategy());
    optionSelectStrategies.put("index", new IndexOptionSelectStrategy());
    optionSelectStrategies.put("label", new LabelOptionSelectStrategy());
    optionSelectStrategies.put("value", new ValueOptionSelectStrategy());
  }
}