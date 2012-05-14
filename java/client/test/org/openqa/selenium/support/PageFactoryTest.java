/*
Copyright 2007-2009 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.support;

import static org.hamcrest.core.Is.is;
import static org.hamcrest.core.IsEqual.equalTo;
import static org.hamcrest.core.IsNull.notNullValue;
import static org.hamcrest.core.IsNull.nullValue;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.pagefactory.FieldDecorator;
import org.openqa.selenium.testing.MockTestBase;

import java.lang.reflect.Field;
import java.util.List;

public class PageFactoryTest extends MockTestBase {

  private WebDriver driver = null;

  @Test
  public void shouldProxyElementsInAnInstantiatedPage() {
    PublicPage page = new PublicPage();

    Assert.assertThat(page.q, is(nullValue()));
    assertThat(page.list, is(nullValue()));

    PageFactory.initElements(driver, page);

    assertThat(page.q, is(notNullValue()));
    assertThat(page.list, is(notNullValue()));
  }

  @Test
  public void shouldInsertProxiesForPublicWebElements() {
    PublicPage page = PageFactory.initElements(driver, PublicPage.class);

    assertThat(page.q, is(notNullValue()));
    assertThat(page.list, is(notNullValue()));
  }

  @Test
  public void shouldProxyElementsFromParentClassesToo() {
    ChildPage page = new ChildPage();

    PageFactory.initElements(driver, page);

    assertThat(page.q, is(notNullValue()));
    assertThat(page.list, is(notNullValue()));
    assertThat(page.submit, is(notNullValue()));
  }

  @Test
  public void shouldProxyRenderedWebElementFields() {
    PublicPage page = PageFactory.initElements(driver, PublicPage.class);

    assertThat(page.rendered, is(notNullValue()));
  }

  @Test
  public void shouldProxyPrivateElements() {
    PrivatePage page = new PrivatePage();

    PageFactory.initElements(driver, page);

    assertThat(page.getField(), is(notNullValue()));
    assertThat(page.getList(), is(notNullValue()));
  }

  @Test
  public void shouldUseAConstructorThatTakesAWebDriverAsAnArgument() {
    driver = mock(WebDriver.class);

    ConstructedPage page = PageFactory.initElements(driver, ConstructedPage.class);

    assertThat(driver, equalTo(page.driver));
  }

  @Test
  public void shouldNotDecorateFieldsWhenTheFieldDecoratorReturnsNull() {
    PublicPage page = new PublicPage();
    // Assign not-null values
    WebElement q = mock(WebElement.class);
    page.q = q;

    PageFactory.initElements(new FieldDecorator() {
      public Object decorate(ClassLoader loader, Field field) {
        return null;
      }
    }, page);

    assertThat(page.q, equalTo(q));
  }

  @Test
  public void triesToDecorateNonWebElements() {
    NonWebElementsPage page = new NonWebElementsPage();
    // Assign not-null values

    PageFactory.initElements(new FieldDecorator() {
      public Object decorate(ClassLoader loader, Field field) {
        return new Integer(5);
      }
    }, page);

    assertThat(page.num, equalTo(new Integer(5)));
  }

  @Test
  public void shouldNotDecorateListsOfWebElementsThatAreNotAnnotated() {
    UnmarkedListPage page = new UnmarkedListPage();

    PageFactory.initElements(driver, page);

    assertThat(page.elements, is(nullValue()));
  }

  @Test
  public void shouldNotDecorateListsThatAreTypedButNotWebElementLists() {
    UnmarkedListPage page = new UnmarkedListPage();

    PageFactory.initElements(driver, page);

    assertThat(page.objects, is(nullValue()));
  }
  
  @Test
  public void shouldNotDecorateUnTypedLists() {
    UnmarkedListPage page = new UnmarkedListPage();

    PageFactory.initElements(driver, page);

    assertThat(page.untyped, is(nullValue()));
  }

  @Test
  public void shouldComplainWhenMoreThanOneFindByAttributeIsSet() {
    GrottyPage page = new GrottyPage();

    try {
      PageFactory.initElements((WebDriver) null, page);
      fail("Should not have allowed page to be initialised");
    } catch (IllegalArgumentException e) {
      // this is expected
    }
  }

  @Test
  public void shouldComplainWhenMoreThanOneFindByShortFormAttributeIsSet() {
    GrottyPage2 page = new GrottyPage2();

    try {
      PageFactory.initElements((WebDriver) null, page);
      fail("Should not have allowed page to be initialised");
    } catch (IllegalArgumentException e) {
      // this is expected
    }
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
    private List untyped;  // This list deliberately left untyped
  }

  public static class NonWebElementsPage {

    public Integer num;
  }
}
