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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.lift.match.DisplayedMatcher.displayed;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebElement;

class DisplayedMatcherTest {

  @Test
  void testShouldNotFailForDisplayedWebElement() {
    WebElement element = createWebElementWithDisplayed(true);
    assertThat(element, is(displayed()));
  }

  @Test
  void testShouldFailForNotDisplayedWebElement() {
    final WebElement element = createWebElementWithDisplayed(false);
    assertThat(element, is(not(displayed())));
  }

  private WebElement createWebElementWithDisplayed(final boolean displayed) {
    final WebElement element = mock(WebElement.class);
    when(element.isDisplayed()).thenReturn(displayed);
    return element;
  }
}
