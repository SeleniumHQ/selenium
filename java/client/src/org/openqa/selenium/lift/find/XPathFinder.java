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
package org.openqa.selenium.lift.find;

import org.hamcrest.Description;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.Collection;

/**
 * A {@link Finder} for elements using XPath expressions
 */
public class XPathFinder extends BaseFinder<WebElement, WebDriver> {
  private final String xpath;

  public XPathFinder(String xpath) {
    this.xpath = xpath;
  }

  @Override
  protected Collection<WebElement> extractFrom(WebDriver context) {
    return context.findElements(By.xpath(xpath));
  }

  @Override
  protected void describeTargetTo(Description description) {
    description.appendText("XPath ");
    description.appendText(xpath);
  }
}
