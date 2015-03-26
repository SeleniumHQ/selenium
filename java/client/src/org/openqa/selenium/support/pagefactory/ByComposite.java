/*
Copyright 2007-2015 Selenium committers

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

package org.openqa.selenium.support.pagefactory;

import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;

import java.io.Serializable;
import java.util.List;

/**
 * A base class for Composites of locators.
 * A Strategy used to locate elements within a document using a series of lookups.
 * <p>
 * The list of elements returned may not be in document order.
 */
public abstract class ByComposite extends By implements Serializable {

  protected By[] bys;

  public ByComposite(By... bys) {
    this.bys = bys;
  }

  @Override
  public WebElement findElement(SearchContext context) {
    if (hasNoComponents()) {
      throw new NoSuchElementException("No Bys were specified in this composite: " + toString());
    }
    List<WebElement> foundElements = findElements(context);
    if (foundElements.isEmpty()) {
      throw new NoSuchElementException("Cannot locate any element using " + toString());
    }
    return foundElements.get(0);
  }

  /**
   * @return {@code true} if this composite has no components.
   */
  public boolean hasNoComponents() {
    return bys.length == 0;
  }

  /**
   * @return a String describing the type of this composition
   */
  public abstract String getOperation();

  @Override
  public String toString() {
    StringBuilder stringBuilder = new StringBuilder("By." + getOperation() + "(");
    stringBuilder.append("{");

    boolean first = true;
    for (By by : bys) {
      stringBuilder.append((first ? "" : ",")).append(by);
      first = false;
    }
    stringBuilder.append("})");
    return stringBuilder.toString();
  }

}
