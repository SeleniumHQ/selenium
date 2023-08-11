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

package org.openqa.selenium.support;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.TickingClock;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;

@Tag("UnitTests")
class PageFactoryTest {

  private SearchContext searchContext;

  @Test
  void shouldProxyElementsInAnInstantiatedPage() {
    PublicPage page = new PublicPage();

    assertThat(page.q).isNull();
    assertThat(page.list).isNull();

    PageFactory.initElements(searchContext, page);

    assertThat(page.q).isNotNull();
    assertThat(page.list).isNotNull();
  }

  @Test
  void shouldInsertProxiesForPublicWebElements() {
    PublicPage page = PageFactory.initElements(searchContext, PublicPage.class);

    assertThat(page.q).isNotNull();
    assertThat(page.list).isNotNull();
  }

  @Test
  void shouldProxyElementsFromParentClassesToo() {
    ChildPage page = new ChildPage();

    PageFactory.initElements(searchContext, page);

    assertThat(page.q).isNotNull();
    assertThat(page.list).isNotNull();
    assertThat(page.submit).isNotNull();
  }

  @Test
  void shouldProxyRenderedWebElementFields() {
    PublicPage page = PageFactory.initElements(searchContext, PublicPage.class);

    assertThat(page.rendered).isNotNull();
  }

  @Test
  void shouldProxyPrivateElements() {
    PrivatePage page = new PrivatePage();

    PageFactory.initElements(searchContext, page);

    assertThat(page.getField()).isNotNull();
    assertThat(page.getList()).isNotNull();
  }

  @Test
  void shouldUseAConstructorThatTakesAWebDriverAsAnArgument() {
    WebDriver driver = mock(WebDriver.class);

    ConstructedPage page = PageFactory.initElements(driver, ConstructedPage.class);

    assertThat(driver).isEqualTo(page.driver);
  }

  @Test
  void shouldNotDecorateFieldsWhenTheFieldDecoratorReturnsNull() {
    PublicPage page = new PublicPage();
    // Assign not-null values
    WebElement q = mock(WebElement.class);
    page.q = q;

    PageFactory.initElements((loader, field) -> null, page);

    assertThat(page.q).isEqualTo(q);
  }

  @Test
  void triesToDecorateNonWebElements() {
    NonWebElementsPage page = new NonWebElementsPage();
    // Assign not-null values

    PageFactory.initElements((loader, field) -> 5, page);

    assertThat(page.num).isEqualTo(5);
  }

  @Test
  void shouldNotDecorateListsOfWebElementsThatAreNotAnnotated() {
    UnmarkedListPage page = new UnmarkedListPage();

    PageFactory.initElements(searchContext, page);

    assertThat(page.elements).isNull();
  }

  @Test
  void shouldNotDecorateListsThatAreTypedButNotWebElementLists() {
    UnmarkedListPage page = new UnmarkedListPage();

    PageFactory.initElements(searchContext, page);

    assertThat(page.objects).isNull();
  }

  @Test
  void shouldNotDecorateUnTypedLists() {
    UnmarkedListPage page = new UnmarkedListPage();

    PageFactory.initElements(searchContext, page);

    assertThat(page.untyped).isNull();
  }

  @Test
  void shouldComplainWhenMoreThanOneFindByAttributeIsSet() {
    GrottyPage page = new GrottyPage();

    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> PageFactory.initElements((WebDriver) null, page));
  }

  @Test
  void shouldComplainWhenMoreThanOneFindByShortFormAttributeIsSet() {
    GrottyPage2 page = new GrottyPage2();

    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> PageFactory.initElements((WebDriver) null, page));
  }

  @Test
  void shouldNotThrowANoSuchElementExceptionWhenUsedWithAFluentWait() {
    WebDriver driver = mock(WebDriver.class);
    when(driver.findElement(ArgumentMatchers.any()))
        .thenThrow(new NoSuchElementException("because"));

    TickingClock clock = new TickingClock();
    Wait<WebDriver> wait =
        new WebDriverWait(driver, Duration.ofSeconds(1), Duration.ofMillis(1001), clock, clock);

    PublicPage page = new PublicPage();
    PageFactory.initElements(driver, page);
    WebElement element = page.q;

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(ExpectedConditions.visibilityOf(element)));
  }

  public static class PublicPage {

    @FindBy(name = "q")
    public WebElement q;

    @FindBy(name = "q")
    public List<WebElement> list;

    public WebElement rendered;
  }

  public static class ChildPage extends PublicPage {

    public WebElement submit;
  }

  public static class ConstructedPage {

    public WebDriver driver;

    public ConstructedPage(WebDriver driver) {
      this.driver = driver;
    }
  }

  public static class PrivatePage {

    private WebElement allMine = null;

    @FindBy(name = "q")
    private List<WebElement> list = null;

    public WebElement getField() {
      return allMine;
    }

    public List<WebElement> getList() {
      return list;
    }
  }

  public static class GrottyPage {

    @FindBy(how = How.XPATH, using = "//body", id = "cheese")
    private WebElement one;
  }

  public static class GrottyPage2 {

    @FindBy(xpath = "//body", id = "cheese")
    private WebElement two;
  }

  public static class UnmarkedListPage {
    private List<WebElement> elements;
    private List<Object> objects;

    @SuppressWarnings("rawtypes")
    private List untyped; // This list deliberately left untyped
  }

  public static class NonWebElementsPage {

    public Integer num;
  }
}
