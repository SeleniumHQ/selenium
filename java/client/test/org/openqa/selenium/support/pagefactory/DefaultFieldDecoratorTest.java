/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import org.junit.Test;
import org.openqa.selenium.MockTestBase;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.lang.reflect.Field;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;
import static org.hamcrest.core.IsNull.notNullValue;
import static org.hamcrest.core.IsNull.nullValue;

/**
 */
public class DefaultFieldDecoratorTest extends MockTestBase {

  // Unusued fields are used by tests. Do not remove!
  private WebElement element1;
  private WebElement element2;
  private Integer num;

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
        getClass().getDeclaredField("element1")),
        is(notNullValue()));
  }

  @Test
  public void doesNotDecorateNonWebElement() throws Exception {
    FieldDecorator decorator = createDecoratorWithDefaultLocator();
    assertThat(decorator.decorate(getClass().getClassLoader(),
        getClass().getDeclaredField("num")),
        is(nullValue()));
  }

  @Test
  public void doesNotDecorateNullLocator() throws Exception {
    FieldDecorator decorator = createDecoratorWithNullLocator();
    assertThat(decorator.decorate(getClass().getClassLoader(),
        getClass().getDeclaredField("element1")),
        is(nullValue()));
    assertThat(decorator.decorate(getClass().getClassLoader(),
        getClass().getDeclaredField("element1")),
        is(nullValue()));
    assertThat(decorator.decorate(getClass().getClassLoader(),
        getClass().getDeclaredField("num")),
        is(nullValue()));
  }
}
