package org.openqa.selenium;

import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.REMOTE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

@Ignore(IPHONE)
public class ElementEqualityTest extends AbstractDriverTestCase {
  @Ignore(SELENESE)
  public void testElementEqualityShouldWork() {
    driver.get(pages.simpleTestPage);
    
    WebElement body = driver.findElement(By.tagName("body"));
    WebElement xbody = driver.findElement(By.xpath("//body"));

    assertEquals(body, xbody);
  }

  @Ignore(SELENESE)
  public void testElementInequalityShouldWork() {
    driver.get(pages.simpleTestPage);
    
    List<WebElement> ps = driver.findElements(By.tagName("p"));

    assertFalse(ps.get(0).equals(ps.get(1)));
  }

  @Ignore({IE, REMOTE, SELENESE})
  public void testFindElementHashCodeShouldMatchEquality() {
    driver.get(pages.simpleTestPage);
    WebElement body = driver.findElement(By.tagName("body"));
    WebElement xbody = driver.findElement(By.xpath("//body"));

    assertEquals(body.hashCode(), xbody.hashCode());
  }
  
  @Ignore({IE, REMOTE, SELENESE})
  public void testFindElementsHashCodeShouldMatchEquality() {
    driver.get(pages.simpleTestPage);
    List<WebElement> body = driver.findElements(By.tagName("body"));
    List<WebElement> xbody = driver.findElements(By.xpath("//body"));

    assertEquals(body.get(0).hashCode(), xbody.get(0).hashCode());
  }
}
