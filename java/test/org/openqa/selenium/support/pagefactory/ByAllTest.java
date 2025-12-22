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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

@Tag("UnitTests")
class ByAllTest {

  private final WebDriver driver = mock();

  @Test
  void findElementZeroBy() {
    ByAll by = new ByAll();
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> by.findElement(driver));
  }

  @Test
  void findElementsZeroBy() {
    ByAll by = new ByAll();
    assertThat(by.findElements(driver)).isEmpty();
  }

  @Test
  void findElementOneBy() {
    final WebElement elem1 = mock(WebElement.class, "webElement1");
    final WebElement elem2 = mock(WebElement.class, "webElement2");
    when(driver.findElements(By.name("cheese"))).thenReturn(List.of(elem1, elem2));

    ByAll by = new ByAll(By.name("cheese"));
    assertThat(by.findElement(driver)).isEqualTo(elem1);
  }

  @Test
  void findElementsOneBy() {
    final WebElement elem1 = mock(WebElement.class, "webElement1");
    final WebElement elem2 = mock(WebElement.class, "webElement2");

    when(driver.findElements(By.name("cheese"))).thenReturn(List.of(elem1, elem2));

    ByAll by = new ByAll(By.name("cheese"));
    assertThat(by.findElements(driver)).containsExactly(elem1, elem2);
  }

  @Test
  void findElementOneByEmpty() {
    when(driver.findElements(By.name("cheese"))).thenReturn(emptyList());

    ByAll by = new ByAll(By.name("cheese"));
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> by.findElement(driver));
  }

  @Test
  void findElementsOneByEmpty() {
    when(driver.findElements(By.name("cheese"))).thenReturn(emptyList());

    ByAll by = new ByAll(By.name("cheese"));
    assertThat(by.findElements(driver)).isEmpty();
  }

  @Test
  void findFourElementBy() {
    final WebElement elem1 = mock(WebElement.class, "webElement1");
    final WebElement elem2 = mock(WebElement.class, "webElement2");
    final WebElement elem3 = mock(WebElement.class, "webElement3");
    final WebElement elem4 = mock(WebElement.class, "webElement4");

    when(driver.findElements(By.name("cheese"))).thenReturn(List.of(elem1, elem2));
    when(driver.findElements(By.name("photo"))).thenReturn(List.of(elem3, elem4));

    ByAll by = new ByAll(By.name("cheese"), By.name("photo"));
    assertThat(by.findElement(driver)).isEqualTo(elem1);

    verify(driver, times(1)).findElements(any(By.class));
    verifyNoMoreInteractions(driver);
  }

  @Test
  void findFourElementByInReverseOrder() {
    final WebElement elem1 = mock(WebElement.class, "webElement1");
    final WebElement elem2 = mock(WebElement.class, "webElement2");
    final WebElement elem3 = mock(WebElement.class, "webElement3");
    final WebElement elem4 = mock(WebElement.class, "webElement4");

    when(driver.findElements(By.name("cheese"))).thenReturn(List.of(elem1, elem2));
    when(driver.findElements(By.name("photo"))).thenReturn(List.of(elem3, elem4));

    ByAll by = new ByAll(By.name("photo"), By.name("cheese"));
    assertThat(by.findElement(driver)).isEqualTo(elem3);

    verify(driver, times(1)).findElements(any(By.class));
    verifyNoMoreInteractions(driver);
  }

  @Test
  void findFourElementsByAny() {
    final WebElement elem1 = mock(WebElement.class, "webElement1");
    final WebElement elem2 = mock(WebElement.class, "webElement2");
    final WebElement elem3 = mock(WebElement.class, "webElement3");
    final WebElement elem4 = mock(WebElement.class, "webElement4");

    when(driver.findElements(By.name("cheese"))).thenReturn(List.of(elem1, elem2));
    when(driver.findElements(By.name("photo"))).thenReturn(List.of(elem3, elem4));

    ByAll by = new ByAll(By.name("cheese"), By.name("photo"));
    assertThat(by.findElements(driver)).containsExactly(elem1, elem2, elem3, elem4);

    verify(driver, times(2)).findElements(any(By.class));
    verifyNoMoreInteractions(driver);
  }

  @Test
  void findFourElementsByAnyInReverseOrder() {
    final WebElement elem1 = mock(WebElement.class, "webElement1");
    final WebElement elem2 = mock(WebElement.class, "webElement2");
    final WebElement elem3 = mock(WebElement.class, "webElement3");
    final WebElement elem4 = mock(WebElement.class, "webElement4");

    when(driver.findElements(By.name("cheese"))).thenReturn(List.of(elem1, elem2));
    when(driver.findElements(By.name("photo"))).thenReturn(List.of(elem3, elem4));

    ByAll by = new ByAll(By.name("photo"), By.name("cheese"));
    assertThat(by.findElements(driver)).containsExactly(elem3, elem4, elem1, elem2);

    verify(driver, times(2)).findElements(any(By.class));
    verifyNoMoreInteractions(driver);
  }

  @Test
  void testEquals() {
    assertThat(new ByAll(By.id("cheese"), By.name("photo")))
        .isEqualTo(new ByAll(By.id("cheese"), By.name("photo")));
  }
}
