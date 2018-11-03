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

package org.openqa.selenium.lift.match;

import org.hamcrest.Description;
import org.hamcrest.Factory;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;
import org.openqa.selenium.WebElement;

/**
 * Matcher to match a selected element (e.g. a radio button).
 */
public class SelectionMatcher extends TypeSafeMatcher<WebElement> {

  @Override
  public boolean matchesSafely(WebElement item) {
    return item.isSelected();
  }

  @Override
  public void describeTo(Description description) {
    description.appendText("should be selected");
  }

  @Factory
  public static Matcher<WebElement> selection() {
    return new SelectionMatcher();
  }
}
