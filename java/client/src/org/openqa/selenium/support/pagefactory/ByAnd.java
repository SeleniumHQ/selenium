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

package org.openqa.selenium.support.pagefactory;

import org.openqa.selenium.By;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Mechanism used to locate elements within a document using a series of <i>nested</i> lookups.
 * It will find the DOM elements that match all of the locators in sequence.
 * <p>
 * Similar to {@link ByChained} but this is more restrictive, as it works like a boolean <i>AND</i>:
 * if any one of the locators retrieves no elements, then an empty list is returned.
 * <p>
 * The behavior is the same as the one given by concatenating several CSS selectors in one
 * {@link By.ByCssSelector} locator.
 * For example, given the following selectors and locators:
 *
 * <pre>
 *   String cssSelector1 = "#content";
 *   String cssSelector2 = "ul.nav";
 *   By locator1 = By.cssSelector(cssSelector1);
 *   By locator2 = By.cssSelector(cssSelector2);
 * </pre>
 *
 * then, the following calls will return the same elements:
 *
 * <pre>
 *   driver.findElements(By.cssSelector(cssSelector1 + " " + cssSelector2));
 *
 *   driver.findElements(new ByAnd(locator1, locator2));
 * </pre>
 */
public class ByAnd extends ByComposite {

  private static final long serialVersionUID = 9191603468455739841L;

  public ByAnd(By... bys) {
    super(bys);
  }

  @Override
  public List<WebElement> findElements(SearchContext context) {
    if (hasNoComponents()) {
      return Collections.emptyList();
    }

    List<WebElement> elems = bys[0].findElements(context);
    for (int i=1 ; i<bys.length ; i++) {
      List<WebElement> newElems = new ArrayList<WebElement>();

      for (WebElement elem : elems) {
        newElems.addAll(elem.findElements(bys[i]));
      }

      if(newElems.isEmpty()) {
        return Collections.emptyList();
      } else {
        elems = newElems;
      }
    }

    // remove duplicates by turning the list into a set
    Set<WebElement> set = new HashSet<WebElement>(elems);
    return new ArrayList<WebElement>(set);
  }

  @Override
  public String getOperation() {
    return "and";
  }

}
