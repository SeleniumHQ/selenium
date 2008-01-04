package com.thoughtworks.webdriver;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;

public class FormHandlingTest extends AbstractDriverTestCase {
	public void testShouldClickOnButtons() {
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
		driver.findElement(By.xpath("//input[@id='imageButton']")).click();
		assertThat(driver.getTitle(), equalTo("We Arrive Here"));
	}

	@Ignore(value = "safari", reason = "Test fails")
	public void testShouldBeAbleToSubmitForms() {
		driver.get(formPage);
		driver.findElement(By.xpath("//form[@name='login']")).submit();
		assertThat(driver.getTitle(), equalTo("We Arrive Here"));
	}

	@Ignore(value = "safari", reason = "Test fails")
	public void testShouldSubmitAFormWhenAnyInputElementWithinThatFormIsSubmitted() {
		driver.get(formPage);
		driver.findElement(By.xpath("//input[@id='checky']")).submit();
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
			driver.findElement(By.xpath("//form[@name='there is no spoon']"))
					.submit();
			fail("Should not have succeeded");
		} catch (NoSuchElementException e) {
			// this is expected
		}
	}

	@Ignore(value = "firefox, safari, ie", reason = "Typing text into a random element should be allowed")
	public void testShouldThrowAnUnsupportedOperationExceptionIfTryingToSetTheValueOfAnElementNotInAForm() {
		driver.get(xhtmlTestPage);

		WebElement element = driver.findElement(By.xpath("//h1"));
		try {
			element.setValue("Fishy");
			fail("Should not have succeeded");
		} catch (UnsupportedOperationException e) {
			// this is expected
		}
	}

	public void testShouldBeAbleToEnterTextIntoATextAreaBySettingItsValue() {
		driver.get(javascriptPage);
		WebElement textarea = driver.findElement(By
				.xpath("//textarea[@id='keyUpArea']"));
		String cheesey = "Brie and cheddar";
		textarea.setValue(cheesey);
		assertThat(textarea.getValue(), equalTo(cheesey));
	}

	public void testShouldEnterDataIntoFormFields() {
		driver.get(xhtmlTestPage);
		WebElement element = driver.findElement(By
				.xpath("//form[@name='someForm']/input[@id='username']"));
		String originalValue = element.getValue();
		assertThat(originalValue, equalTo("change"));
		element.setValue("some text");

		element = driver.findElement(By
				.xpath("//form[@name='someForm']/input[@id='username']"));
		String newFormValue = element.getValue();
		assertThat(newFormValue, equalTo("some text"));
	}

	@Ignore("safari")
	public void testShouldBeAbleToSelectACheckBox() {
		driver.get(formPage);
		WebElement checkbox = driver.findElement(By
				.xpath("//input[@id='checky']"));
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
				.xpath("//input[@id='checky']"));
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
				.xpath("//input[@id='checky']"));
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

	@Ignore(value = "ie, safari", reason = "IE: Fails test. Safari: Not implemented")
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

	@Ignore(value = "ie, safari", reason = "Test fails")
	public void testShouldBeAbleToAlterTheContentsOfAFileUploadInputElement() {
		driver.get(formPage);
		WebElement uploadElement = driver.findElement(By.id("upload"));
		assertThat(uploadElement.getValue(), equalTo(""));
		uploadElement.setValue("Cheese");
		assertThat(uploadElement.getValue(), equalTo("Cheese"));
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

}
