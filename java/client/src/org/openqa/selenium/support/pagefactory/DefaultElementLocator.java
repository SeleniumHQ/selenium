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

import java.lang.reflect.Field;
import java.util.List;

/**
 * The default element locator, which will lazily locate an element or an element list on a page. This class is
 * designed for use with the {@link org.openqa.selenium.support.PageFactory} and understands the
 * annotations {@link org.openqa.selenium.support.FindBy} and {@link org.openqa.selenium.support.CacheLookup}.
 */
public class DefaultElementLocator implements ElementLocator {
  private final SearchContext searchContext;
  private final boolean shouldCache;
  private final By by;
  private WebElement cachedElement;
  private List<WebElement> cachedElementList;

  /**
   * Creates a new element locator.
   *
   * @param searchContext The context to use when finding the element
   * @param field The field on the Page Object that will hold the located value
   */
  public DefaultElementLocator(SearchContext searchContext, Field field) {
    this(searchContext, new Annotations(field));
  }

  /**
   * Use this constructor in order to process custom annotaions.
   *
   * @param searchContext The context to use when finding the element
   * @param annotations AbstractAnnotations class implementation
   */
  public DefaultElementLocator(SearchContext searchContext, AbstractAnnotations annotations) {
    this.searchContext = searchContext;
    this.shouldCache = annotations.isLookupCached();
    this.by = annotations.buildBy();
  }

  /**
   * Find the element.
   */
  public WebElement findElement() {
    if (cachedElement != null && shouldCache) {
      return cachedElement;
    }

    WebElement element = searchContext.findElement(by);
    if (shouldCache) {
      cachedElement = element;
    }

    return element;
  }

  /**
   * Find the element list.
   */
  public List<WebElement> findElements() {
    if (cachedElementList != null && shouldCache) {
      return cachedElementList;
    }

    List<WebElement> elements = searchContext.findElements(by);
    if (shouldCache) {
      cachedElementList = elements;
    }

    return elements;
  }

  @Override
  public String toString() {
    return this.getClass().getSimpleName() + " '" + by + "'";
  }
}
