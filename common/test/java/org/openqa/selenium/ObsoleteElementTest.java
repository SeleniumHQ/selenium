package org.openqa.selenium;


public class ObsoleteElementTest extends AbstractDriverTestCase {
	@Ignore("htmlunit, firefox, safari")
    public void testOldPage() {
		driver.get(simpleTestPage);
		WebElement elem = driver.findElement(By.id("links"));
		driver.get(xhtmlTestPage);
		try {
		  elem.click();
		  fail();
		} catch (RuntimeException e) {
			// do nothing. this is what we expected.
		}
	}    
}
