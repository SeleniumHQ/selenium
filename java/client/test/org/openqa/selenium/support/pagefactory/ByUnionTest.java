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

import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByXPath;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@RunWith(JUnit4.class)
public class ByUnionTest {

  @Mock private AllDriver driver;
  @Mock private WebElement cheese1;
  @Mock private WebElement cheese2;
  private List<WebElement> cheese1AndCheese2;

  @Before
  public void setUp() {
    MockitoAnnotations.initMocks(this);
    cheese1AndCheese2 = Arrays.asList(cheese1, cheese2);
  }

  @Test
  public void findElementsZeroBy() {
    ByUnion by = new ByUnion();
    assertThat(by.findElements(driver), empty());
  }

  @Test
  public void findElementOneBy() {
    when(driver.findElementsByName("cheese")).thenReturn(cheese1AndCheese2);

    ByUnion by = new ByUnion(By.name("cheese"));
    WebElement foundElement = by.findElement(driver);
    assertThat(foundElement, anyOf(equalTo(cheese1), equalTo(cheese2)));
  }

  @Test
  public void findElementsOneBy() {
    when(driver.findElementsByName("cheese")).thenReturn(cheese1AndCheese2);

    ByUnion by = new ByUnion(By.name("cheese"));
    assertThat(by.findElements(driver), equalTo(cheese1AndCheese2));
  }

  @Test
  public void findElementOneByEmpty() {
    when(driver.findElementsByName("cheese")).thenReturn(Collections.<WebElement>emptyList());

    ByUnion by = new ByUnion(By.name("cheese"));
    try {
      by.findElement(driver);
      fail("Expected NoSuchElementException!");
    } catch (NoSuchElementException e) {
      // Expected
    }
  }

  @Test
  public void findElementsOneByEmpty() {
    when(driver.findElementsByName("cheese")).thenReturn(Collections.<WebElement>emptyList());

    ByUnion by = new ByUnion(By.name("cheese"));
    assertThat(by.findElements(driver), empty());
  }

  @Test
  public void findFourElementsByWithNoDuplicates() {
    final WebElement elem3 = mock(AllElement.class, "webElement3");
    final WebElement elem4 = mock(AllElement.class, "webElement4");
    final List<WebElement> elems34 = Arrays.asList(elem3, elem4);

    when(driver.findElementsByName("cheese")).thenReturn(cheese1AndCheese2);
    when(driver.findElementsByName("photo")).thenReturn(elems34);

    ByUnion by = new ByUnion(By.name("cheese"), By.name("photo"));
    assertThat(
      by.findElements(driver),
      containsInAnyOrder(cheese1, cheese2, elem3, elem4)
    );
  }

  @Test
  public void findFourElementsByWithDuplicates() {
    final WebElement elem3 = mock(AllElement.class, "webElement3");
    final WebElement elem4 = mock(AllElement.class, "webElement4");
    final List<WebElement> elems34 = Arrays.asList(elem3, elem4);
    final List<WebElement> elems123 = Arrays.asList(cheese1, cheese2, elem3);

    when(driver.findElementsByName("cheese")).thenReturn(elems123);
    when(driver.findElementsByName("photo")).thenReturn(elems34);

    ByUnion by = new ByUnion(By.name("cheese"), By.name("photo"));
    assertThat(
      by.findElements(driver),
      containsInAnyOrder(cheese1, cheese2, elem3, elem4)
    );
  }

  @Test
  public void findFourElementsByAny() {
    final AllDriver driver = mock(AllDriver.class);
    final WebElement cheese1 = mock(AllElement.class, "webElement1");
    final WebElement cheese2 = mock(AllElement.class, "webElement2");
    final WebElement elem3 = mock(AllElement.class, "webElement3");
    final WebElement elem4 = mock(AllElement.class, "webElement4");
    final List<WebElement> cheese1AndCheese2 = new ArrayList<WebElement>();
    cheese1AndCheese2.add(cheese1);
    cheese1AndCheese2.add(cheese2);
    final List<WebElement> cheese1AndCheese23 = Arrays.asList(cheese1, cheese2, elem3);
    final List<WebElement> elems34 = new ArrayList<WebElement>();
    elems34.add(elem3);
    elems34.add(elem4);
    final List<WebElement> cheese1AndCheese234 = new ArrayList<WebElement>();
    cheese1AndCheese234.addAll(cheese1AndCheese2);
    cheese1AndCheese234.addAll(elems34);

    when(driver.findElementsByName("cheese")).thenReturn(cheese1AndCheese23);
    when(driver.findElementsByName("photo")).thenReturn(elems34);

    ByUnion by = new ByUnion(By.name("cheese"), By.name("photo"));
    assertThat(by.findElements(driver), containsInAnyOrder(cheese1AndCheese234.toArray()));
  }

  @Test
  public void testEquals() {
    assertThat(new ByUnion(By.id("cheese"), By.name("photo")),
        equalTo(new ByUnion(By.id("cheese"), By.name("photo"))));
  }

  private interface AllDriver extends
      FindsById, FindsByLinkText, FindsByName, FindsByXPath, SearchContext {
    // Place holder
  }

  private interface AllElement extends WebElement {
    // Place holder
  }
}
