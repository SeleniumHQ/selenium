package org.openqa.selenium;

public class PartialLinkTextMatchTest extends AbstractDriverTestCase {

	public void xtestLinkWithFormattingTags() {
        driver.get(simpleTestPage);
        WebElement elem = driver.findElement(By.id("links"));
        
        WebElement res = 
            elem.findElement(By.partialLinkText("link with formatting tags"));
        assertNotNull(res);
        assertEquals("link with formatting tags", res.getText());
    }
	
	public void xtestLinkWithLeadingSpaces() {
        driver.get(simpleTestPage);
        WebElement elem = driver.findElement(By.id("links"));
        
        WebElement res = 
            elem.findElement(By.partialLinkText("link with leading space"));
        assertNotNull(res);
        assertEquals(" link with leading space", res.getText());
    }
	
	public void xtestLinkWithTrailingSpace() {
        driver.get(simpleTestPage);
        WebElement elem = driver.findElement(By.id("links"));
        
        WebElement res = 
            elem.findElement(By.partialLinkText("link with trailing space"));
        assertNotNull(res);
        assertEquals("link with trailing space", res.getText());
    }

  public void testEmpty() {
    // TODO: These tests need to pass on Firefox and may need to be @Ignore("ie") too
  }

}
