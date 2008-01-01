package com.thoughtworks.webdriver.support;

import static org.easymock.EasyMock.createNiceMock;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;
import static org.hamcrest.core.IsEqual.equalTo;
import static org.hamcrest.core.IsNull.notNullValue;
import static org.hamcrest.core.IsNull.nullValue;
import junit.framework.TestCase;

import com.thoughtworks.webdriver.RenderedWebElement;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;

public class PageFactoryTest extends TestCase {
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
        driver = createNiceMock(WebDriver.class);

        ConstructedPage page = PageFactory.initElements(driver, ConstructedPage.class);

        assertThat(driver, equalTo(page.driver));
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
