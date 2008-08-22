package org.openqa.selenium;

public class RenderedWebElementTest extends AbstractDriverTestCase {
	@JavascriptEnabled
	@Ignore("htmlunit, safari")
	public void testShouldPickUpStyleOfAnElement() {
		driver.get(javascriptPage);
		
		RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("green-parent"));
		String backgroundColour = element.getValueOfCssProperty("background-color");
		
		assertEquals("#008000", backgroundColour);
		
		element = (RenderedWebElement) driver.findElement(By.id("red-item"));
		backgroundColour = element.getValueOfCssProperty("background-color");
		
		assertEquals("#ff0000", backgroundColour);
	}

    @JavascriptEnabled
	@Ignore("htmlunit, safari")
    public void testShouldAllowInheritedStylesToBeUsed() {
		driver.get(javascriptPage);
		
		RenderedWebElement element = (RenderedWebElement) driver.findElement(By.id("green-item"));
		String backgroundColour = element.getValueOfCssProperty("background-color");
		
		assertEquals("transparent", backgroundColour);
	}
}
