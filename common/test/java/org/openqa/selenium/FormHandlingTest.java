package org.openqa.selenium;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.is;

import java.io.File;

public class FormHandlingTest extends AbstractDriverTestCase {
	public void testShouldClickOnSubmitInputElements() {
		driver.get(formPage);
		driver.findElement(By.id("submitButton")).click();
		assertThat(driver.getTitle(), equalTo("We Arrive Here"));
	}

	public void testClickingOnUnclickableElementsDoesNothing() {
		driver.get(formPage);
		try {
			driver.findElement(By.xpath("//title")).click();
		} catch (Exception e) {
			fail("Clicking on the unclickable should be a no-op");
		}
	}

	public void testShouldBeAbleToClickImageButtons() {
		driver.get(formPage);
		driver.findElement(By.id("imageButton")).click();
		assertThat(driver.getTitle(), equalTo("We Arrive Here"));
	}

	@Ignore(value = "safari", reason = "Test fails")
	public void testShouldBeAbleToSubmitForms() {
		driver.get(formPage);
		driver.findElement(By.name("login")).submit();
		assertThat(driver.getTitle(), equalTo("We Arrive Here"));
	}

	@Ignore(value = "safari", reason = "Test fails")
	public void testShouldSubmitAFormWhenAnyInputElementWithinThatFormIsSubmitted() {
		driver.get(formPage);
		driver.findElement(By.id("checky")).submit();
		assertThat(driver.getTitle(), equalTo("We Arrive Here"));
	}

	@Ignore(value = "safari", reason = "Test fails")
	public void testShouldSubmitAFormWhenAnyElementWihinThatFormIsSubmitted() {
		driver.get(formPage);
		driver.findElement(By.xpath("//form/p")).submit();
		assertThat(driver.getTitle(), equalTo("We Arrive Here"));
	}

	public void testShouldNotBeAbleToSubmitAFormThatDoesNotExist() {
		driver.get(formPage);

		try {
			driver.findElement(By.name("there is no spoon"))
					.submit();
			fail("Should not have succeeded");
		} catch (NoSuchElementException e) {
			// this is expected
		}
	}

	public void testShouldBeAbleToEnterTextIntoATextAreaBySettingItsValue() {
		driver.get(javascriptPage);
		WebElement textarea = driver.findElement(By
				.id("keyUpArea"));
		String cheesey = "Brie and cheddar";
		textarea.sendKeys(cheesey);
		assertThat(textarea.getValue(), equalTo(cheesey));
	}

	public void testShouldEnterDataIntoFormFields() {
		driver.get(xhtmlTestPage);
		WebElement element = driver.findElement(By
				.xpath("//form[@name='someForm']/input[@id='username']"));
		String originalValue = element.getValue();
		assertThat(originalValue, equalTo("change"));
		
		element.clear();
		element.sendKeys("some text");

		element = driver.findElement(By
				.xpath("//form[@name='someForm']/input[@id='username']"));
		String newFormValue = element.getValue();
		assertThat(newFormValue, equalTo("some text"));
	}

	@Ignore("safari")
	public void testShouldBeAbleToSelectACheckBox() {
		driver.get(formPage);
		WebElement checkbox = driver.findElement(By
				.id("checky"));
		assertThat(checkbox.isSelected(), is(false));
		checkbox.setSelected();
		assertThat(checkbox.isSelected(), is(true));
		checkbox.setSelected();
		assertThat(checkbox.isSelected(), is(true));
	}

	@Ignore("safari")
	public void testShouldToggleTheCheckedStateOfACheckbox() {
		driver.get(formPage);
		WebElement checkbox = driver.findElement(By
				.id("checky"));
		assertThat(checkbox.isSelected(), is(false));
		checkbox.toggle();
		assertThat(checkbox.isSelected(), is(true));
		checkbox.toggle();
		assertThat(checkbox.isSelected(), is(false));
	}

	@Ignore("safari")
	public void testTogglingACheckboxShouldReturnItsCurrentState() {
		driver.get(formPage);
		WebElement checkbox = driver.findElement(By
				.id("checky"));
		assertThat(checkbox.isSelected(), is(false));
		boolean isChecked = checkbox.toggle();
		assertThat(isChecked, is(true));
		isChecked = checkbox.toggle();
		assertThat(isChecked, is(false));
	}

	@Ignore("safari")
	public void testShouldNotBeAbleToSelectSomethingThatIsDisabled() {
		driver.get(formPage);
		WebElement radioButton = driver.findElement(By.id("nothing"));
		assertThat(radioButton.isEnabled(), is(false));

		try {
			radioButton.setSelected();
			fail("Should not have succeeded");
		} catch (UnsupportedOperationException e) {
			// this is expected
		}
	}

	@Ignore(value = "safari", reason = "IE: Fails test. Safari: Not implemented")
	public void testShouldBeAbleToSelectARadioButton() {
		driver.get(formPage);
		WebElement radioButton = driver.findElement(By.id("peas"));
		assertThat(radioButton.isSelected(), is(false));
		radioButton.setSelected();
		assertThat(radioButton.isSelected(), is(true));
	}

	@Ignore(value = "ie", reason = "Fails test")
	public void testShouldThrowAnExceptionWhenTogglingTheStateOfARadioButton() {
		driver.get(formPage);
		WebElement radioButton = driver.findElement(By.id("cheese"));
		try {
			radioButton.toggle();
			fail("You should not be able to toggle a radio button");
		} catch (UnsupportedOperationException e) {
			assertThat(e.getMessage().contains("toggle"), is(true));
		}
	}

	@Ignore(value = "safari", reason = "Test fails")
	public void testShouldBeAbleToAlterTheContentsOfAFileUploadInputElement() throws Exception {
		driver.get(formPage);
		WebElement uploadElement = driver.findElement(By.id("upload"));
		assertThat(uploadElement.getValue(), equalTo(""));
		
		File file = File.createTempFile("test", "txt");
		file.deleteOnExit();
		
		uploadElement.sendKeys(file.getAbsolutePath());
		
		File value = new File(uploadElement.getValue());
		assertThat(value.getCanonicalPath(), equalTo(file.getCanonicalPath()));
	}

	public void testShouldThrowAnExceptionWhenSelectingAnUnselectableElement() {
		driver.get(formPage);

		WebElement element = driver.findElement(By.xpath("//title"));

		try {
			element.setSelected();
			fail("Should not have succeeded");
		} catch (UnsupportedOperationException e) {
			// this is expected
		}
	}
	
	public void testSendingKeyboardEventsShouldAppendTextInInputs() {
		driver.get(formPage);
		WebElement element = driver.findElement(By.id("working"));
		element.sendKeys("Some");
		String value = element.getValue();
		assertThat(value, is("Some"));
		
		element.sendKeys(" text");
		value = element.getValue();
		assertThat(value, is("Some text"));
	}
	
	@Ignore(value="ie, safari", reason="Not implemented going to the end of the line first")
	public void testSendingKeyboardEventsShouldAppendTextinTextAreas() {
		driver.get(formPage);
		WebElement element = driver.findElement(By.id("withText"));
		
		element.sendKeys(". Some text");
		String value = element.getValue();
		
		assertThat(value, is("Example text. Some text"));
	}
	
	public void testShouldBeAbleToClearTextFromInputElements() {
		driver.get(formPage);
		WebElement element = driver.findElement(By.id("working"));
		element.sendKeys("Some text");
		String value = element.getValue();
		assertThat(value.length(), is(greaterThan(0)));
		
		element.clear();
		value = element.getValue();
		
		assertThat(value.length(), is(0));
	}
	
	public void testShouldBeAbleToClearTextFromTextAreas() {
		driver.get(formPage);
		WebElement element = driver.findElement(By.id("withText"));
		element.sendKeys("Some text");
		String value = element.getValue();
		assertThat(value.length(), is(greaterThan(0)));
		
		element.clear();
		value = element.getValue();
		
		assertThat(value.length(), is(0));
	}
}
