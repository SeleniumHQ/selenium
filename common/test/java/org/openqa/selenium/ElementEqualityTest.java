package org.openqa.selenium;

import java.util.List;

import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.REMOTE;

public class ElementEqualityTest extends AbstractDriverTestCase {
  public void testElementEqualityShouldWork() {
    driver.get(simpleTestPage);
    
    WebElement body = driver.findElement(By.tagName("body"));
    WebElement xbody = driver.findElement(By.xpath("//body"));
    
    assertEquals(body, xbody);
  }

  @Ignore({IE, REMOTE, HTMLUNIT})
  public void testFindElementHashCodeShouldMatchEquality() {
    driver.get(simpleTestPage);
    WebElement body = driver.findElement(By.tagName("body"));
    WebElement xbody = driver.findElement(By.xpath("//body"));
    
    assertEquals(body.hashCode(), xbody.hashCode());
  }
  
  @Ignore({FIREFOX, IE, REMOTE, HTMLUNIT})
  public void testFindElementsHashCodeShouldMatchEquality() {
    driver.get(simpleTestPage);
    List<WebElement> body = driver.findElements(By.tagName("body"));
    List<WebElement> xbody = driver.findElements(By.xpath("//body"));
    
    assertEquals(body.get(0).hashCode(), xbody.get(0).hashCode());
  }
}
