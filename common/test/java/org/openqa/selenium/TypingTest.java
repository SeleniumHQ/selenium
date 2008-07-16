package org.openqa.selenium;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;

public class TypingTest extends AbstractDriverTestCase {
	@JavascriptEnabled
	public void testShouldFireKeyPressEvents() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("a");

		WebElement result = driver.findElement(By.id("result"));
		assertThat(result.getText(), containsString("press:"));
	}

	@JavascriptEnabled
	public void testShouldFireKeyDownEvents() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("I");

		WebElement result = driver.findElement(By.id("result"));
		assertThat(result.getText(), containsString("down:"));
	}

	@JavascriptEnabled
	public void testShouldFireKeyUpEvents() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("a");

		WebElement result = driver.findElement(By.id("result"));
		assertThat(result.getText(), containsString("up:"));
	}

	public void testShouldTypeLowerCaseLetters() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("abc def");

		assertThat(keyReporter.getValue(), is("abc def"));
	}

	public void testShouldBeAbleToTypeCapitalLetters() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("ABC DEF");

		assertThat(keyReporter.getValue(), is("ABC DEF"));
	}

  @Ignore("safari")
  public void testShouldBeAbleToTypeQuoteMarks() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("\"");

		assertThat(keyReporter.getValue(), is("\""));
	}

	public void testShouldBeAbleToMixUpperAndLowerCaseLetters() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("me@eXample.com");

		assertThat(keyReporter.getValue(), is("me@eXample.com"));
	}

	@Ignore("htmlunit, firefox, safari")
	public void testArrowKeysShouldNotBePrintable() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys(Keys.ARROW_LEFT);

		assertThat(keyReporter.getValue(), is(""));
	}

	@Ignore("htmlunit, firefox, safari")
	public void testShouldBeAbleToUseArrowKeys() {
		driver.get(javascriptPage);

		WebElement keyReporter = driver.findElement(By.id("keyReporter"));
		keyReporter.sendKeys("Tet", Keys.ARROW_LEFT, "s");

		assertThat(keyReporter.getValue(), is("Test"));
	}

	@JavascriptEnabled
        @Ignore("htmlunit")
        public void testWillSimulateAKeyUpWhenEnteringTextIntoInputElements() {
		driver.get(javascriptPage);
		WebElement element = driver.findElement(By.id("keyUp"));
		element.sendKeys("I like cheese");

		WebElement result = driver.findElement(By.id("result"));
		assertThat(result.getText(), equalTo("I like cheese"));
	}

	@JavascriptEnabled
	public void testWillSimulateAKeyDownWhenEnteringTextIntoInputElements() {
		driver.get(javascriptPage);
		WebElement element = driver.findElement(By.id("keyDown"));
		element.sendKeys("I like cheese");

		WebElement result = driver.findElement(By.id("result"));
		// Because the key down gets the result before the input element is
		// filled, we're a letter short here
		assertThat(result.getText(), equalTo("I like chees"));
	}

	@JavascriptEnabled
	public void testWillSimulateAKeyPressWhenEnteringTextIntoInputElements() {
		driver.get(javascriptPage);
		WebElement element = driver.findElement(By.id("keyPress"));
		element.sendKeys("I like cheese");

		WebElement result = driver.findElement(By.id("result"));
		// Because the key down gets the result before the input element is
		// filled, we're a letter short here
		assertThat(result.getText(), equalTo("I like chees"));
	}

	@JavascriptEnabled
        @Ignore("htmlunit")
        public void testWillSimulateAKeyUpWhenEnteringTextIntoTextAreas() {
		driver.get(javascriptPage);
		WebElement element = driver.findElement(By.id("keyUpArea"));
		element.sendKeys("I like cheese");

		WebElement result = driver.findElement(By.id("result"));
		assertThat(result.getText(), equalTo("I like cheese"));
	}

	@JavascriptEnabled
	public void testWillSimulateAKeyDownWhenEnteringTextIntoTextAreas() {
		driver.get(javascriptPage);
		WebElement element = driver.findElement(By.id("keyDownArea"));
		element.sendKeys("I like cheese");

		WebElement result = driver.findElement(By.id("result"));
		// Because the key down gets the result before the input element is
		// filled, we're a letter short here
		assertThat(result.getText(), equalTo("I like chees"));
	}

	@JavascriptEnabled
	public void testWillSimulateAKeyPressWhenEnteringTextIntoTextAreas() {
		driver.get(javascriptPage);
		WebElement element = driver.findElement(By.id("keyPressArea"));
		element.sendKeys("I like cheese");

		WebElement result = driver.findElement(By.id("result"));
		// Because the key down gets the result before the input element is
		// filled, we're a letter short here
		assertThat(result.getText(), equalTo("I like chees"));
	}

	@JavascriptEnabled
	@Ignore(value = "firefox, safari, htmlunit", reason = "Not implemeted in safari. Firefox: only passes if firefox window has focus")
	public void testShouldFireFocusKeyBlurAndChangeEventsInTheRightOrder() {
		driver.get(javascriptPage);

		driver.findElement(By.id("theworks")).sendKeys("a");
		String result = driver.findElement(By.id("result")).getText();

		assertThat(result.trim(),
				equalTo("focus keydown keypress keyup blur change"));
	}

	@JavascriptEnabled
	@Ignore(value = "firefox, safari, htmlunit", reason = "IE specific test")
	public void testShouldFireFocusKeyBlurAndChangeEventsInTheRightOrderOnIe() {
		driver.get(javascriptPage);

		driver.findElement(By.id("theworks")).sendKeys("a");
		String result = driver.findElement(By.id("result")).getText();

		assertThat(result.trim(),
				equalTo("focus keydown keypress keyup change blur"));
	}

	@JavascriptEnabled
	@Ignore("ie, safari, htmlunit")
	public void testShouldReportKeyCodeOfArrowKeys() {
		driver.get(javascriptPage);

		WebElement result = driver.findElement(By.id("result"));
		WebElement element = driver.findElement(By.id("keyReporter"));
		element.sendKeys(Keys.ARROW_DOWN);
		assertThat(result.getText().trim(), is("down: 40 press: 40 up: 40"));

		element.sendKeys(Keys.ARROW_UP);
		assertThat(result.getText().trim(), is("down: 38 press: 38 up: 38"));

		element.sendKeys(Keys.ARROW_LEFT);
		assertThat(result.getText().trim(), is("down: 37 press: 37 up: 37"));

		element.sendKeys(Keys.ARROW_RIGHT);
		assertThat(result.getText().trim(), is("down: 39 press: 39 up: 39"));
	}

	@JavascriptEnabled
	@Ignore("firefox, safari, htmlunit")
	public void testShouldReportKeyCodeOfArrowKeysWhenPressEventNotFiredByBrowser() {
		driver.get(javascriptPage);

		WebElement result = driver.findElement(By.id("result"));
		WebElement element = driver.findElement(By.id("keyReporter"));
		element.sendKeys(Keys.ARROW_DOWN);
		assertThat(result.getText().trim(), is("down: 40 up: 40"));

		element.sendKeys(Keys.ARROW_UP);
		assertThat(result.getText().trim(), is("down: 38 up: 38"));

		element.sendKeys(Keys.ARROW_LEFT);
		assertThat(result.getText().trim(), is("down: 37 up: 37"));

		element.sendKeys(Keys.ARROW_RIGHT);
		assertThat(result.getText().trim(), is("down: 39 up: 39"));
	}
}
