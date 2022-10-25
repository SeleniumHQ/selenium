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
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Mechanism used to locate elements within a document using a series of other lookups.  This class
 * will find all DOM elements that matches each of the locators in sequence, e.g.
 *
 * <pre>
 * driver.findElements(new ByChained(by1, by2))
 * </pre>
 *
 * will find all elements that match <var>by2</var> and appear under an element that matches
 * <var>by1</var>.
 */
public class ByChained extends By implements Serializable {

  private static final long serialVersionUID = 1563769051170172451L;

  private By[] bys;

  public ByChained(By... bys) {
    this.bys = bys;
  }

  @Override
  public WebElement findElement(SearchContext context) {
    List<WebElement> elements = findElements(context);
    if (elements.isEmpty())
      throw new NoSuchElementException("Cannot locate an element using " + toString());
    return elements.get(0);
  }

  @Override
  public List<WebElement> findElements(SearchContext context) {
    if (bys.length == 0) {
      return new ArrayList<>();
    }

    List<WebElement> elems = bys[0].findElements(context);
    for (int i = 1; i < bys.length; i++) {
      if (elems.isEmpty()) {
        break; // if any one of the bys finds no elements, then return no elements
      }
      final By by = bys[i];
      elems = elems.stream()
        .map(elem -> elem.findElements(by))
        .flatMap(List::stream)
        .collect(Collectors.toList());
    }

    return elems;
  }

  @Override
  public String toString() {
    return String.format(
      "By.chained({%s})",
      Stream.of(bys).map(By::toString).collect(Collectors.joining(",")));
  }

}
