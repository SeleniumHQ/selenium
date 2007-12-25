package com.thoughtworks.webdriver.support.internal;

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.createNiceMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;

import java.lang.reflect.Field;
import java.lang.reflect.Proxy;

import junit.framework.TestCase;

import com.thoughtworks.webdriver.By;
import com.thoughtworks.webdriver.How;
import com.thoughtworks.webdriver.RenderedWebElement;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;
import com.thoughtworks.webdriver.support.CacheLookup;
import com.thoughtworks.webdriver.support.FindBy;
import com.thoughtworks.webdriver.support.PageFactory;

public class LocatingElementHandlerTest extends TestCase {
    public void testShouldAlwaysLocateTheElementPerCall() throws NoSuchFieldException {
        WebDriver driver = createMock(WebDriver.class);
        WebElement element = createNiceMock(WebElement.class);

        By by = By.id("q");
        
        expect(driver.findElement(by)).andReturn(element);
        expect(driver.findElement(by)).andReturn(element);

        replay(driver, element);

        Field q = Page.class.getDeclaredField("q");
        LocatingElementHandler handler = new LocatingElementHandler(driver, q);
        WebElement proxy = (WebElement) Proxy.newProxyInstance(getClass().getClassLoader(), new Class[]{WebElement.class}, handler);

        proxy.setValue("Fishy");
        proxy.submit();

        verify(driver);
    }

    public void testShouldDelegateToARenderedWebElementIfNecessary() throws NoSuchFieldException {
      WebDriver driver = createMock(WebDriver.class);
      RenderedWebElement element = createNiceMock(RenderedWebElement.class);

      By by = By.id("rendered");
      
      expect(driver.findElement(by)).andReturn(element);

      replay(driver, element);

      Field staysTheSame = Page.class.getDeclaredField("rendered");
      LocatingElementHandler handler = new LocatingElementHandler(driver, staysTheSame);
      RenderedWebElement proxy = (RenderedWebElement) Proxy.newProxyInstance(getClass().getClassLoader(), new Class[]{RenderedWebElement.class}, handler);

      proxy.getLocation();

      verify(driver);
    }

    public void testShouldUseAnnotationsToLookUpByAlternativeMechanisms() {
        WebDriver driver = createMock(WebDriver.class);
        WebElement element = createNiceMock(WebElement.class);

        By by = By.xpath("//input[@name='q']");
        
        expect(driver.findElement(by)).andReturn(element);

        replay(driver, element);
      
        Page page = PageFactory.initElements(driver, Page.class);
        page.doQuery("cheese");

        verify(driver);
    }

    public void testShouldNotRepeatedlyLookUpElementsMarkedAsNeverChanging() throws Exception {
      WebDriver driver = createMock(WebDriver.class);
      WebElement element = createNiceMock(WebElement.class);

      By by = By.id("staysTheSame");
      
      expect(driver.findElement(by)).andReturn(element);

      replay(driver, element);

      Field staysTheSame = Page.class.getDeclaredField("staysTheSame");
      LocatingElementHandler handler = new LocatingElementHandler(driver, staysTheSame);
      WebElement proxy = (WebElement) Proxy.newProxyInstance(getClass().getClassLoader(), new Class[]{WebElement.class}, handler);

      proxy.isEnabled();
      proxy.setValue("Cheese");

      verify(driver);
    }

    public static class Page {
        @SuppressWarnings("unused")
		private WebElement q;

        @FindBy(how = How.XPATH, using = "//input[@name='q']")
        private WebElement query;

        @SuppressWarnings("unused")
		@CacheLookup
        private WebElement staysTheSame;

        @SuppressWarnings("unused")
		private RenderedWebElement rendered;

      public void doQuery(String foo) {
            query.setValue(foo);
        }
    }
}
