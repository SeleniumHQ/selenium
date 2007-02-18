/*
 * Copyright 2007 ThoughtWorks, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.thoughtworks.webdriver;

import java.util.List;

import junit.framework.TestCase;

import com.thoughtworks.webdriver.environment.GlobalTestEnvironment;
import com.thoughtworks.webdriver.environment.InProcessTestEnvironment;
import com.thoughtworks.webdriver.environment.TestEnvironment;

/**
 * All drivers should pass these basic tests
 */
public abstract class BasicDriverTestCase extends TestCase {
	private static WebDriver storedDriver;
	
	protected void setUp() throws Exception {
		super.setUp();

		if (isUsingSameDriverInstance()) {
			if (storedDriver == null) {
				storedDriver = getDriver();
			}
			driver = storedDriver;
		} else {
			driver = getDriver();
		}
		driver.setVisible(false);
		
		startEnvironmentIfNecessary();
		simpleTestPage = baseUrl + "simpleTest.html";
		xhtmlTestPage = baseUrl + "xhtmlTest.html";
		formPage = baseUrl + "formPage.html";
		metaRedirectPage = baseUrl + "meta-redirect.html";
		redirectPage = baseUrl + "redirect";
		javascriptPage = baseUrl + "javascriptPage.html";
	}

	protected abstract WebDriver getDriver();
	
	protected boolean isUsingSameDriverInstance() {
		return false;
	}
	
	private void startEnvironmentIfNecessary() {
		if (!GlobalTestEnvironment.isSetUp()) {
			GlobalTestEnvironment.set(startTestEnvironment());
		}

		TestEnvironment testEnvironment = GlobalTestEnvironment.get();
		baseUrl = testEnvironment.getAppServer().getBaseUrl();
	}

	protected TestEnvironment startTestEnvironment() {
		return new InProcessTestEnvironment();
	}

	protected void tearDown() throws Exception {
		if (!isUsingSameDriverInstance()) 
			driver.close();
		super.tearDown();
	}

	public void testShouldWaitForDocumentToBeLoaded() {
		driver.get(simpleTestPage);

		assertEquals("Hello WebDriver", driver.getTitle());
	}

	public void testShouldReturnTitleOfPageIfSet() {
		driver.get(xhtmlTestPage);
		assertEquals("XHTML Test Page", driver.getTitle());

		driver.get(simpleTestPage);
		assertEquals("Hello WebDriver", driver.getTitle());
	}

	public void testShouldFollowRedirectsSentInTheHttpResponseHeaders() {
		driver.get(redirectPage);
		
		assertEquals("We Arrive Here", driver.getTitle());
	}

	public void testShouldFollowMetaRedirects() throws Exception {
		driver.get(metaRedirectPage);
		Thread.sleep(500);  // Let the redirect happen
		assertEquals("We Arrive Here", driver.getTitle());
	}

	public void testShouldClickOnButtons() {
		driver.get(formPage);
		driver.selectElement("//input[@id='submitButton']").click();
		assertEquals("We Arrive Here", driver.getTitle());
	}

	public void testClickingOnUnclickableElementsDoesNothing() {
		driver.get(formPage);
		try {
			driver.selectElement("//title").click();
		} catch (Exception e) {
			fail("Clicking on the unclickable should be a no-op");
		}
	}
	
	public void testShouldNotBeAbleToLocateASingleElementThatDoesNotExist() {
		driver.get(formPage);
		try {
			driver.selectElement("//input[@id='nonExistantButton']");
			fail("NoSuchElementException was expected");
		} catch (NoSuchElementException e) {
			// This is expected
		}
	}

	public void testShouldBeAbleToClickOnLinkIdentifiedByText() {
		driver.get(xhtmlTestPage);
		driver.selectElement("link=click me").click();
		assertEquals("We Arrive Here", driver.getTitle());
	}

	public void testShouldBeAbleToClickOnLinkIdentifiedById() {
		driver.get(xhtmlTestPage);
		driver.selectElement("//a[@id='linkId']").click();
		assertEquals("We Arrive Here", driver.getTitle());
	}

    public void testShouldThrowAnExceptionWhenThereIsNoLinkToClickAndItIsFoundWithXPath() {
		driver.get(xhtmlTestPage);
		try {
			driver.selectElement("//a[@id='Not here']");
			fail("Test should have failed");
		} catch (NoSuchElementException e) {
			// this is expected
		}
	}

	public void testShouldThrowAnExceptionWhenThereIsNoLinkToClickAndItIsFoundWithLinkText() {
		driver.get(xhtmlTestPage);
		try {
			driver.selectElement("link=Not here either");
			fail("Test should have failed");
		} catch (NoSuchElementException e) {
			// this is expected
		}
	}
	
	public void testShouldThrowAnExceptionWhenThereIsNoLinkToClick() {
		driver.get(xhtmlTestPage);
		try {
			driver.selectElement("//a[@id='Not here']");
			fail("Should not be able to click a link by ID that does not exist");
		} catch (NoSuchElementException e) {
			// this is expected
		}

		try {
			driver.selectElement("link=Not here either");
			fail("Should not be able to click on a link with text that does not exist");
		} catch (NoSuchElementException e) {
			// This is also expected
		}
	}

	public void testShouldBeAbleToClickImageButtons() {
		driver.get(formPage);
		driver.selectElement("//input[@id='imageButton']").click();
		assertEquals("We Arrive Here", driver.getTitle());
	}
	
	public void testShouldBeAbleToSubmitForms() {
		driver.get(formPage);
		driver.selectElement("//form[@name='login']").submit();
		assertEquals("We Arrive Here", driver.getTitle());
	}

	public void testShouldSubmitAFormWhenAnyInputElementWithinThatFormIsSubmitted() {
		driver.get(formPage);
		driver.selectElement("//input[@id='checky']").submit();
		assertEquals("We Arrive Here", driver.getTitle());
	}
	
	public void testShouldSubmitAFormWhenAnyElementWihinThatFormIsSubmitted() {
		driver.get(formPage);
		driver.selectElement("//form/p").submit();
		assertEquals("We Arrive Here", driver.getTitle());
	}
	
	public void testShouldNotBeAbleToSubmitAFormThatDoesNotExist() {
		driver.get(formPage);
		try {
			driver.selectElement("//form[@name='there is no spoon']").submit();
			fail("Not expected");
		} catch (NoSuchElementException e) {
			// Expected
		}
	}

	public void testShouldThrowAnUnsupportedOperationExceptionIfTryingToSetTheValueOfAnElementNotInAForm() {
		driver.get(xhtmlTestPage);
		try {
			driver.selectElement("//h1").setValue("Fishy");
			fail("You should not be able to set the value of elements that are not in a form");
		} catch (UnsupportedOperationException e) {
			// this is expected
		}
	}
	
	public void testShouldBeAbleToEnterTextIntoATextAreaBySettingItsValue() {
		driver.get(javascriptPage);
		WebElement textarea = driver.selectElement("//textarea[@id='keyUpArea']");
		String cheesey = "Brie and cheddar";
		textarea.setValue(cheesey);
		assertEquals(cheesey, textarea.getValue());
	}

	public void testShouldEnterDataIntoFormFields() {
		driver.get(xhtmlTestPage);
		WebElement element = driver.selectElement("//form[@name='someForm']/input[@id='username']");
		String originalValue = element.getValue();
		assertEquals("change", originalValue);
		element.setValue("some text");
		
		element = driver.selectElement("//form[@name='someForm']/input[@id='username']");
		String newFormValue = element.getValue();
		assertEquals("some text", newFormValue);
	}

	public void testShouldFindElementsByXPath() {
		driver.get(xhtmlTestPage);
		List divs = driver.selectElements("//div");
		assertEquals(4, divs.size());
	}

	public void testShouldFindTextUsingXPath() {
		driver.get(xhtmlTestPage);
		String text = driver.selectText("//div/h1");
		assertEquals("XHTML Might Be The Future", text);
	}
	
	public void testShouldFindSingleElementByXPath() {
		driver.get(xhtmlTestPage);
		WebElement element = driver.selectElement("//h1");
		assertEquals("XHTML Might Be The Future", element.getText());
	}
	
	public void testShouldBeAbleToFindChildrenOfANode() {
		driver.get(xhtmlTestPage);
		List elements = driver.selectElements("/html/head");
		WebElement head = (WebElement) elements.get(0);
		List importedScripts = head.getChildrenOfType("script");
		assertEquals(2, importedScripts.size());
	}
	
	public void testShouldBeAbleToChangeTheSelectedOptionInASelect() {
		driver.get(formPage);
		WebElement selectBox = driver.selectElement("//select[@name='selectomatic']");
		List options = selectBox.getChildrenOfType("option");
		WebElement one = (WebElement) options.get(0);
		WebElement two = (WebElement) options.get(1);
		assertTrue(one.isSelected());
		assertFalse(two.isSelected());
		
		two.setSelected();
		assertFalse(one.isSelected());
		assertTrue(two.isSelected());
	}
	
	public void testShouldBeAbleToSelectACheckBox() {
		driver.get(formPage);
		WebElement checkbox = driver.selectElement("//input[@id='checky']");
		assertFalse(checkbox.isSelected());
		checkbox.setSelected();
		assertTrue(checkbox.isSelected());
		checkbox.setSelected();
		assertTrue(checkbox.isSelected());
	}
	
	public void testShouldToggleTheCheckedStateOfACheckbox() {
		driver.get(formPage);
		WebElement checkbox = driver.selectElement("//input[@id='checky']");
		assertFalse(checkbox.isSelected());
		checkbox.toggle();
		assertTrue(checkbox.isSelected());
		checkbox.toggle();
		assertFalse(checkbox.isSelected());
	}
	
	public void testTogglingACheckboxShouldReturnItsCurrentState() {
		driver.get(formPage);
		WebElement checkbox = driver.selectElement("//input[@id='checky']");
		assertFalse(checkbox.isSelected());
		boolean isChecked = checkbox.toggle();
		assertTrue(isChecked);
		isChecked = checkbox.toggle();
		assertFalse(isChecked);
	}
	
	public void testShouldBeAbleToSelectARadioButton() {
		
	}
	
	public void testShouldThrowAnExceptionWhenTogglingTheStateOfARadioButton() {
		
	}
	
	public void testShouldReturnTheEmptyStringWhenGettingTheValueOfAnAttributeThatIsNotListed() {
		driver.get(simpleTestPage);
		WebElement head = driver.selectElement("/html");
		String attribute = head.getAttribute("cheese");
		assertEquals("", attribute);
	}
	
	public void testShouldReturnEmptyAttributeValuesWhenPresentAndTheValueIsActuallyEmpty() {
		driver.get(simpleTestPage);
		WebElement body = driver.selectElement("//body");
		assertEquals("", body.getAttribute("style"));
	}

	public void testShouldReturnTheValueOfTheDisabledAttrbuteEvenIfItIsMissing() {
		driver.get(formPage);
		WebElement inputElement = driver.selectElement("//input[@id='working']");
		assertEquals("false", inputElement.getAttribute("disabled"));
	}

	public void testShouldIndicateTheElementsThatAreDisabledAreNotEnabled() {
		driver.get(formPage);
		WebElement inputElement = driver.selectElement("//input[@id='notWorking']");
		assertFalse(inputElement.isEnabled());
		
		inputElement = driver.selectElement("//input[@id='working']");
		assertTrue(inputElement.isEnabled());
	}
	
	public void testShouldIndicateWhenATextAreaIsDisabled() {
		driver.get(formPage);
		WebElement textArea = driver.selectElement("//textarea[@id='notWorkingArea']");
		assertFalse(textArea.isEnabled());
	}
	
	public void testShouldReturnTheValueOfCheckedForACheckboxEvenIfItLacksThatAttribute() {
		driver.get(formPage);
		WebElement checkbox = driver.selectElement("//input[@id='checky']");
		assertEquals("false", checkbox.getAttribute("checked"));
		checkbox.setSelected();
		assertEquals("true", checkbox.getAttribute("checked"));
	}
	
	public void testShouldReturnTheValueOfSelectedForRadioButtonsEvenIfTheyLackThatAttribute() {
		
	}
	
	public void testShouldReturnTheValueOfSelectedForOptionsInSelectsEvenIfTheyLackThatAttribute() {
		driver.get(formPage);
		WebElement selectBox = driver.selectElement("//select[@name='selectomatic']");
		List options = selectBox.getChildrenOfType("option");
		WebElement one = (WebElement) options.get(0);
		WebElement two = (WebElement) options.get(1);
		assertTrue(one.isSelected());
		assertFalse(two.isSelected());
		assertEquals("true", one.getAttribute("selected"));
		assertEquals("false", two.getAttribute("selected"));
	}
	
	public void testShouldThrowAnExceptionWhenSelectingAnUnselectableElement() {
		driver.get(formPage);
		try {
			driver.selectElement("//title").setSelected();
			fail("You should not be able to select an unselectable element");
		} catch (UnsupportedOperationException e) {
			// This is expected
		}
	}
	
	public void testShouldBeAbleToIdentifyElementsByClass() {
		driver.get(xhtmlTestPage);
		
		String header = driver.selectText("//h1[@class='header']");
		assertEquals("XHTML Might Be The Future", header);
	}
	
	public void testShouldReturnValueOfClassAttributeOfAnElement() {
		driver.get(xhtmlTestPage);
		
		WebElement heading = driver.selectElement("//h1");
		String className = heading.getAttribute("class");
		
		assertEquals("header", className);
	}
	
	public void testShouldReturnTheValueOfTheStyleAttribute() {
		driver.get(formPage);
		
		WebElement element = driver.selectElement("//form[3]");
		String style = element.getAttribute("style");
		
		assertEquals("display: block", style);
	}
	
	protected WebDriver driver;
	protected String baseUrl;
	protected String simpleTestPage;
	protected String xhtmlTestPage;
	protected String formPage;
	protected String metaRedirectPage;
	protected String redirectPage;
	protected String javascriptPage;
}
