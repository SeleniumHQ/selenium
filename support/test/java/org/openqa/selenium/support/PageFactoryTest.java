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

package org.openqa.selenium.support;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;
import static org.hamcrest.core.IsEqual.equalTo;
import static org.hamcrest.core.IsNull.notNullValue;
import static org.hamcrest.core.IsNull.nullValue;
import org.jmock.integration.junit3.MockObjectTestCase;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.pagefactory.FieldDecorator;

import java.lang.reflect.Field;

public class PageFactoryTest extends MockObjectTestCase {
    private WebDriver driver = null;

    public void testShouldProxyElementsInAnInstantiatedPage() {
        PublicPage page = new PublicPage();

        assertThat(page.q, is(nullValue()));

        PageFactory.initElements(driver, page);

        assertThat(page.q, is(notNullValue()));
    }

    public void testShouldInsertProxiesForPublicWebElements() {
        PublicPage page = PageFactory.initElements(driver, PublicPage.class);

        assertThat(page.q, is(notNullValue()));
    }

    public void testShouldProxyElementsFromParentClassesToo() {
        ChildPage page = new ChildPage();

        PageFactory.initElements(driver, page);

        assertThat(page.q, is(notNullValue()));
        assertThat(page.submit, is(notNullValue()));
    }

    public void testShouldProxyRenderedWebElementFields() {
      PublicPage page = PageFactory.initElements(driver, PublicPage.class);

      assertThat(page.rendered, is(notNullValue()));
    }

    public void testShouldProxyPrivateElements() {
        PrivatePage page = new PrivatePage();

        PageFactory.initElements(driver, page);

        assertThat(page.getField(), is(notNullValue()));
    }

    public void testShouldUseAConstructorThatTakesAWebDriverAsAnArgument() {
        driver = mock(WebDriver.class);

        ConstructedPage page = PageFactory.initElements(driver, ConstructedPage.class);

        assertThat(driver, equalTo(page.driver));
    }

    public void testShouldNotDecorateFieldsWhenTheFieldDecoratorReturnsNull() {
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

    public void testTriesToDecorateNonWebElements() {
      NonWebElementsPage page = new NonWebElementsPage();
      // Assign not-null values

      PageFactory.initElements(new FieldDecorator() {
        public Object decorate(ClassLoader loader, Field field) {
          return new Integer(5);
        }
      }, page);

      assertThat(page.num, equalTo(new Integer(5)));
    }

    public void testShouldComplainWhenMoreThanOneFindByAttributeIsSet() {
      GrottyPage page = new GrottyPage();

      try {
        PageFactory.initElements((WebDriver) null, page);
        fail("Should not have allowed page to be initialised");
      } catch (IllegalArgumentException e) {
        // this is expected
      }
    }

    public void testShouldComplainWhenMoreThanOneFindByShortFormAttributeIsSet() {
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

        public RenderedWebElement rendered;
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

        public WebElement getField() {
            return allMine;
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

    public static class NonWebElementsPage {
      public Integer num;
    }
}
