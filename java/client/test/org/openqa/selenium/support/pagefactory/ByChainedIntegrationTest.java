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

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.util.ArrayList;
import java.util.List;

public class ByChainedIntegrationTest extends JUnit4TestBase {

  @Before
  public void loadPage() {
    driver.get(pages.byChainedPage);
  }

  @Test
  public void findElementOneBy() {
    ByChained by = new ByChained(By.name("cheese"));
    assertThat(by.findElement(driver).getAttribute("id"), equalTo("elem1"));
  }

  @Test
  public void findElementsOneBy() {
    ByChained by = new ByChained(By.name("cheese"));

    List<WebElement> foundElements = by.findElements(driver);
    List<String> ids = new ArrayList<>();
    for (WebElement foundElement : foundElements) {
      ids.add(foundElement.getAttribute("id"));
    }
    assertThat(ids, contains("elem1", "elem2"));
  }

  @Test
  public void findElementOneByEmpty() {
    ByChained by = new ByChained(By.name("no-elements-with-this-name"));
    try {
      by.findElement(driver);
      fail("Expected NoSuchElementException!");
    } catch (NoSuchElementException e) {
      // Expected
    }
  }

  @Test
  public void findElementsOneByEmpty() {
    ByChained by = new ByChained(By.name("no-elements-with-this-name"));
    assertThat(by.findElements(driver), is(empty()));
  }

  @Test
  public void findElementTwoBy() {
    ByChained by = new ByChained(By.name("cheese"), By.name("photo"));
    assertThat(by.findElement(driver).getAttribute("id"), equalTo("elem3"));
  }

  @Test
  public void findElementTwoByEmptyParent() {
    ByChained by = new ByChained(By.name("no-elements-with-this-name"), By.name("photo"));
    try {
      by.findElement(driver);
      fail("Expected NoSuchElementException!");
    } catch (NoSuchElementException e) {
      // Expected
    }
  }

  @Test
  public void findElementsTwoByEmptyParent() {
    ByChained by = new ByChained(By.name("no-elements-with-this-name"), By.name("photo"));
    assertThat(by.findElements(driver), is(empty()));
  }

  @Test
  public void findElementTwoByEmptyChild() {
    ByChained by = new ByChained(By.name("cheese"), By.name("click"));
    assertThat(by.findElement(driver).getAttribute("id"), equalTo("elem5"));
  }

  @Test
  public void findElementsTwoByEmptyChild() {
    ByChained by = new ByChained(By.name("cheese"), By.name("click"));
    List<WebElement> foundElements = by.findElements(driver);
    assertThat(foundElements, hasSize(1));
    assertThat(foundElements.get(0).getAttribute("id"), equalTo("elem5"));
  }
}
