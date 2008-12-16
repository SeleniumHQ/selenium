package org.openqa.selenium.support.pagefactory;

import org.jmock.Expectations;
import org.jmock.integration.junit3.MockObjectTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ByIdOrName;

import java.lang.reflect.Field;

public class AjaxElementLocatorTest extends MockObjectTestCase {
  protected ElementLocator newLocator(WebDriver driver, Field field) {
    return new MonkeyedAjaxElementLocator(driver, field, 10);
  }
  
  public void testShouldContinueAttemptingToFindElement() throws Exception {
    Field f = Page.class.getDeclaredField("first");
    final WebDriver driver = mock(WebDriver.class);
    final By by = new ByIdOrName("first");
    final WebElement element = mock(WebElement.class);
    
    checking(new Expectations() {{
      exactly(1).of(driver).findElement(by); will(throwException(new NoSuchElementException("bar")));
      exactly(1).of(driver).findElement(by); will(returnValue(element));
    }});
    
    ElementLocator locator = newLocator(driver, f);
    WebElement returnedElement = locator.findElement();
    
    assertEquals(element, returnedElement);
  }

  public void testShouldThrowNoSuchElementExceptionIfElementTakesTooLongToAppear() throws Exception {
    Field f = Page.class.getDeclaredField("first");
    final WebDriver driver = mock(WebDriver.class);
    final By by = new ByIdOrName("first");
    
    checking(new Expectations() {{
      exactly(2).of(driver).findElement(by); will(throwException(new NoSuchElementException("bar")));
    }});
    
    ElementLocator locator = new MonkeyedAjaxElementLocator(driver, f, 2);
    
    try {
      locator.findElement();
      fail("Should not have located the element");
    } catch (NoSuchElementException e) {
      // This is expected
    }
  }

  public void testShouldAlwaysDoAtLeastOneAttemptAtFindingTheElement() throws Exception {
    Field f = Page.class.getDeclaredField("first");
    final WebDriver driver = mock(WebDriver.class);
    final By by = new ByIdOrName("first");
    
    checking(new Expectations() {{
      exactly(1).of(driver).findElement(by); will(throwException(new NoSuchElementException("bar")));
    }});
    
    ElementLocator locator = new MonkeyedAjaxElementLocator(driver, f, 0);
    
    try {
      locator.findElement();
      fail("Should not have located the element");
    } catch (NoSuchElementException e) {
      // This is expected
    }
  }
  
  private static class MonkeyedAjaxElementLocator extends AjaxElementLocator {
    private int count;
    
    public MonkeyedAjaxElementLocator(WebDriver driver, Field field, int timeOutInSeconds) {
      super(driver, field, timeOutInSeconds);
    }
    
    @Override
    protected long now() {
      return ++count * 1000;
    }
    
    @Override
    protected void sleep() {
      // Does nothing 
    }
  }
  
  private static class Page {
    @SuppressWarnings("unused")
    private WebElement first;
  }
}
