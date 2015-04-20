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
import static org.hamcrest.Matchers.contains;
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
public class ByIntersectionTest {

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
    ByIntersection by = new ByIntersection();
    assertThat(by.findElements(driver), empty());
  }

  @Test
  public void findElementOneBy() {
    when(driver.findElementsByName("cheese")).thenReturn(cheese1AndCheese2);

    ByIntersection by = new ByIntersection(By.name("cheese"));
    WebElement foundElement = by.findElement(driver);
    System.out.println(foundElement);
    assertThat(foundElement, anyOf(equalTo(cheese1), equalTo(cheese2)));
  }

  @Test
  public void findElementsOneBy() {
    when(driver.findElementsByName("cheese")).thenReturn(cheese1AndCheese2);

    ByIntersection by = new ByIntersection(By.name("cheese"));
    assertThat(by.findElements(driver), containsInAnyOrder(cheese1AndCheese2.toArray()));
  }

  @Test
  public void findElementsOneByEmpty() {
    when(driver.findElementsByName("cheese")).thenReturn(Collections.<WebElement>emptyList());

    ByIntersection by = new ByIntersection(By.name("cheese"));
    assertThat(by.findElements(driver), empty());
  }

  @Test
  public void findFourElementsByWithNoDuplicates() {
    final WebElement elem3 = mock(AllElement.class, "webElement3");
    final WebElement elem4 = mock(AllElement.class, "webElement4");
    final List<WebElement> elems34 = Arrays.asList(elem3, elem4);

    when(driver.findElementsByName("cheese")).thenReturn(cheese1AndCheese2);
    when(driver.findElementsByName("photo")).thenReturn(elems34);

    ByIntersection by = new ByIntersection(By.name("cheese"), By.name("photo"));
    assertThat(by.findElements(driver), empty());
  }

  @Test
  public void findFourElementsByWithDuplicates() {
    final WebElement elem3 = mock(AllElement.class, "webElement3");
    final WebElement elem4 = mock(AllElement.class, "webElement4");
    final List<WebElement> elems34 = new ArrayList<WebElement>();
    elems34.add(elem3);
    elems34.add(elem4);
    final List<WebElement> cheeses123 = Arrays.asList(cheese1, cheese2, elem3);

    when(driver.findElementsByName("cheese")).thenReturn(cheeses123);
    when(driver.findElementsByName("photo")).thenReturn(elems34);

    ByIntersection by = new ByIntersection(By.name("cheese"), By.name("photo"));
    assertThat(by.findElements(driver), equalTo(Arrays.asList(elem3)));
  }

  @Test
  public void findElementsThreeBys() {
    final WebElement elem3 = mock(AllElement.class, "webElement3");
    final WebElement elem4 = mock(AllElement.class, "webElement4");
    final List<WebElement> elems123 = Arrays.asList(cheese1, cheese2, elem3);
    final List<WebElement> elems34 = Arrays.asList(elem3, elem4);
    final List<WebElement> elems1234 = Arrays.asList(cheese1, cheese2, elem3, elem4);

    when(driver.findElementsByName("cheese")).thenReturn(elems1234);
    when(driver.findElementsByName("photo")).thenReturn(elems34);
    when(driver.findElementsByName("potato")).thenReturn(elems34);

    ByIntersection by = new ByIntersection(By.name("cheese"), By.name("photo"), By.name("potato"));
    assertThat(by.findElements(driver), containsInAnyOrder(elem3, elem4));
  }

  @Test
  public void testEquals() {
    assertThat(new ByIntersection(By.id("cheese"), By.name("photo")),
        equalTo(new ByIntersection(By.id("cheese"), By.name("photo"))));
  }

  private interface AllDriver extends
      FindsById, FindsByLinkText, FindsByName, FindsByXPath, SearchContext {
    // Place holder
  }

  private interface AllElement extends WebElement {
    // Place holder
  }
}
