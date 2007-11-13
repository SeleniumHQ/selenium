package com.thoughtworks.webdriver.support;

import junit.framework.TestCase;
import com.thoughtworks.webdriver.WebElement;
import com.thoughtworks.webdriver.WebDriver;
import org.easymock.EasyMock;

public class PageFactoryTest extends TestCase {
    private WebDriver driver = null;

    public void testShouldProxyElementsInAnInstantiatedPage() {
        PublicPage page = new PublicPage();

        assertNull(page.q);

        PageFactory.initElements(driver, page);

        assertTrue(page.q instanceof WebElement);
    }

    public void testShouldInsertProxiesForPublicWebElements() {
        PublicPage page = PageFactory.initElements(driver, PublicPage.class);

        assertTrue(page.q instanceof WebElement);
    }

    public void testShouldProxyElementsFromParentClassesToo() {
        ChildPage page = new ChildPage();

        PageFactory.initElements(driver, page);

        assertTrue(page.q instanceof WebElement);
        assertTrue(page.submit instanceof WebElement);
    }

    public void testShouldProxyPrivateElements() {
        PrivatePage page = new PrivatePage();

        PageFactory.initElements(driver, page);

        assertNotNull(page.getField());
    }

    public void testShouldUseAConstructorThatTakesAWebDriverAsAnArgument() {
        driver = EasyMock.createNiceMock(WebDriver.class);

        ConstructedPage page = PageFactory.initElements(driver, ConstructedPage.class);

        assertEquals(driver, page.driver);
    }

    public static class PublicPage {
        public WebElement q;
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
