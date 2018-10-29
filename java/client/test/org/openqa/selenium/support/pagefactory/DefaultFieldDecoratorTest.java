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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WrapsElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.interactions.Coordinates;
import org.openqa.selenium.interactions.HasInputDevices;
import org.openqa.selenium.interactions.Mouse;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByXPath;
import org.openqa.selenium.support.FindAll;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.FindBys;
import org.openqa.selenium.support.PageFactory;

import java.util.List;

public class DefaultFieldDecoratorTest {

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
  @FindAll({@FindBy(tagName = "div"), @FindBy(tagName = "a")})
  private List<WebElement> list5;

  @SuppressWarnings("unused")
  @FindBy(tagName = "div")
  private List<Object> list6;

  @SuppressWarnings("unused")
  @FindBys({@FindBy(tagName = "div"), @FindBy(tagName = "a")})
  private List<Object> list7;

  @SuppressWarnings("unused")
  @FindAll({@FindBy(tagName = "div"), @FindBy(tagName = "a")})
  private List<Object> list8;

  private FieldDecorator createDecoratorWithNullLocator() {
    return new DefaultFieldDecorator(field -> null);
  }

  private FieldDecorator createDecoratorWithDefaultLocator() {
    return new DefaultFieldDecorator(
        new DefaultElementLocatorFactory(null));
  }

  @Test
  public void decoratesWebElement() throws Exception {
    FieldDecorator decorator = createDecoratorWithDefaultLocator();
    assertThat(decorator.decorate(getClass().getClassLoader(),
                                  getClass().getDeclaredField("element1"))).isNotNull();
    assertThat(decorator.decorate(getClass().getClassLoader(),
                                  getClass().getDeclaredField("element2"))).isNotNull();
  }

  @Test
  public void decoratesAnnotatedWebElementList() throws Exception {
    FieldDecorator decorator = createDecoratorWithDefaultLocator();
    assertThat(decorator.decorate(getClass().getClassLoader(),
                                  getClass().getDeclaredField("list3"))).isNotNull();
    assertThat(decorator.decorate(getClass().getClassLoader(),
                                  getClass().getDeclaredField("list4"))).isNotNull();
    assertThat(decorator.decorate(getClass().getClassLoader(),
                                  getClass().getDeclaredField("list5"))).isNotNull();
  }

  @Test
  public void doesNotDecorateNonAnnotatedWebElementList() throws Exception {
    FieldDecorator decorator = createDecoratorWithDefaultLocator();
    assertThat(decorator.decorate(getClass().getClassLoader(),
                                  getClass().getDeclaredField("list1"))).isNull();
    assertThat(decorator.decorate(getClass().getClassLoader(),
                                  getClass().getDeclaredField("list2"))).isNull();
  }

  @Test
  public void doesNotDecorateNonWebElement() throws Exception {
    FieldDecorator decorator = createDecoratorWithDefaultLocator();
    assertThat(decorator.decorate(getClass().getClassLoader(),
                                  getClass().getDeclaredField("num"))).isNull();
  }

  @Test
  public void doesNotDecorateListOfSomethingElse() throws Exception {
    FieldDecorator decorator = createDecoratorWithDefaultLocator();
    assertThat(decorator.decorate(getClass().getClassLoader(),
                                  getClass().getDeclaredField("list6"))).isNull();
    assertThat(decorator.decorate(getClass().getClassLoader(),
                                  getClass().getDeclaredField("list7"))).isNull();
    assertThat(decorator.decorate(getClass().getClassLoader(),
                                  getClass().getDeclaredField("list8"))).isNull();
  }

  @Test
  public void doesNotDecorateNullLocator() throws Exception {
    FieldDecorator decorator = createDecoratorWithNullLocator();
    assertThat(decorator.decorate(getClass().getClassLoader(),
                                  getClass().getDeclaredField("element1"))).isNull();
    assertThat(decorator.decorate(getClass().getClassLoader(),
                                  getClass().getDeclaredField("element2"))).isNull();
    assertThat(decorator.decorate(getClass().getClassLoader(),
                                  getClass().getDeclaredField("list1"))).isNull();
    assertThat(decorator.decorate(getClass().getClassLoader(),
                                  getClass().getDeclaredField("list2"))).isNull();
    assertThat(decorator.decorate(getClass().getClassLoader(),
                                  getClass().getDeclaredField("num"))).isNull();
  }

  @Test
  public void testDecoratingProxyImplementsRequiredInterfaces() {
    final AllDriver driver = mock(AllDriver.class);
    final AllElement element = mock(AllElement.class);
    final Mouse mouse = mock(Mouse.class);

    when(driver.getMouse()).thenReturn(mouse);
    when(element.getCoordinates()).thenReturn(mock(Coordinates.class));
    when(driver.findElement(By.id("foo"))).thenReturn(element);

    Page page = new Page();
    PageFactory.initElements(driver, page);
    new Actions(driver).moveToElement(page.foo).build().perform();

    verify(driver).getKeyboard();
    verify(driver).getMouse();
    verify(element).getCoordinates();
    verify(mouse).mouseMove(any(Coordinates.class));
  }

  private static class Page {
    @FindBy(id = "foo")
    public WebElement foo;
  }

  private interface AllDriver extends WebDriver, FindsById, FindsByLinkText, FindsByName,
                                      FindsByXPath, HasInputDevices {
    // Place holder
  }

  private interface AllElement extends WebElement, WrapsElement,
                                       org.openqa.selenium.interactions.Locatable {
    // Place holder
  }
}
