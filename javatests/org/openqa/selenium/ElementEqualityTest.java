package org.openqa.selenium;

import java.util.List;

import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.REMOTE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

@Ignore({IPHONE, SELENESE})
public class ElementEqualityTest extends AbstractDriverTestCase {
  public void testElementEqualityShouldWork() {
    driver.get(pages.simpleTestPage);
    
    WebElement body = driver.findElement(By.tagName("body"));
    WebElement xbody = driver.findElement(By.xpath("//body"));

    assertEquals(body, xbody);
  }

  public void testElementInequalityShouldWork() {
    driver.get(pages.simpleTestPage);
    
    List<WebElement> ps = driver.findElements(By.tagName("p"));

    assertFalse(ps.get(0).equals(ps.get(1)));
  }

  @Ignore(REMOTE)    
  public void testFindElementHashCodeShouldMatchEquality() {
    driver.get(pages.simpleTestPage);
    WebElement body = driver.findElement(By.tagName("body"));
    WebElement xbody = driver.findElement(By.xpath("//body"));

    assertEquals(body.hashCode(), xbody.hashCode());
  }

  @Ignore(REMOTE)
  public void testFindElementsHashCodeShouldMatchEquality() {
    driver.get(pages.simpleTestPage);
    List<WebElement> body = driver.findElements(By.tagName("body"));
    List<WebElement> xbody = driver.findElements(By.xpath("//body"));

    assertEquals(body.get(0).hashCode(), xbody.get(0).hashCode());
  }
}
