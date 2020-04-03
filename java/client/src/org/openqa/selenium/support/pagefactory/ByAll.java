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

/**
 * Mechanism used to locate elements within a document using a series of  lookups. This class will
 * find all DOM elements that matches any of the locators in sequence, e.g.
 *
 * <pre>
 * driver.findElements(new ByAll(by1, by2))
 * </pre>
 *
 * will find all elements that match <var>by1</var> and then all elements that match <var>by2</var>.
 * This means that the list of elements returned may not be in document order.
 */
public class ByAll extends By implements Serializable {

  private static final long serialVersionUID = 4573668832699497306L;

  private By[] bys;

  public ByAll(By... bys) {
    this.bys = bys;
  }

  @Override
  public WebElement findElement(SearchContext context) {
    for (By by : bys) {
      List<WebElement> elements = context.findElements(by);
      if (!elements.isEmpty()) {
        return elements.get(0);
      }
    }
    throw new NoSuchElementException("Cannot locate an element using " + toString());
  }

  @Override
  public List<WebElement> findElements(SearchContext context) {
    List<WebElement> elems = new ArrayList<>();
    for (By by : bys) {
      elems.addAll(context.findElements(by));
    }

    return elems;
  }

  @Override
  public String toString() {
    StringBuilder stringBuilder = new StringBuilder("By.all(");
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
