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

import static java.util.Collections.emptyList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;

@Tag("UnitTests")
class ByChainedTest {

  private static final List<WebElement> NO_ELEMENTS = emptyList();

  @Test
  void findElementZeroBy() {
    final AllDriver driver = mock();

    ByChained by = new ByChained();
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> by.findElement(driver));
  }

  @Test
  void findElementsZeroBy() {
    final AllDriver driver = mock();

    ByChained by = new ByChained();
    assertThat(by.findElements(driver)).isEmpty();
  }

  @Test
  void findElementOneBy() {
    final AllDriver driver = mock();
    final WebElement elem1 = mock("webElement1");
    final WebElement elem2 = mock("webElement2");
    final List<WebElement> elems12 = List.of(elem1, elem2);

    when(driver.findElements(By.cssSelector("cheese"))).thenReturn(elems12);

    ByChained by = new ByChained(By.cssSelector("cheese"));
    assertThat(by.findElement(driver)).isEqualTo(elem1);
  }

  @Test
  void findElementsOneBy() {
    final AllDriver driver = mock();
    final WebElement elem1 = mock("webElement1");
    final WebElement elem2 = mock("webElement2");

    when(driver.findElements(By.tagName("cheese"))).thenReturn(List.of(elem1, elem2));

    ByChained by = new ByChained(By.tagName("cheese"));
    assertThat(by.findElements(driver)).containsExactly(elem1, elem2);
  }

  @Test
  void findElementOneByEmpty() {
    final AllDriver driver = mock();
    when(driver.findElements(By.name("cheese"))).thenReturn(emptyList());

    ByChained by = new ByChained(By.name("cheese"));
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> by.findElement(driver));
  }

  @Test
  void findElementsOneByEmpty() {
    final AllDriver driver = mock();
    when(driver.findElements(By.name("cheese"))).thenReturn(emptyList());

    ByChained by = new ByChained(By.name("cheese"));
    assertThat(by.findElements(driver)).isEmpty();
  }

  @Test
  void findElementTwoBy() {
    final AllDriver driver = mock();
    final WebElement elem1 = mock("webElement1");
    final WebElement elem2 = mock("webElement2");
    final WebElement elem3 = mock("webElement3");
    final WebElement elem4 = mock("webElement4");
    final WebElement elem5 = mock("webElement5");
    final List<WebElement> elems12 = List.of(elem1, elem2);
    final List<WebElement> elems34 = List.of(elem3, elem4);
    final List<WebElement> elems5 = List.of(elem5);
    final List<WebElement> elems345 = List.of(elem3, elem4, elem5);

    when(driver.findElements(By.cssSelector("cheese"))).thenReturn(elems12);
    when(elem1.findElements(By.cssSelector("photo"))).thenReturn(elems34);
    when(elem2.findElements(By.cssSelector("photo"))).thenReturn(elems5);

    ByChained by = new ByChained(By.cssSelector("cheese"), By.cssSelector("photo"));
    assertThat(by.findElement(driver)).isEqualTo(elem3);
  }

  @Test
  void findElementTwoByEmptyParent() {
    final AllDriver driver = mock();
    final WebElement elem1 = mock("webElement1");
    final WebElement elem2 = mock("webElement2");
    final WebElement elem3 = mock("webElement3");
    final WebElement elem4 = mock("webElement4");
    final WebElement elem5 = mock("webElement5");

    final List<WebElement> elems = List.of();
    final List<WebElement> elems12 = List.of(elem1, elem2);
    final List<WebElement> elems34 = List.of(elem3, elem4);
    final List<WebElement> elems5 = List.of(elem5);
    final List<WebElement> elems345 = List.of(elem3, elem4, elem5);

    when(driver.findElements(By.name("cheese"))).thenReturn(elems);

    ByChained by = new ByChained(By.name("cheese"), By.name("photo"));
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> by.findElement(driver));
  }

  @Test
  void findElementsTwoByEmptyParent() {
    final AllDriver driver = mock();
    final WebElement elem1 = mock("webElement1");
    final WebElement elem2 = mock("webElement2");
    final WebElement elem3 = mock("webElement3");
    final WebElement elem4 = mock("webElement4");
    final WebElement elem5 = mock("webElement5");

    final List<WebElement> elems = List.of();
    final List<WebElement> elems12 = List.of(elem1, elem2);
    final List<WebElement> elems34 = List.of(elem3, elem4);
    final List<WebElement> elems5 = List.of(elem5);
    final List<WebElement> elems345 = List.of(elem3, elem4, elem5);

    when(driver.findElements(By.name("cheese"))).thenReturn(elems);

    ByChained by = new ByChained(By.name("cheese"), By.name("photo"));
    assertThat(by.findElements(driver)).isEmpty();
  }

  @Test
  void findElementTwoByEmptyChild() {
    final AllDriver driver = mock();
    final WebElement elem1 = mock("webElement1");
    final WebElement elem2 = mock("webElement2");
    final WebElement elem3 = mock("webElement3");
    final WebElement elem4 = mock("webElement4");
    final WebElement elem5 = mock("webElement5");

    final List<WebElement> elems = List.of();
    final List<WebElement> elems12 = List.of(elem1, elem2);
    final List<WebElement> elems34 = List.of(elem3, elem4);
    final List<WebElement> elems5 = List.of(elem5);
    final List<WebElement> elems345 = List.of(elem3, elem4, elem5);

    when(driver.findElements(By.tagName("cheese"))).thenReturn(elems12);
    when(elem1.findElements(By.tagName("photo"))).thenReturn(elems);
    when(elem2.findElements(By.tagName("photo"))).thenReturn(elems5);

    ByChained by = new ByChained(By.tagName("cheese"), By.tagName("photo"));
    assertThat(by.findElement(driver)).isEqualTo(elem5);
  }

  @Test
  void findElementsTwoByEmptyChild() {
    final AllDriver driver = mock();
    final WebElement elem1 = mock("webElement1");
    final WebElement elem2 = mock("webElement2");
    final WebElement elem3 = mock("webElement3");
    final WebElement elem4 = mock("webElement4");
    final WebElement elem5 = mock("webElement5");

    final List<WebElement> elems = List.of();
    final List<WebElement> elems12 = List.of(elem1, elem2);
    final List<WebElement> elems34 = List.of(elem3, elem4);
    final List<WebElement> elems5 = List.of(elem5);
    final List<WebElement> elems345 = List.of(elem3, elem4, elem5);

    when(driver.findElements(By.linkText("cheese"))).thenReturn(elems12);
    when(elem1.findElements(By.linkText("photo"))).thenReturn(elems);
    when(elem2.findElements(By.linkText("photo"))).thenReturn(elems5);

    ByChained by = new ByChained(By.linkText("cheese"), By.linkText("photo"));
    assertThat(by.findElements(driver)).containsExactly(elem5);
  }

  @Test
  void findElementsThreeBy_firstFindsOne_secondEmpty() {
    final AllDriver driver = mock();
    final WebElement elem1 = mock("webElement1");

    By by1 = By.name("by1");
    By by2 = By.name("by2");
    By by3 = By.name("by3");

    when(driver.findElements(by1)).thenReturn(Collections.singletonList(elem1));
    when(elem1.findElements(by2)).thenReturn(NO_ELEMENTS);

    ByChained by = new ByChained(by1, by2, by3);

    assertThat(by.findElements(driver)).isEmpty();
    verify(elem1, never()).findElements(by3);
  }

  @Test
  void findElementThreeBy_firstFindsTwo_secondEmpty() {
    final AllDriver driver = mock();
    final WebElement elem1 = mock("webElement1");
    final WebElement elem2 = mock("webElement2");

    By by1 = By.name("by1");
    By by2 = By.name("by2");
    By by3 = By.name("by3");

    when(driver.findElements(by1)).thenReturn(List.of(elem1, elem2));
    when(elem1.findElements(by2)).thenReturn(NO_ELEMENTS);
    when(elem2.findElements(by2)).thenReturn(NO_ELEMENTS);

    ByChained by = new ByChained(by1, by2, by3);

    assertThat(by.findElements(driver)).isEmpty();
    verify(elem1, never()).findElements(by3);
    verify(elem2, never()).findElements(by3);
  }

  @Test
  void testEquals() {
    assertThat(new ByChained(By.id("cheese"), By.name("photo")))
        .isEqualTo(new ByChained(By.id("cheese"), By.name("photo")));
  }

  @Test
  void testToString() {
    assertThat(new ByChained(By.id("cheese"), By.name("photo")))
        .hasToString("By.chained({By.id: cheese,By.name: photo})");
  }

  private interface AllDriver extends SearchContext {
    // Place holder
  }

  private interface AllElement extends WebElement {
    // Place holder
  }
}
