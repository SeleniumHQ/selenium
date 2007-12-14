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

import com.thoughtworks.webdriver.environment.GlobalTestEnvironment;
import com.thoughtworks.webdriver.environment.InProcessTestEnvironment;
import com.thoughtworks.webdriver.environment.TestEnvironment;
import junit.framework.TestCase;

import java.util.List;

/**
 * All drivers should pass these basic tests
 */
public abstract class BasicDriverTestCase extends TestCase {
    protected static WebDriver storedDriver;

    protected void setUp() throws Exception {
        super.setUp();

        if (isUsingSameDriverInstance()) {
            if (storedDriver == null) {
                storedDriver = getDriver();
            }
            driver = storedDriver;

//            Alert alert = driver.switchTo().alert();
//            if (alert != null) {
//                alert.dimiss();
//            }

            WebDriver resultWindow = driver.switchTo().window("result");
            if (resultWindow != null) {
                driver = resultWindow.close();

                // Stored driver may now point to a Bad Window. Make sure that it doesn't :)
                storedDriver = driver;
            }

            assertNotNull("Driver cannot be null", driver);
        } else {
            driver = getDriver();
        }

        driver.setVisible(true);

        startEnvironmentIfNecessary();
        simpleTestPage = baseUrl + "simpleTest.html";
        xhtmlTestPage = baseUrl + "xhtmlTest.html";
        formPage = baseUrl + "formPage.html";
        metaRedirectPage = baseUrl + "meta-redirect.html";
        redirectPage = baseUrl + "redirect";
        javascriptPage = baseUrl + "javascriptPage.html";
        framesetPage = baseUrl + "frameset.html";
        iframePage = baseUrl + "iframes.html";
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
        else {
            // Close all the windows, expect for one
        }
        super.tearDown();
    }

    public void testShouldWaitForDocumentToBeLoaded() {
        driver.get(simpleTestPage);

        assertEquals("Hello WebDriver", driver.getTitle());
    }

    public void testShouldReportTheCurrentUrlCorrectly() {
        driver.get(simpleTestPage);
        assertEquals(simpleTestPage, driver.getCurrentUrl());

        driver.get(javascriptPage);
        assertEquals(javascriptPage, driver.getCurrentUrl());
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
        assertEquals("We Arrive Here", driver.getTitle());
    }

    public void testShouldClickOnButtons() {
        driver.get(formPage);
        driver.findElement(By.id("submitButton")).click();
        assertEquals("We Arrive Here", driver.getTitle());
    }

    public void testClickingOnUnclickableElementsDoesNothing() {
        driver.get(formPage);
        try {
            driver.findElement(By.xpath("//title")).click();
        } catch (Exception e) {
            fail("Clicking on the unclickable should be a no-op");
        }
    }

    public void testShouldNotBeAbleToLocateASingleElementThatDoesNotExist() {
        driver.get(formPage);
        try {
            driver.findElement(By.id("nonExistantButton"));
            fail("NoSuchElementException was expected");
        } catch (NoSuchElementException e) {
            // This is expected
        }
    }

    public void testShouldBeAbleToClickOnLinkIdentifiedByText() {
        driver.get(xhtmlTestPage);
        driver.findElement(By.linkText("click me")).click();
        assertEquals("We Arrive Here", driver.getTitle());
    }

    public void testDriverShouldBeAbleToFindElementsAfterLoadingMoreThanOnePageAtATime() {
        driver.get(formPage);
        driver.get(xhtmlTestPage);
        driver.findElement(By.linkText("click me")).click();
        assertEquals("We Arrive Here", driver.getTitle());
    }

    public void testShouldBeAbleToClickOnLinkIdentifiedById() {
        driver.get(xhtmlTestPage);
        driver.findElement(By.id("linkId")).click();
        assertEquals("We Arrive Here", driver.getTitle());
    }

    public void testShouldThrowAnExceptionWhenThereIsNoLinkToClickAndItIsFoundWithXPath() {
        driver.get(xhtmlTestPage);
        try {
            driver.findElement(By.xpath("//a[@id='Not here']"));
            fail("Test should have failed");
        } catch (NoSuchElementException e) {
            // this is expected
        }
    }

    public void testShouldThrowAnExceptionWhenThereIsNoLinkToClickAndItIsFoundWithLinkText() {
        driver.get(xhtmlTestPage);
        try {
            driver.findElement(By.linkText("Not here either"));
            fail("Test should have failed");
        } catch (NoSuchElementException e) {
            // this is expected
        }
    }

    public void testShouldThrowAnExceptionWhenThereIsNoLinkToClick() {
        driver.get(xhtmlTestPage);
        try {
            driver.findElement(By.xpath("//a[@id='Not here']"));
            fail("Should not be able to click a link by ID that does not exist");
        } catch (NoSuchElementException e) {
            // this is expected
        }

        try {
            driver.findElement(By.linkText("Not here either"));
            fail("Should not be able to click on a link with text that does not exist");
        } catch (NoSuchElementException e) {
            // This is also expected
        }
    }

    public void testShouldBeAbleToClickImageButtons() {
        driver.get(formPage);
        driver.findElement(By.xpath("//input[@id='imageButton']")).click();
        assertEquals("We Arrive Here", driver.getTitle());
    }

    public void testShouldBeAbleToSubmitForms() {
        driver.get(formPage);
        driver.findElement(By.xpath("//form[@name='login']")).submit();
        assertEquals("We Arrive Here", driver.getTitle());
    }

    public void testShouldSubmitAFormWhenAnyInputElementWithinThatFormIsSubmitted() {
        driver.get(formPage);
        driver.findElement(By.xpath("//input[@id='checky']")).submit();
        assertEquals("We Arrive Here", driver.getTitle());
    }

    public void testShouldSubmitAFormWhenAnyElementWihinThatFormIsSubmitted() {
        driver.get(formPage);
        driver.findElement(By.xpath("//form/p")).submit();
        assertEquals("We Arrive Here", driver.getTitle());
    }

    public void testShouldNotBeAbleToSubmitAFormThatDoesNotExist() {
        driver.get(formPage);
        try {
            driver.findElement(By.xpath("//form[@name='there is no spoon']")).submit();
            fail("Not expected");
        } catch (NoSuchElementException e) {
            // Expected
        }
    }

    public void testShouldThrowAnUnsupportedOperationExceptionIfTryingToSetTheValueOfAnElementNotInAForm() {
        driver.get(xhtmlTestPage);
        try {
            driver.findElement(By.xpath("//h1")).setValue("Fishy");
            fail("You should not be able to set the value of elements that are not in a form");
        } catch (UnsupportedOperationException e) {
            // this is expected
        }
    }

    public void testShouldBeAbleToEnterTextIntoATextAreaBySettingItsValue() {
        driver.get(javascriptPage);
        WebElement textarea = driver.findElement(By.xpath("//textarea[@id='keyUpArea']"));
        String cheesey = "Brie and cheddar";
        textarea.setValue(cheesey);
        assertEquals(cheesey, textarea.getValue());
    }

    public void testShouldEnterDataIntoFormFields() {
        driver.get(xhtmlTestPage);
        WebElement element = driver.findElement(By.xpath("//form[@name='someForm']/input[@id='username']"));
        String originalValue = element.getValue();
        assertEquals("change", originalValue);
        element.setValue("some text");

        element = driver.findElement(By.xpath("//form[@name='someForm']/input[@id='username']"));
        String newFormValue = element.getValue();
        assertEquals("some text", newFormValue);
    }

    public void testShouldFindElementsByXPath() {
        driver.get(xhtmlTestPage);
        List<WebElement> divs = driver.findElements(By.xpath("//div"));
        assertEquals(3, divs.size());
    }

    public void testShouldBeAbleToFindManyElementsRepeatedlyByXPath() {
        driver.get(xhtmlTestPage);
        String xpathString = "//node()[contains(@id,'id')]";
        assertEquals(3, driver.findElements(By.xpath(xpathString)).size());

        xpathString = "//node()[contains(@id,'nope')]";
        assertEquals(0, driver.findElements(By.xpath(xpathString)).size());
    }

    public void testShouldReturnTheTextContentOfASingleElementWithNoChildren() {
        driver.get(simpleTestPage);
        String selectText = driver.findElement(By.id("oneline")).getText();
        assertEquals("A single line of text", selectText);

        String getText = driver.findElement(By.id("oneline")).getText();
        assertEquals("A single line of text", getText);
    }

    public void testShouldReturnTheEntireTextContentOfChildElements() {
        driver.get(simpleTestPage);
        String text = driver.findElement(By.id("multiline")).getText();

        assertTrue(text.contains("A div containing"));
        assertTrue(text.contains("More than one line of text"));
        assertTrue(text.contains("and block level elements"));
    }

    public void testShouldRepresentABlockLevelElementAsANewline() {
        driver.get(simpleTestPage);
        String text = driver.findElement(By.id("multiline")).getText();

        assertEquals(" A div containing\n" +
                " More than one line of text\n" +
                " and block level elements", text);
    }

    public void testShouldCollapseMultipleWhitespaceCharactersIntoASingleSpace() {
        driver.get(simpleTestPage);
        String text = driver.findElement(By.id("lotsofspaces")).getText();

        assertEquals("This line has lots of spaces.", text);
    }

    public void testShouldConvertANonBreakingSpaceIntoANormalSpaceCharacter() {
        driver.get(simpleTestPage);
        String text = driver.findElement(By.id("nbsp")).getText();

        assertEquals("This line has a non-breaking space", text);
    }

    public void testShouldTreatANonBreakingSpaceAsAnyOtherWhitespaceCharacterWhenCollapsingWhitespace() {
      driver.get(simpleTestPage);
      WebElement element = driver.findElement(By.id("nbspandspaces"));
      String text = element.getText();

      assertEquals("This line has a non-breaking space and spaces", text);
    }

    public void testHavingInlineElementsShouldNotAffectHowTextIsReturned() {
        driver.get(simpleTestPage);
        String text = driver.findElement(By.id("inline")).getText();

        assertEquals("This line has text within elements that are meant to be displayed inline", text);
    }

    public void testShouldReturnTheEntireTextOfInlineElements() {
        driver.get(simpleTestPage);
        String text = driver.findElement(By.id("span")).getText();

        assertEquals("An inline element", text);
    }

    /*
    public void testShouldRetainTheFormatingOfTextWithinAPreElement() {
        driver.get(simpleTestPage);
        String text = driver.findElement(By.id("preformatted").getText();

        assertEquals("This section has a\npreformatted\n   text block\n" +
                "  within in\n" +
                "        ", text);
    }
    */
    public void testShouldFindSingleElementByXPath() {
        driver.get(xhtmlTestPage);
        WebElement element = driver.findElement(By.xpath("//h1"));
        assertEquals("XHTML Might Be The Future", element.getText());
    }

    public void testShouldBeAbleToFindChildrenOfANode() {
        driver.get(xhtmlTestPage);
        List<WebElement> elements = driver.findElements(By.xpath("/html/head"));
        WebElement head = elements.get(0);
        List<WebElement> importedScripts = head.getChildrenOfType("script");
        assertEquals(2, importedScripts.size());
    }

    public void testShouldBeAbleToChangeTheSelectedOptionInASelect() {
        driver.get(formPage);
        WebElement selectBox = driver.findElement(By.xpath("//select[@name='selectomatic']"));
        List<WebElement> options = selectBox.getChildrenOfType("option");
        WebElement one = options.get(0);
        WebElement two = options.get(1);
        assertTrue(one.isSelected());
        assertFalse(two.isSelected());

        two.setSelected();
        assertFalse(one.isSelected());
        assertTrue(two.isSelected());
    }

    public void testShouldBeAbleToSelectMoreThanOneOptionFromASelectWhichAllowsMultipleChoices() {
        driver.get(formPage);

        WebElement multiSelect = driver.findElement(By.id("multi"));
        List<WebElement> options = multiSelect.getChildrenOfType("option");
        for (WebElement option : options)
            option.setSelected();

        for (int i = 0; i < options.size(); i++) {
            WebElement option = options.get(i);
            assertTrue("Option at index is not selected but should be: " + i, option.isSelected());
        }
    }

    public void testShouldBePossibleToDeselectASingleOptionFromASelectWhichAllowsMultipleChoices() {
        driver.get(formPage);

        WebElement multiSelect = driver.findElement(By.id("multi"));
        List<WebElement> options = multiSelect.getChildrenOfType("option");

        WebElement option = options.get(0);
        assertTrue(option.isSelected());
        option.toggle();
        assertFalse(option.isSelected());
        option.toggle();
        assertTrue(option.isSelected());

        option = options.get(2);
        assertTrue(option.isSelected());
    }

    public void testShouldNotBeAbleToDeselectAnOptionFromANormalSelect() {
        driver.get(formPage);

        WebElement select = driver.findElement(By.xpath("//select[@name='selectomatic']"));
        List<WebElement> options = select.getChildrenOfType("option");
        WebElement option = options.get(0);

        try {
            option.toggle();
            fail("You may not toggle an option if the select only allows one thing to be selected");
        } catch (RuntimeException e) {
            // This is expected
        }
    }

    public void testShouldBeAbleToSelectACheckBox() {
        driver.get(formPage);
        WebElement checkbox = driver.findElement(By.xpath("//input[@id='checky']"));
        assertFalse(checkbox.isSelected());
        checkbox.setSelected();
        assertTrue(checkbox.isSelected());
        checkbox.setSelected();
        assertTrue(checkbox.isSelected());
    }

    public void testShouldToggleTheCheckedStateOfACheckbox() {
        driver.get(formPage);
        WebElement checkbox = driver.findElement(By.xpath("//input[@id='checky']"));
        assertFalse(checkbox.isSelected());
        checkbox.toggle();
        assertTrue(checkbox.isSelected());
        checkbox.toggle();
        assertFalse(checkbox.isSelected());
    }

    public void testTogglingACheckboxShouldReturnItsCurrentState() {
        driver.get(formPage);
        WebElement checkbox = driver.findElement(By.xpath("//input[@id='checky']"));
        assertFalse(checkbox.isSelected());
        boolean isChecked = checkbox.toggle();
        assertTrue(isChecked);
        isChecked = checkbox.toggle();
        assertFalse(isChecked);
    }

    public void testShouldNotBeAbleToSelectSomethingThatIsDisabled() {
        driver.get(formPage);
        WebElement radioButton = driver.findElement(By.id("nothing"));
        assertFalse(radioButton.isEnabled());
        try {
            radioButton.setSelected();
            fail("Should have thrown an exception");
        } catch (UnsupportedOperationException e) {
            assertTrue("e.getMessage: " + e.getMessage(), e.getMessage().contains("disabled"));
        }
    }

    public void testShouldBeAbleToSelectARadioButton() {
        driver.get(formPage);
        WebElement radioButton = driver.findElement(By.id("peas"));
        assertFalse(radioButton.isSelected());
        radioButton.setSelected();
        assertTrue(radioButton.isSelected());
    }

    public void testShouldThrowAnExceptionWhenTogglingTheStateOfARadioButton() {
        driver.get(formPage);
        WebElement radioButton = driver.findElement(By.id("cheese"));
        try {
            radioButton.toggle();
            fail("You should not be able to toggle a radio button");
        } catch (UnsupportedOperationException e) {
            assertTrue(e.getMessage().contains("toggle"));
        }
    }

    public void testShouldReturnNullWhenGettingTheValueOfAnAttributeThatIsNotListed() {
        driver.get(simpleTestPage);
        WebElement head = driver.findElement(By.xpath("/html"));
        String attribute = head.getAttribute("cheese");
        assertNull(attribute);
    }

    public void testShouldReturnEmptyAttributeValuesWhenPresentAndTheValueIsActuallyEmpty() {
        driver.get(simpleTestPage);
        WebElement body = driver.findElement(By.xpath("//body"));
        assertEquals("", body.getAttribute("style"));
    }

    public void testShouldReturnTheValueOfTheDisabledAttrbuteEvenIfItIsMissing() {
        driver.get(formPage);
        WebElement inputElement = driver.findElement(By.xpath("//input[@id='working']"));
        assertEquals("false", inputElement.getAttribute("disabled"));
    }

    public void testShouldIndicateTheElementsThatAreDisabledAreNotEnabled() {
        driver.get(formPage);
        WebElement inputElement = driver.findElement(By.xpath("//input[@id='notWorking']"));
        assertFalse(inputElement.isEnabled());

        inputElement = driver.findElement(By.xpath("//input[@id='working']"));
        assertTrue(inputElement.isEnabled());
    }

    public void testShouldIndicateWhenATextAreaIsDisabled() {
        driver.get(formPage);
        WebElement textArea = driver.findElement(By.xpath("//textarea[@id='notWorkingArea']"));
        assertFalse(textArea.isEnabled());
    }

    public void testShouldReturnTheValueOfCheckedForACheckboxEvenIfItLacksThatAttribute() {
        driver.get(formPage);
        WebElement checkbox = driver.findElement(By.xpath("//input[@id='checky']"));
        assertEquals("false", checkbox.getAttribute("checked"));
        checkbox.setSelected();
        assertEquals("true", checkbox.getAttribute("checked"));
    }

    public void testShouldReturnTheValueOfSelectedForRadioButtonsEvenIfTheyLackThatAttribute() {

    }

    public void testShouldReturnTheValueOfSelectedForOptionsInSelectsEvenIfTheyLackThatAttribute() {
        driver.get(formPage);
        WebElement selectBox = driver.findElement(By.xpath("//select[@name='selectomatic']"));
        List<WebElement> options = selectBox.getChildrenOfType("option");
        WebElement one = options.get(0);
        WebElement two = options.get(1);
        assertTrue(one.isSelected());
        assertFalse(two.isSelected());
        assertEquals("true", one.getAttribute("selected"));
        assertEquals("false", two.getAttribute("selected"));
    }

    public void testShouldThrowAnExceptionWhenSelectingAnUnselectableElement() {
        driver.get(formPage);
        try {
            driver.findElement(By.xpath("//title")).setSelected();
            fail("You should not be able to select an unselectable element");
        } catch (UnsupportedOperationException e) {
            // This is expected
        }
    }

    public void testShouldBeAbleToIdentifyElementsByClass() {
        driver.get(xhtmlTestPage);

        String header = driver.findElement(By.xpath("//h1[@class='header']")).getText();
        assertEquals("XHTML Might Be The Future", header);
    }

    public void testShouldReturnValueOfClassAttributeOfAnElement() {
        driver.get(xhtmlTestPage);

        WebElement heading = driver.findElement(By.xpath("//h1"));
        String className = heading.getAttribute("class");

        assertEquals("header", className);
    }

    public void testShouldReturnTheContentsOfATextAreaAsItsValue() {
        driver.get(formPage);

        String value = driver.findElement(By.id("withText")).getValue();

        assertEquals("Example text", value);
    }

    public void testShouldReturnTheValueOfTheStyleAttribute() {
        driver.get(formPage);

        WebElement element = driver.findElement(By.xpath("//form[3]"));
        String style = element.getAttribute("style");

        assertEquals("display: block", style);
    }

    public void testShouldfindElementsBasedOnId() {
        driver.get(formPage);

        WebElement element = driver.findElement(By.id("checky"));

        assertFalse(element.isSelected());
    }

    public void testShouldNotBeAbleTofindElementsBasedOnIdIfTheElementIsNotThere() {
        driver.get(formPage);

        try {
            driver.findElement(By.id("notThere"));
            fail("Should not be able to select element by id here");
        } catch (NoSuchElementException e) {
            // This is expected
        }
    }

    public void testShouldBeAbleToLoadAPageWithFramesetsAndWaitUntilAllFramesAreLoaded() {
        driver.get(framesetPage);

        driver.switchTo().frame(0);
        WebElement pageNumber = driver.findElement(By.xpath("//span[@id='pageNumber']"));
        assertEquals("1", pageNumber.getText().trim());

        driver.switchTo().frame(1);
        pageNumber = driver.findElement(By.xpath("//span[@id='pageNumber']"));
        assertEquals("2", pageNumber.getText().trim());

    }

    public void testShouldContinueToReferToTheSameFrameOnceItHasBeenSelected() {
        driver.get(framesetPage);

        driver.switchTo().frame(2);
        WebElement checkbox = driver.findElement(By.xpath("//input[@name='checky']"));
        checkbox.toggle();
        checkbox.submit();

        assertEquals("Success!", driver.findElement(By.xpath("//p")).getText());
    }

    public void testShouldAutomaticallyUseTheFirstFrameOnAPage() {
        driver.get(framesetPage);

        // Notice that we've not switched to the 0th frame
        WebElement pageNumber = driver.findElement(By.xpath("//span[@id='pageNumber']"));
        assertEquals("1", pageNumber.getText().trim());
    }

    public void testShouldFocusOnTheReplacementWhenAFrameFollowsALinkToA_TopTargettedPage() {
        driver.get(framesetPage);

        driver.findElement(By.linkText("top")).click();
        assertEquals("XHTML Test Page", driver.getTitle());
    }

    public void testShouldNotAutomaticallySwitchFocusToAnIFrameWhenAPageContainingThemIsLoaded() {
        driver.get(iframePage);
        driver.findElement(By.id("iframe_page_heading"));
    }

    public void testShouldAllowAUserToSwitchFromAnIframeBackToTheMainContentOfThePage() {
        driver.get(iframePage);
        driver.switchTo().frame(0);

        try {
            driver.switchTo().defaultContent();
            driver.findElement(By.id("iframe_page_heading"));
        } catch (Exception e) {
            fail("Should have switched back to main content");
        }
    }

    public void testShouldAllowTheUserToSwitchToAnIFrameAndRemainFocusedOnIt() {
        driver.get(iframePage);
        driver.switchTo().frame(0);

        driver.findElement(By.id("submitButton")).click();
        String hello = driver.findElement(By.id("greeting")).getText();
        assertEquals("Success!", hello);
    }

    public void testShouldReturnANewWebDriverWhichSendsCommandsToANewWindowWhenItIsOpened() {
        driver.get(xhtmlTestPage);

        WebDriver newWindow = driver.findElement(By.linkText("Open new window")).click();
        assertEquals("XHTML Test Page", driver.getTitle());
        assertEquals("We Arrive Here", newWindow.getTitle());

        driver = driver.switchTo().window("result");
        assertEquals("We Arrive Here", driver.getTitle());

        driver.switchTo().window("");
    }

    public void testShouldBeAbleToSelectAFrameByName() {
        driver.get(framesetPage);

        driver.switchTo().frame("second");
        assertEquals("2", driver.findElement(By.id("pageNumber")).getText());
    }

    public void testShouldSelectChildFramesByUsingADotSeparatedString() {
        driver.get(framesetPage);

        driver.switchTo().frame("fourth.child2");
        assertEquals("11", driver.findElement(By.id("pageNumber")).getText());
    }

    public void testShouldSwitchToChildFramesTreatingNumbersAsIndex() {
        driver.get(framesetPage);

        driver.switchTo().frame("fourth.1");
        assertEquals("11", driver.findElement(By.id("pageNumber")).getText());
    }

    public void testShouldBeAbleToPerformMultipleActionsOnDifferentDrivers() {
        driver.get(iframePage);
        driver.switchTo().frame(0);

        driver.findElement(By.id("submitButton")).click();
        String hello = driver.findElement(By.id("greeting")).getText();
        assertEquals("Success!", hello);

        driver.get(xhtmlTestPage);

        WebDriver newWindow = driver.findElement(By.linkText("Open new window")).click();
        assertEquals("XHTML Test Page", driver.getTitle());
        assertEquals("We Arrive Here", newWindow.getTitle());

        driver = driver.switchTo().window("result");
        assertEquals("We Arrive Here", driver.getTitle());

        driver.switchTo().window("");
    }

    public void testClosingTheFinalBrowserWindowShouldNotCauseAnExceptionToBeThrown() {
        if (isUsingSameDriverInstance()) {
            // Force the driver to be reopened
            storedDriver = null;
        }
        driver.get(simpleTestPage);
        driver.close();
    }

    public void testShouldBeAbleToSetMoreThanOneLineOfTextInATextArea() {
        driver.get(formPage);
        WebElement textarea = driver.findElement(By.id("withText"));
        String expectedText = "I like cheese\n\nIt's really nice";
        textarea.setValue(expectedText);

        String seenText = textarea.getValue();
        assertEquals(expectedText, seenText);
    }

    public void testShouldBeAbleToEnterDatesAfterFillingInOtherValuesFirst() {
        driver.get(formPage);
        WebElement input = driver.findElement(By.id("working"));
        String expectedValue = "10/03/2007 to 30/07/1993";
        input.setValue(expectedValue);
        String seenValue = input.getValue();

        assertEquals(expectedValue, seenValue);
    }

    public void testShouldBeAbleToAlterTheContentsOfAFileUploadInputElement() {
      driver.get(formPage);
      WebElement uploadElement = driver.findElement(By.id("upload"));
      assertEquals("", uploadElement.getValue());
      uploadElement.setValue("Cheese");
      assertEquals("Cheese", uploadElement.getValue());
    }

    public void testShouldReturnTheSourceOfAPage() {
        driver.get(simpleTestPage);

        String source = driver.getPageSource().toLowerCase();

        assertTrue(source.contains("<html"));
        assertTrue(source.contains("</html"));
        assertTrue(source.contains("an inline element"));
        assertTrue(source.contains("<p id=\"lotsofspaces\""));
    }

    public void testShouldReturnEmptyStringWhenTextIsOnlySpaces() {
        driver.get(xhtmlTestPage);

        String text = driver.findElement(By.id("spaces")).getText();
        assertEquals("", text);
    }

    public void testShouldReturnEmptyStringWhenTextIsEmpty() {
        driver.get(xhtmlTestPage);

        String text = driver.findElement(By.id("empty")).getText();
        assertEquals("", text);
    }

    public void testShouldReturnEmptyStringWhenTagIsSelfClosing() {
        driver.get(xhtmlTestPage);

        String text = driver.findElement(By.id("self-closed")).getText();
        assertEquals("", text);
    }

    public void testShouldDoNothingIfThereIsNothingToGoBackTo() {
      if (storedDriver != null) {
          driver.close();
          storedDriver = getDriver();
          driver = storedDriver;
      }
      driver.get(formPage);

      driver.navigate().back();
      assertEquals("We Leave From Here", driver.getTitle());
    }

    public void testShouldBeAbleToNavigateBackInTheBrowserHistory() {
        driver.get(formPage);

        driver.findElement(By.id("imageButton")).submit();
        assertEquals("We Arrive Here", driver.getTitle());

        driver.navigate().back();
        assertEquals("We Leave From Here", driver.getTitle());
    }

    public void testShouldBeAbleToNavigateForwardsInTheBrowserHistory() {
      driver.get(formPage);

      driver.findElement(By.id("imageButton")).submit();
      assertEquals("We Arrive Here", driver.getTitle());

      driver.navigate().back();
      assertEquals("We Leave From Here", driver.getTitle());

      driver.navigate().forward();
      assertEquals("We Arrive Here", driver.getTitle());
    }

    public void testShouldBeAbleToGetAFragmentOnTheCurrentPage() {
      driver.get(xhtmlTestPage);
      driver.get(xhtmlTestPage + "#text");
    }

    public void testShouldReturnWhenGettingAUrlThatDoesNotResolve() {
      // Of course, we're up the creek if this ever does get registered
      driver.get("http://www.thisurldoesnotexist.com/");
    }

    public void testShouldReturnWhenGettingAUrlThatDoesNotConnect() {
      // Here's hoping that there's nothing here. There shouldn't be
      driver.get("http://localhost:3001");
    }

    protected WebDriver driver;
    protected String baseUrl;
    protected String simpleTestPage;
    protected String xhtmlTestPage;
    protected String formPage;
    protected String metaRedirectPage;
    protected String redirectPage;
    protected String javascriptPage;
    protected String framesetPage;
    protected String iframePage;
}
