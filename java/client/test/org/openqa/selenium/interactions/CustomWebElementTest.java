package org.openqa.selenium.interactions;

import org.junit.Test;
import org.openqa.selenium.*;
import org.openqa.selenium.internal.WrapsElement;
import org.openqa.selenium.testing.JUnit4TestBase;

import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.WaitingConditions.elementValueToEqual;

public class CustomWebElementTest  extends JUnit4TestBase {

	@Test
	public void canMoveMouse() {
		driver.get(pages.javascriptPage);

		WebElement toClick = driver.findElement(By.id("clickField"));
		WebElement customToClick = new TestingCustomWebElement(toClick);

		Action contextClick = getBuilder(driver).moveToElement(customToClick).click().build();

		contextClick.perform();

		wait.until(elementValueToEqual(customToClick, "Clicked"));

		assertEquals("Value should change to Clicked.", "Clicked",
				customToClick.getAttribute("value"));

		driver.quit();
	}

	private Actions getBuilder(WebDriver driver) {
		return new Actions(driver);
	}

	class TestingCustomWebElement implements WebElement, WrapsElement {
		private final WebElement realWebElement;

		TestingCustomWebElement(WebElement element) {
			this.realWebElement = element;
		}

		public WebElement getWrappedElement() {
			return realWebElement;
		}

		public void click() {
			realWebElement.click();
		}

		public void submit() {
			realWebElement.submit();
		}

		public void sendKeys(CharSequence... keysToSend) {
			realWebElement.sendKeys(keysToSend);
		}

		public void clear() {
			realWebElement.clear();
		}

		public String getTagName() {
			return realWebElement.getTagName();
		}

		public String getAttribute(String name) {
			return realWebElement.getAttribute(name);
		}

		public boolean isSelected() {
			return realWebElement.isSelected();
		}

		public boolean isEnabled() {
			return realWebElement.isEnabled();
		}

		public String getText() {
			return realWebElement.getText();
		}

		public java.util.List<WebElement> findElements(By by) {
			return realWebElement.findElements(by);
		}

		public WebElement findElement(By by) {
			return realWebElement.findElement(by);
		}

		public boolean isDisplayed() {
			return realWebElement.isDisplayed();
		}

		public org.openqa.selenium.Point getLocation() {
			return realWebElement.getLocation();
		}

		public org.openqa.selenium.Dimension getSize() {
			return realWebElement.getSize();
		}

		public org.openqa.selenium.Rectangle getRect() {
			return realWebElement.getRect();
		}

		public String getCssValue(String propertyName) {
			return realWebElement.getCssValue(propertyName);
		}

		public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
			return realWebElement.getScreenshotAs(target);
		}

	}
}
