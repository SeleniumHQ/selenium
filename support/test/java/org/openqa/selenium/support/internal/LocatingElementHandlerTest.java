package org.openqa.selenium.support.internal;

import java.lang.reflect.Field;
import java.lang.reflect.Proxy;

import org.jmock.Expectations;
import org.jmock.integration.junit3.MockObjectTestCase;

import org.openqa.selenium.By;
import org.openqa.selenium.How;
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.CacheLookup;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ByIdOrName;

public class LocatingElementHandlerTest extends MockObjectTestCase {
    public void testShouldAlwaysLocateTheElementPerCall() throws NoSuchFieldException {
        final WebDriver driver = mock(WebDriver.class);
        final WebElement element = mock(WebElement.class);

        final By by = new ByIdOrName("q");

        checking(new Expectations() {{
                exactly(2).of(driver).findElement(by); will(returnValue(element));
                one(element).sendKeys("Fishy");
                one(element).submit();
        }});

        Field q = Page.class.getDeclaredField("q");
        LocatingElementHandler handler = new LocatingElementHandler(driver, q);
        WebElement proxy = (WebElement) Proxy.newProxyInstance(getClass().getClassLoader(), new Class[]{WebElement.class}, handler);

        proxy.sendKeys("Fishy");
        proxy.submit();
    }

    public void testShouldDelegateToARenderedWebElementIfNecessary() throws NoSuchFieldException {
      final WebDriver driver = mock(WebDriver.class);
      final RenderedWebElement element = mock(RenderedWebElement.class);

      final By by = new ByIdOrName("rendered");

      checking(new Expectations() {{
            allowing(driver).findElement(by); will(returnValue(element));
            one(element).getLocation();
      }});

      Field staysTheSame = Page.class.getDeclaredField("rendered");
      LocatingElementHandler handler = new LocatingElementHandler(driver, staysTheSame);
      RenderedWebElement proxy = (RenderedWebElement) Proxy.newProxyInstance(getClass().getClassLoader(), new Class[]{RenderedWebElement.class}, handler);

      proxy.getLocation();
    }

    public void testShouldUseAnnotationsToLookUpByAlternativeMechanisms() {
        final WebDriver driver = mock(WebDriver.class);
        final WebElement element = mock(WebElement.class);

        final By by = By.xpath("//input[@name='q']");

        checking(new Expectations() {{
            allowing(driver).findElement(by); will(returnValue(element));
            one(element).clear();
            one(element).sendKeys("cheese");
        }});

        Page page = PageFactory.initElements(driver, Page.class);
        page.doQuery("cheese");
    }

    public void testShouldNotRepeatedlyLookUpElementsMarkedAsNeverChanging() throws Exception {
      final WebDriver driver = mock(WebDriver.class);
      final WebElement element = mock(WebElement.class);

      final By by = new ByIdOrName("staysTheSame");

      checking(new Expectations() {{
        allowing(driver).findElement(by); will(returnValue(element));
        one(element).isEnabled();
        one(element).sendKeys("Cheese");
      }});

      Field staysTheSame = Page.class.getDeclaredField("staysTheSame");
      LocatingElementHandler handler = new LocatingElementHandler(driver, staysTheSame);
      WebElement proxy = (WebElement) Proxy.newProxyInstance(getClass().getClassLoader(), new Class[]{WebElement.class}, handler);

      proxy.isEnabled();
      proxy.sendKeys("Cheese");
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
    	  	query.clear();
            query.sendKeys(foo);
        }
    }
}
