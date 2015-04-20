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
public class ByAndTest {

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
  public void findElements_givenZeroBys() {
    ByAnd by = new ByAnd();
    assertThat(by.findElements(driver), empty());
  }

  @Test
  public void findElements_givenOneByLocatingElements() {
    when(driver.findElementsByName("cheese")).thenReturn(cheese1AndCheese2);

    ByAnd by = new ByAnd(By.name("cheese"));
    assertThat(by.findElements(driver), equalTo(cheese1AndCheese2));
  }

  @Test
  public void findElements_givenOneByLocatingNoElements() {
    when(driver.findElementsByName("cheese")).thenReturn(Collections.<WebElement>emptyList());

    ByAnd by = new ByAnd(By.name("cheese"));
    assertThat(by.findElements(driver), empty());
  }

  @Test
  public void findElement_givenTwoBysLocatingNestedElements() {
    final WebElement elem3 = mock(AllElement.class, "cheese1photo1");
    final WebElement elem4 = mock(AllElement.class, "cheese1photo2");
    final WebElement elem5 = mock(AllElement.class, "cheese2photo1");
    final List<WebElement> elems34 = Arrays.asList(elem3, elem4);
    final List<WebElement> elems5 = Arrays.asList(elem5);

    when(driver.findElementsByName("cheese")).thenReturn(cheese1AndCheese2);
    when(cheese1.findElements(By.name("photo"))).thenReturn(elems34);
    when(cheese2.findElements(By.name("photo"))).thenReturn(elems5);

    ByAnd by = new ByAnd(By.name("cheese"), By.name("photo"));
    assertThat(by.findElement(driver), anyOf(equalTo(elem3), equalTo(elem4), equalTo(elem5)));
  }

  @Test
  public void findElements_givenTwoBysLocatingNestedElements() {
    final WebElement elem3 = mock(AllElement.class, "cheese1photo1");
    final WebElement elem4 = mock(AllElement.class, "cheese1photo2");
    final WebElement elem5 = mock(AllElement.class, "cheese2photo1");
    final List<WebElement> elems34 = Arrays.asList(elem3, elem4);
    final List<WebElement> elems5 = Arrays.asList(elem5);
    final List<WebElement> elems345 = Arrays.asList(elem3, elem4, elem5);

    when(driver.findElementsByName("cheese")).thenReturn(cheese1AndCheese2);
    when(cheese1.findElements(By.name("photo"))).thenReturn(elems34);
    when(cheese2.findElements(By.name("photo"))).thenReturn(elems5);

    ByAnd by = new ByAnd(By.name("cheese"), By.name("photo"));
    assertThat(by.findElements(driver), containsInAnyOrder(elem3, elem4, elem5));
  }

  @Test
  public void findElements_givenTwoBysEmptyParent() {
    when(driver.findElementsByName("cheese")).thenReturn(Collections.<WebElement>emptyList());

    ByAnd by = new ByAnd(By.name("cheese"), By.name("photo"));
    assertThat(by.findElements(driver), empty());
  }

  @Test
  public void findElements_givenTwoBysOneEmptyChild() {
    final WebElement elem1 = mock(WebElement.class, "webElement1");
    final WebElement elem2 = mock(AllElement.class, "webElement2");
    final WebElement elem5 = mock(AllElement.class, "webElement5");
    final List<WebElement> elems12 = Arrays.asList(elem1, elem2);
    final List<WebElement> elems5 = Arrays.asList(elem5);

    when(driver.findElementsByName("cheese")).thenReturn(elems12);
    when(elem1.findElements(By.name("photo"))).thenReturn(Collections.<WebElement>emptyList());
    when(elem2.findElements(By.name("photo"))).thenReturn(elems5);

    ByAnd by = new ByAnd(By.name("cheese"), By.name("photo"));
    assertThat(by.findElements(driver), equalTo(elems5));
  }

  @Test
  public void findElements_givenTwoBysNoChildren() {
    final WebElement elem1 = mock(WebElement.class, "cheese1");
    final WebElement elem2 = mock(AllElement.class, "cheese2");
    final List<WebElement> cheese1AndCheese2 = Arrays.asList(elem1, elem2);

    when(driver.findElementsByName("cheese")).thenReturn(cheese1AndCheese2);
    when(elem1.findElements(By.name("photo"))).thenReturn(Collections.<WebElement>emptyList());
    when(elem2.findElements(By.name("photo"))).thenReturn(Collections.<WebElement>emptyList());

    ByAnd by = new ByAnd(By.name("cheese"), By.name("photo"));
    assertThat(by.findElements(driver), empty());
  }

  @Test
  public void findElementsShouldNotReturnDuplicates() {
    final WebElement elem5 = mock(AllElement.class, "webElement5");
    final WebElement elem6 = mock(AllElement.class, "webElement6");

    when(driver.findElementsByName("cheese")).thenReturn(cheese1AndCheese2);
    when(cheese1.findElements(By.name("photo"))).thenReturn(Arrays.asList(elem5));
    when(cheese2.findElements(By.name("photo"))).thenReturn(Arrays.asList(elem5, elem6));

    ByAnd by = new ByAnd(By.name("cheese"), By.name("photo"));
    assertThat(by.findElements(driver), containsInAnyOrder(elem5, elem6));
  }

  @Test
  public void testEquals() {
    assertThat(new ByAnd(By.id("cheese"), By.name("photo")),
        equalTo(new ByAnd(By.id("cheese"), By.name("photo"))));
  }

  private interface AllDriver extends
      FindsById, FindsByLinkText, FindsByName, FindsByXPath, SearchContext {
    // Place holder
  }

  private interface AllElement extends WebElement {
    // Place holder
  }
}
