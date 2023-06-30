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

import java.util.Collection;
import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * Base {@link Finder} for all types of HTML tags. Subclasses should be created for each specific
 * tag, specifying the tag name (e.g. "a" in the case or an anchor tag), and a description.
 */
@Deprecated
public abstract class HtmlTagFinder extends BaseFinder<WebElement, WebDriver> {

  @Override
  protected Collection<WebElement> extractFrom(WebDriver context) {
    return context.findElements(By.xpath("//" + tagName()));
  }

  @Override
  protected void describeTargetTo(Description description) {
    description.appendText(tagDescription());
  }

  @Override // more specific return type
  public HtmlTagFinder with(Matcher<WebElement> matcher) {
    super.with(matcher);
    return this;
  }

  protected abstract String tagName();

  protected abstract String tagDescription();
}
