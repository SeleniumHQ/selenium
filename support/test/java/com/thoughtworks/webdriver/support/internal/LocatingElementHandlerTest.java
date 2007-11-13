package com.thoughtworks.webdriver.support.internal;

import junit.framework.TestCase;
import org.easymock.EasyMock;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;
import com.thoughtworks.webdriver.How;
import com.thoughtworks.webdriver.support.FindBy;
import com.thoughtworks.webdriver.support.PageFactory;
import com.thoughtworks.webdriver.support.CacheLookup;

import java.lang.reflect.Proxy;
import java.lang.reflect.Field;

public class LocatingElementHandlerTest extends TestCase {
    public void testShouldAlwaysLocateTheElementPerCall() throws NoSuchFieldException {
        WebDriver driver = EasyMock.createMock(WebDriver.class);
        WebElement element = EasyMock.createNiceMock(WebElement.class);

        EasyMock.expect(driver.selectElement("id=q")).andReturn(element);
        EasyMock.expect(driver.selectElement("id=q")).andReturn(element);

        EasyMock.replay(driver, element);

        Field q = Page.class.getDeclaredField("q");
        LocatingElementHandler handler = new LocatingElementHandler(driver, q);
        WebElement proxy = (WebElement) Proxy.newProxyInstance(getClass().getClassLoader(), new Class[]{WebElement.class}, handler);

        proxy.setValue("Fishy");
        proxy.submit();

        EasyMock.verify(driver);
    }

    public void testShouldUseAnnotationsToLookUpByAlternativeMechanisms() {
        WebDriver driver = EasyMock.createMock(WebDriver.class);
        WebElement element = EasyMock.createNiceMock(WebElement.class);

        EasyMock.expect(driver.selectElement("//input[@name='q']")).andReturn(element);

        EasyMock.replay(driver, element);
      
        Page page = PageFactory.proxyElements(driver, Page.class);
        page.doQuery("cheese");

        EasyMock.verify(driver);
    }
  
    public void testShouldNotRepeatedlyLookUpElementsMarkedAsNeverChanging() throws Exception {
      WebDriver driver = EasyMock.createMock(WebDriver.class);
      WebElement element = EasyMock.createNiceMock(WebElement.class);

      EasyMock.expect(driver.selectElement("id=staysTheSame")).andReturn(element);

      EasyMock.replay(driver, element);

      Field staysTheSame = Page.class.getDeclaredField("staysTheSame");
      LocatingElementHandler handler = new LocatingElementHandler(driver, staysTheSame);
      WebElement proxy = (WebElement) Proxy.newProxyInstance(getClass().getClassLoader(), new Class[]{WebElement.class}, handler);

      proxy.isEnabled();
      proxy.setValue("Cheese");

      EasyMock.verify(driver);
    }

    public static class Page {
        private WebElement q;

        @FindBy(how = How.XPATH, using = "//input[@name='q']")
        private WebElement query;

        @CacheLookup
        private WebElement staysTheSame;

        public void doQuery(String foo) {
            query.setValue(foo);
        }
    }
}
