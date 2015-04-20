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
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Returns the <i>union</i> of the elements retrieved by each locator.
 * Similar to {@link ByAll} aka {@link ByOr}, but this will return a list of elements
 * <i>without</i> any duplicates.
 *
 * <h3>Example</h3>
 * Given the following locators:
 * <ul>
 *   <li>by1, which retrieves {el1, el2, el3}</li>
 *   <li>by2, which retrieves {el2, el3}</li>
 * </ul>
 *
 * <pre>
 * driver.findElements(new ByUnion(by1, by2))
 * </pre>
 * will return el1, el2 and el3.
 */
public class ByUnion extends ByComposite {

  private static final long serialVersionUID = -2428318445806893981L;

  public ByUnion(By... bys) {
    super(bys);
  }

  @Override
  public List<WebElement> findElements(SearchContext context) {
    Set<WebElement> elements = new HashSet<WebElement>();
    for (By by : bys) {
      elements.addAll(by.findElements(context));
    }
    return new ArrayList<WebElement>(elements);
  }

  @Override
  public String getOperation() {
    return "union";
  }

}
