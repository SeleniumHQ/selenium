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

import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByXPath;

import java.util.ArrayList;
import java.util.List;

@RunWith(JUnit4.class)
public class ByChainedTest {

  @Test
  public void findElementZeroBy() {
    final AllDriver driver = mock(AllDriver.class);

    ByChained by = new ByChained();
    try {
      by.findElement(driver);
      fail("Expected NoSuchElementException!");
    } catch (NoSuchElementException e) {
      // Expected
    }
  }

  @Test
  public void findElementsZeroBy() {
    final AllDriver driver = mock(AllDriver.class);

    ByChained by = new ByChained();
    assertThat(by.findElements(driver),
        equalTo((List<WebElement>) new ArrayList<WebElement>()));
  }

  @Test
  public void findElementOneBy() {
    final AllDriver driver = mock(AllDriver.class);
    final WebElement elem1 = mock(WebElement.class, "webElement1");
    final WebElement elem2 = mock(WebElement.class, "webElement2");
    final List<WebElement> elems12 = new ArrayList<>();
    elems12.add(elem1);
    elems12.add(elem2);

    when(driver.findElementsByName("cheese")).thenReturn(elems12);

    ByChained by = new ByChained(By.name("cheese"));
    assertThat(by.findElement(driver), equalTo(elem1));
  }

  @Test
  public void findElementsOneBy() {
    final AllDriver driver = mock(AllDriver.class);
    final WebElement elem1 = mock(WebElement.class, "webElement1");
    final WebElement elem2 = mock(WebElement.class, "webElement2");
    final List<WebElement> elems12 = new ArrayList<>();
    elems12.add(elem1);
    elems12.add(elem2);

    when(driver.findElementsByName("cheese")).thenReturn(elems12);

    ByChained by = new ByChained(By.name("cheese"));
    assertThat(by.findElements(driver), equalTo(elems12));
  }

  @Test
  public void findElementOneByEmpty() {
    final AllDriver driver = mock(AllDriver.class);
    final List<WebElement> elems = new ArrayList<>();

    when(driver.findElementsByName("cheese")).thenReturn(elems);

    ByChained by = new ByChained(By.name("cheese"));
    try {
      by.findElement(driver);
      fail("Expected NoSuchElementException!");
    } catch (NoSuchElementException e) {
      // Expected
    }
  }

  @Test
  public void findElementsOneByEmpty() {
    final AllDriver driver = mock(AllDriver.class);
    final List<WebElement> elems = new ArrayList<>();

    when(driver.findElementsByName("cheese")).thenReturn(elems);

    ByChained by = new ByChained(By.name("cheese"));
    assertThat(by.findElements(driver), equalTo(elems));
  }

  @Test
  public void findElementTwoBy() {
    final AllDriver driver = mock(AllDriver.class);
    final WebElement elem1 = mock(AllElement.class, "webElement1");
    final WebElement elem2 = mock(AllElement.class, "webElement2");
    final WebElement elem3 = mock(AllElement.class, "webElement3");
    final WebElement elem4 = mock(AllElement.class, "webElement4");
    final WebElement elem5 = mock(AllElement.class, "webElement5");
    final List<WebElement> elems12 = new ArrayList<>();
    elems12.add(elem1);
    elems12.add(elem2);
    final List<WebElement> elems34 = new ArrayList<>();
    elems34.add(elem3);
    elems34.add(elem4);
    final List<WebElement> elems5 = new ArrayList<>();
    elems5.add(elem5);
    final List<WebElement> elems345 = new ArrayList<>();
    elems345.addAll(elems34);
    elems345.addAll(elems5);

    when(driver.findElementsByName("cheese")).thenReturn(elems12);
    when(elem1.findElements(By.name("photo"))).thenReturn(elems34);
    when(elem2.findElements(By.name("photo"))).thenReturn(elems5);

    ByChained by = new ByChained(By.name("cheese"), By.name("photo"));
    assertThat(by.findElement(driver), equalTo(elem3));
  }

  @Test
  public void findElementTwoByEmptyParent() {
    final AllDriver driver = mock(AllDriver.class);
    final WebElement elem1 = mock(WebElement.class, "webElement1");
    final WebElement elem2 = mock(AllElement.class, "webElement2");
    final WebElement elem3 = mock(AllElement.class, "webElement3");
    final WebElement elem4 = mock(AllElement.class, "webElement4");
    final WebElement elem5 = mock(AllElement.class, "webElement5");

    final List<WebElement> elems = new ArrayList<>();
    final List<WebElement> elems12 = new ArrayList<>();
    elems12.add(elem1);
    elems12.add(elem2);
    final List<WebElement> elems34 = new ArrayList<>();
    elems34.add(elem3);
    elems34.add(elem4);
    final List<WebElement> elems5 = new ArrayList<>();
    elems5.add(elem5);
    final List<WebElement> elems345 = new ArrayList<>();
    elems345.addAll(elems34);
    elems345.addAll(elems5);

    when(driver.findElementsByName("cheese")).thenReturn(elems);

    ByChained by = new ByChained(By.name("cheese"), By.name("photo"));
    try {
      by.findElement(driver);
      fail("Expected NoSuchElementException!");
    } catch (NoSuchElementException e) {
      // Expected
    }
  }

  @Test
  public void findElementsTwoByEmptyParent() {
    final AllDriver driver = mock(AllDriver.class);
    final WebElement elem1 = mock(WebElement.class, "webElement1");
    final WebElement elem2 = mock(AllElement.class, "webElement2");
    final WebElement elem3 = mock(AllElement.class, "webElement3");
    final WebElement elem4 = mock(AllElement.class, "webElement4");
    final WebElement elem5 = mock(AllElement.class, "webElement5");

    final List<WebElement> elems = new ArrayList<>();
    final List<WebElement> elems12 = new ArrayList<>();
    elems12.add(elem1);
    elems12.add(elem2);
    final List<WebElement> elems34 = new ArrayList<>();
    elems34.add(elem3);
    elems34.add(elem4);
    final List<WebElement> elems5 = new ArrayList<>();
    elems5.add(elem5);
    final List<WebElement> elems345 = new ArrayList<>();
    elems345.addAll(elems34);
    elems345.addAll(elems5);

    when(driver.findElementsByName("cheese")).thenReturn(elems);

    ByChained by = new ByChained(By.name("cheese"), By.name("photo"));
    assertThat(by.findElements(driver), equalTo(elems));
  }

  @Test
  public void findElementTwoByEmptyChild() {
    final AllDriver driver = mock(AllDriver.class);
    final WebElement elem1 = mock(WebElement.class, "webElement1");
    final WebElement elem2 = mock(AllElement.class, "webElement2");
    final WebElement elem3 = mock(AllElement.class, "webElement3");
    final WebElement elem4 = mock(AllElement.class, "webElement4");
    final WebElement elem5 = mock(AllElement.class, "webElement5");

    final List<WebElement> elems = new ArrayList<>();
    final List<WebElement> elems12 = new ArrayList<>();
    elems12.add(elem1);
    elems12.add(elem2);
    final List<WebElement> elems34 = new ArrayList<>();
    elems34.add(elem3);
    elems34.add(elem4);
    final List<WebElement> elems5 = new ArrayList<>();
    elems5.add(elem5);
    final List<WebElement> elems345 = new ArrayList<>();
    elems345.addAll(elems34);
    elems345.addAll(elems5);

    when(driver.findElementsByName("cheese")).thenReturn(elems12);
    when(elem1.findElements(By.name("photo"))).thenReturn(elems);
    when(elem2.findElements(By.name("photo"))).thenReturn(elems5);

    ByChained by = new ByChained(By.name("cheese"), By.name("photo"));
    assertThat(by.findElement(driver), equalTo(elem5));
  }

  @Test
  public void findElementsTwoByEmptyChild() {
    final AllDriver driver = mock(AllDriver.class);
    final WebElement elem1 = mock(WebElement.class, "webElement1");
    final WebElement elem2 = mock(AllElement.class, "webElement2");
    final WebElement elem3 = mock(AllElement.class, "webElement3");
    final WebElement elem4 = mock(AllElement.class, "webElement4");
    final WebElement elem5 = mock(AllElement.class, "webElement5");

    final List<WebElement> elems = new ArrayList<>();
    final List<WebElement> elems12 = new ArrayList<>();
    elems12.add(elem1);
    elems12.add(elem2);
    final List<WebElement> elems34 = new ArrayList<>();
    elems34.add(elem3);
    elems34.add(elem4);
    final List<WebElement> elems5 = new ArrayList<>();
    elems5.add(elem5);
    final List<WebElement> elems345 = new ArrayList<>();
    elems345.addAll(elems34);
    elems345.addAll(elems5);

    when(driver.findElementsByName("cheese")).thenReturn(elems12);
    when(elem1.findElements(By.name("photo"))).thenReturn(elems);
    when(elem2.findElements(By.name("photo"))).thenReturn(elems5);

    ByChained by = new ByChained(By.name("cheese"), By.name("photo"));
    assertThat(by.findElements(driver), equalTo(elems5));
  }

  @Test
  public void testEquals() {
    assertThat(new ByChained(By.id("cheese"), By.name("photo")),
        equalTo(new ByChained(By.id("cheese"), By.name("photo"))));
  }

  private interface AllDriver extends
      FindsById, FindsByLinkText, FindsByName, FindsByXPath, SearchContext {
    // Place holder
  }

  private interface AllElement extends WebElement {
    // Place holder
  }
}
