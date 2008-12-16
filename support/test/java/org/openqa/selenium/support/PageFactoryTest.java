package org.openqa.selenium.support;

import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.pagefactory.ElementLocatorFactory;
import org.openqa.selenium.support.pagefactory.ElementLocator;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;
import static org.hamcrest.core.IsEqual.equalTo;
import static org.hamcrest.core.IsNull.notNullValue;
import static org.hamcrest.core.IsNull.nullValue;

import org.jmock.integration.junit3.MockObjectTestCase;

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

    public void testShouldNotDecorateFieldsWhenTheElementLocatorFactoryReturnsNull() {
      PublicPage page = new PublicPage();
      // Assign not-null values
      WebElement q = mock(WebElement.class);
      page.q = q;

      PageFactory.initElements(new ElementLocatorFactory() {
        public ElementLocator createLocator(Field field) {
          return null;
        }
      }, page);

      assertThat(page.q, equalTo(q));
    }

    public static class PublicPage {
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
}
