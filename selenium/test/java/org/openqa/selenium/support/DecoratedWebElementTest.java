package org.openqa.selenium.support;

import junit.framework.TestCase;

import org.openqa.selenium.By;
import org.openqa.selenium.StubDriver;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.remote.internal.WebElementToJsonConverter;

public class DecoratedWebElementTest extends TestCase {
  public void testDecoratedElementsShouldBeUnwrapped() {
    final RemoteWebElement element = new RemoteWebElement();
    element.setId("foo");

    WebDriver driver = new StubDriver() {
      @Override
      public WebElement findElement(By by) {
        return element;
      }
    };

    PublicPage page = new PublicPage();
    PageFactory.initElements(driver, page);

    Object seen = new WebElementToJsonConverter().apply(page.element);
    Object expected = new WebElementToJsonConverter().apply(element);
    
    assertEquals(expected, seen);
  }


  public class PublicPage {
    public WebElement element;
  }
}
