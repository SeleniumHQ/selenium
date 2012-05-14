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

package org.openqa.selenium.support.pagefactory;

import static org.hamcrest.core.Is.is;
import static org.hamcrest.core.IsNull.notNullValue;
import static org.hamcrest.core.IsNull.nullValue;
import static org.junit.Assert.assertThat;

import org.openqa.selenium.By;
import org.openqa.selenium.HasInputDevices;
import org.openqa.selenium.testing.MockTestBase;
import org.openqa.selenium.Mouse;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.internal.WrapsElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.FindBys;
import org.openqa.selenium.support.PageFactory;

import org.jmock.Expectations;
import org.junit.Test;

import java.lang.reflect.Field;
import java.util.List;

/**
 */
public class DefaultFieldDecoratorTest extends MockTestBase {

  // Unusued fields are used by tests. Do not remove!
  @SuppressWarnings("unused") private WebElement element1;
  @SuppressWarnings("unused") private WebElement element2;
  @SuppressWarnings("unused") private List<WebElement> list1;
  @SuppressWarnings("unused") private List<Object> list2;
  @SuppressWarnings("unused") private Integer num;

  @SuppressWarnings("unused")
  @FindBy(tagName = "div")
  private List<WebElement> list3;

  @SuppressWarnings("unused")
  @FindBys({@FindBy(tagName = "div"), @FindBy(tagName = "a")})
  private List<WebElement> list4;

  @SuppressWarnings("unused")
  @FindBy(tagName = "div")
  private List<Object> list5;

  private FieldDecorator createDecoratorWithNullLocator() {
    return new DefaultFieldDecorator(new ElementLocatorFactory() {
      public ElementLocator createLocator(Field field) {
        return null;
      }
    });
  }

  private FieldDecorator createDecoratorWithDefaultLocator() {
    return new DefaultFieldDecorator(
        new DefaultElementLocatorFactory((WebDriver) null));
  }

  @Test
  public void decoratesWebElement() throws Exception {
    FieldDecorator decorator = createDecoratorWithDefaultLocator();
    assertThat(decorator.decorate(getClass().getClassLoader(),
        getClass().getDeclaredField("element1")),
        is(notNullValue()));
    assertThat(decorator.decorate(getClass().getClassLoader(),
        getClass().getDeclaredField("element2")),
        is(notNullValue()));
  }

  @Test
  public void decoratesAnnotatedWebElementList() throws Exception {
    FieldDecorator decorator = createDecoratorWithDefaultLocator();
    assertThat(decorator.decorate(getClass().getClassLoader(),
        getClass().getDeclaredField("list3")),
        is(notNullValue()));
    assertThat(decorator.decorate(getClass().getClassLoader(),
        getClass().getDeclaredField("list4")),
        is(notNullValue()));
  }

  @Test
  public void doesNotDecorateNonAnnotatedWebElementList() throws Exception {
    FieldDecorator decorator = createDecoratorWithDefaultLocator();
    assertThat(decorator.decorate(getClass().getClassLoader(),
        getClass().getDeclaredField("list1")),
        is(nullValue()));
    assertThat(decorator.decorate(getClass().getClassLoader(),
        getClass().getDeclaredField("list2")),
        is(nullValue()));
  }

  @Test
  public void doesNotDecorateNonWebElement() throws Exception {
    FieldDecorator decorator = createDecoratorWithDefaultLocator();
    assertThat(decorator.decorate(getClass().getClassLoader(),
        getClass().getDeclaredField("num")),
        is(nullValue()));
  }

  @Test
  public void doesNotDecorateListOfSomethingElse() throws Exception {
    FieldDecorator decorator = createDecoratorWithDefaultLocator();
    assertThat(decorator.decorate(getClass().getClassLoader(),
        getClass().getDeclaredField("list5")),
        is(nullValue()));
  }

  @Test
  public void doesNotDecorateNullLocator() throws Exception {
    FieldDecorator decorator = createDecoratorWithNullLocator();
    assertThat(decorator.decorate(getClass().getClassLoader(),
        getClass().getDeclaredField("element1")),
        is(nullValue()));
    assertThat(decorator.decorate(getClass().getClassLoader(),
        getClass().getDeclaredField("element2")),
        is(nullValue()));
    assertThat(decorator.decorate(getClass().getClassLoader(),
        getClass().getDeclaredField("list1")),
        is(nullValue()));
    assertThat(decorator.decorate(getClass().getClassLoader(),
        getClass().getDeclaredField("list2")),
        is(nullValue()));
    assertThat(decorator.decorate(getClass().getClassLoader(),
        getClass().getDeclaredField("num")),
        is(nullValue()));
  }

  @Test
  public void testDecoratingProxyImplementsRequiredInterfaces() throws Exception {
    final AllDriver driver = mock(AllDriver.class);
    final AllElement element = mock(AllElement.class);
    final Mouse mouse = mock(Mouse.class);
    checking(new Expectations() {{
      exactly(1).of(driver).getKeyboard();
      exactly(1).of(driver).getMouse();
      will(returnValue(mouse));
      exactly(1).of(driver).findElement(By.id("foo"));
      will(returnValue(element));
      exactly(1).of(element).getCoordinates();
      exactly(1).of(mouse).mouseMove(with(any(Coordinates.class)));
    }});
    Page page = new Page();
    PageFactory.initElements(driver, page);
    new Actions(driver).moveToElement(page.foo).build().perform();
  }

  private static class Page {
    @FindBy(id = "foo")
    public WebElement foo;
  }

  private interface AllDriver extends WebDriver, FindsById, FindsByLinkText, FindsByName,
      FindsByXPath, HasInputDevices {
    // Place holder
  }

  private interface AllElement extends WebElement, WrapsElement, Locatable {
    // Place holder
  }
}
