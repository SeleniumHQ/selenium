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

package org.openqa.selenium.lift;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import org.hamcrest.Matcher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.mockito.Mockito;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.lift.find.Finder;

/**
 * Unit test for {@link HamcrestWebDriverTestCase}.
 *
 * @author rchatley (Robert Chatley)
 */
@SuppressWarnings("unchecked")
class HamcrestWebdriverTestCaseTest {

  final String text = "abcde";
  final String url = "http://www.example.com";
  Finder<WebElement, WebDriver> something;
  Matcher<Integer> someNumberOf;

  HamcrestWebDriverTestCase testcase;

  @BeforeEach
  public void createMocks() {
    testcase = createTestCase();

    something = mock(Finder.class);
    someNumberOf = mock(Matcher.class);
  }

  @Test
  void delegatesAllCallsToItsTestContext() {

    final TestContext testContext = mock(TestContext.class);
    testcase.setContext(testContext);

    testcase.goTo(url);
    testcase.clickOn(something);
    testcase.type(text, something);
    testcase.assertPresenceOf(something);
    testcase.assertPresenceOf(someNumberOf, something);

    InOrder order = Mockito.inOrder(testContext);
    order.verify(testContext).goTo(url);
    order.verify(testContext).clickOn(something);
    order.verify(testContext).type(text, something);
    order.verify(testContext).assertPresenceOf(something);
    order.verify(testContext).assertPresenceOf(someNumberOf, something);
    order.verifyNoMoreInteractions();
  }

  @Test
  void providesSyntacticSugarMethodNamedInto() {
    Finder<WebElement, WebDriver> result = testcase.into(something);
    assertThat(result).isEqualTo(something);
  }

  private HamcrestWebDriverTestCase createTestCase() {
    return new HamcrestWebDriverTestCase() {

      @Override
      protected WebDriver createDriver() {
        return mock(WebDriver.class);
      }
    };
  }
}
