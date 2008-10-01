package org.openqa.selenium;

import java.util.Collection;

public class PartialLinkTextMatchTest extends AbstractDriverTestCase {

	public void testLinkWithFormattingTags() {
        driver.get(simpleTestPage);
        WebElement elem = driver.findElement(By.id("links"));
        
        WebElement res = 
            elem.findElement(By.partialLinkText("link with formatting tags"));
        assertNotNull(res);
        assertEquals("link with formatting tags", res.getText());
    }
	
	public void testLinkWithLeadingSpaces() {
        driver.get(simpleTestPage);
        WebElement elem = driver.findElement(By.id("links"));
        
        WebElement res = 
            elem.findElement(By.partialLinkText("link with leading space"));
        assertNotNull(res);
        assertEquals(" link with leading space", res.getText());
    }
	
	public void testLinkWithTrailingSpace() {
        driver.get(simpleTestPage);
        WebElement elem = driver.findElement(By.id("links"));
        
        WebElement res = 
            elem.findElement(By.partialLinkText("link with trailing space"));
        assertNotNull(res);
        assertEquals("link with trailing space", res.getText());
    }
	
	public void testFindMultipleElements() {
		driver.get(simpleTestPage);
        WebElement elem = driver.findElement(By.id("links"));
        
        Collection<WebElement> elements = 
            elem.findElements(By.partialLinkText("link"));
        assertNotNull(elements);
        assertEquals(3, elements.size());
	}
}
