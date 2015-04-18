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

import java.util.Collections;
import java.util.List;

/**
 * Similar to {@link ByOr} but this works like a <i>lazy</i> OR: it will return <i>as soon as</i>
 * one of the given locators retrieves some elements.
 *
 * <h3>Example</h3>
 * <pre>
 * driver.findElements(new ByLazyOr(by1, by2))
 * </pre>
 * will return:
 * <ul>
 *   <li>all elements that match <var>by1</var>, if any;
 *   <li>or, all elements that match <var>by2</var>, if any;
 *   <li>otherwise, an empty list.
 * </ul>
 *
 * <h3>Use case</h3>
 * Consider the case where different test environments with different versions of the SUT exist.
 * In this scenario, selectors are likely to be slightly different for each environment.
 * Also, you know that only one selector variant will work for each environment:
 * so, you want the lookup to stop as soon as one of the locators retrieves something.
 * With {@link ByLazyOr}, you can hide the different selectors into only one (composite) locator,
 * which means you can have only one WebElement working in all of the environments.
 */
public class ByLazyOr extends ByComposite {

  private static final long serialVersionUID = -6052860511188129509L;

  public ByLazyOr(By... bys) {
    super(bys);
  }

  @Override
  public List<WebElement> findElements(SearchContext context) {
    for (By by : bys) {
      List<WebElement> elements = by.findElements(context);
      if(!elements.isEmpty()) {
        return elements;
      }
    }
    return Collections.emptyList();
  }

  @Override
  public String getOperation() {
    return "lazy-or";
  }

}
