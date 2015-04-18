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
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByXPath;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@RunWith(JUnit4.class)
public class ByLazyOrTest {

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
    ByLazyOr by = new ByLazyOr();
    assertThat(by.findElements(driver), empty());
  }

  @Test
  public void findElementsOneBy() {
    when(driver.findElementsByName("cheese")).thenReturn(cheese1AndCheese2);

    ByLazyOr by = new ByLazyOr(By.name("cheese"));
    assertThat(by.findElements(driver), equalTo(cheese1AndCheese2));
  }

  @Test
  public void findElementsOneByEmpty() {
    when(driver.findElementsByName("cheese")).thenReturn(Collections.<WebElement>emptyList());

    ByLazyOr by = new ByLazyOr(By.name("cheese"));
    assertThat(by.findElements(driver), empty());
  }

  @Test
  public void findElementsTwoBy() {
    final WebElement photo1 = mock(AllElement.class, "photo1");
    final WebElement photo2 = mock(AllElement.class, "photo2");
    final List<WebElement> photo1AndPhoto2 = Arrays.asList(photo1, photo2);

    when(driver.findElementsByName("cheese")).thenReturn(cheese1AndCheese2);
    when(driver.findElements(By.name("photo"))).thenReturn(photo1AndPhoto2);

    ByLazyOr by = new ByLazyOr(By.name("cheese"), By.name("photo"));
    assertThat(by.findElements(driver), equalTo(cheese1AndCheese2));
  }

  @Test
  public void findElementsTwoByFirstEmpty() {
    when(driver.findElements(By.name("photo"))).thenReturn(Collections.<WebElement>emptyList());
    when(driver.findElementsByName("cheese")).thenReturn(cheese1AndCheese2);

    ByLazyOr by = new ByLazyOr(By.name("photo"), By.name("cheese"));
    assertThat(by.findElements(driver), equalTo(cheese1AndCheese2));
  }

  @Test
  public void testEquals() {
    assertThat(new ByLazyOr(By.id("cheese"), By.name("photo")),
        equalTo(new ByLazyOr(By.id("cheese"), By.name("photo"))));
  }

  private interface AllDriver extends
      FindsById, FindsByLinkText, FindsByName, FindsByXPath, SearchContext {
    // Place holder
  }

  private interface AllElement extends WebElement {
    // Place holder
  }
}
