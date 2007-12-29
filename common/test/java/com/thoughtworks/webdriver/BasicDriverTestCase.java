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
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.core.IsNot.not;
import static org.hamcrest.core.IsNull.nullValue;

import java.util.Calendar;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

/**
 * All drivers should pass these basic tests
 */
public abstract class BasicDriverTestCase extends TestCase {
    protected static WebDriver storedDriver;

    protected void setUp() throws Exception {
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

            assertThat(driver, is(notNullValue()));
        } else {
            driver = getDriver();
        }

        driver.setVisible(true);

        TestEnvironment environment = startEnvironmentIfNecessary();
        simpleTestPage = baseUrl + "simpleTest.html";
        xhtmlTestPage = baseUrl + "xhtmlTest.html";
        formPage = baseUrl + "formPage.html";
        metaRedirectPage = baseUrl + "meta-redirect.html";
        redirectPage = baseUrl + "redirect";
        javascriptPage = baseUrl + "javascriptPage.html";
        framesetPage = baseUrl + "frameset.html";
        iframePage = baseUrl + "iframes.html";

        hostName = environment.getAppServer().getHostName();
        alternateHostName = environment.getAppServer().getAlternateHostName();
        alternateBaseUrl = environment.getAppServer().getAlternateBaseUrl();

        assertThat(hostName, is(not(equalTo(alternateHostName))));
    }

    protected abstract WebDriver getDriver();

    protected boolean isUsingSameDriverInstance() {
        return false;
    }

    private TestEnvironment startEnvironmentIfNecessary() {
        if (!GlobalTestEnvironment.isSetUp()) {
            GlobalTestEnvironment.set(startTestEnvironment());
        }

        TestEnvironment testEnvironment = GlobalTestEnvironment.get();
        baseUrl = testEnvironment.getAppServer().getBaseUrl();
        return testEnvironment;
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
    }

    public void testShouldWaitForDocumentToBeLoaded() {
        driver.get(simpleTestPage);

        assertThat(driver.getTitle(), equalTo("Hello WebDriver"));
    }

    public void testShouldReportTheCurrentUrlCorrectly() {
        driver.get(simpleTestPage);
        assertThat(driver.getCurrentUrl(), equalTo(simpleTestPage));

        driver.get(javascriptPage);
        assertThat(driver.getCurrentUrl(), equalTo(javascriptPage));
    }

    public void testShouldReturnTitleOfPageIfSet() {
        driver.get(xhtmlTestPage);
        assertThat(driver.getTitle(), equalTo(("XHTML Test Page")));

        driver.get(simpleTestPage);
        assertThat(driver.getTitle(), equalTo("Hello WebDriver"));
    }

    public void testShouldFollowRedirectsSentInTheHttpResponseHeaders() {
        driver.get(redirectPage);

        assertThat(driver.getTitle(), equalTo("We Arrive Here"));
    }

    public void testShouldFollowMetaRedirects() throws Exception {
        driver.get(metaRedirectPage);
        assertThat(driver.getTitle(), equalTo("We Arrive Here"));
    }

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

    public void testShouldNotBeAbleToLocateASingleElementThatDoesNotExist() {
        driver.get(formPage);

        try {
        	driver.findElement(By.id("nonExistantButton"));
        	fail("Should not have succeeded");
        } catch (NoSuchElementException e) {
        	// this is expected
        }
    }

    public void testShouldBeAbleToClickOnLinkIdentifiedByText() {
        driver.get(xhtmlTestPage);
        driver.findElement(By.linkText("click me")).click();
        assertThat(driver.getTitle(), equalTo("We Arrive Here"));
    }

    public void testDriverShouldBeAbleToFindElementsAfterLoadingMoreThanOnePageAtATime() {
        driver.get(formPage);
        driver.get(xhtmlTestPage);
        driver.findElement(By.linkText("click me")).click();
        assertThat(driver.getTitle(), equalTo("We Arrive Here"));
    }

    public void shouldBeAbleToClickOnLinkIdentifiedById() {
        driver.get(xhtmlTestPage);
        driver.findElement(By.id("linkId")).click();
        assertThat(driver.getTitle(), equalTo("We Arrive Here"));
    }

    public void testShouldThrowAnExceptionWhenThereIsNoLinkToClickAndItIsFoundWithXPath() {
        driver.get(xhtmlTestPage);
        
        try {
        	driver.findElement(By.xpath("//a[@id='Not here']"));
        	fail("Should not have succeeded");
        } catch (NoSuchElementException e) {
        	// this is expected
        }
    }

    public void testShouldThrowAnExceptionWhenThereIsNoLinkToClickAndItIsFoundWithLinkText() {
        driver.get(xhtmlTestPage);
        
        try {
        	driver.findElement(By.linkText("Not here either"));
        	fail("Should not have succeeded");
        } catch (NoSuchElementException e) {
        	// this is expected
        }
    }

    public void testShouldThrowAnExceptionWhenThereIsNoLinkToClick() {
        driver.get(xhtmlTestPage);
        
        try {
        	driver.findElement(By.xpath("//a[@id='Not here']"));
        	fail("Should not have succeeded");
        } catch (NoSuchElementException e) {
        	// this is expected
        }
    }

    public void testShouldThrowAnExceptionWhenThereIsNoLinkToClickAndWeUseTheLinkTestToFindIt() {
        driver.get(xhtmlTestPage);
        
        try {
        	driver.findElement(By.linkText("Not here either"));
        	fail("Should not have succeeded");
        } catch (NoSuchElementException e) {
        	// this is expected
        }
    }

    public void testShouldBeAbleToClickImageButtons() {
        driver.get(formPage);
        driver.findElement(By.xpath("//input[@id='imageButton']")).click();
        assertThat(driver.getTitle(), equalTo("We Arrive Here"));
    }

    public void testShouldBeAbleToSubmitForms() {
        driver.get(formPage);
        driver.findElement(By.xpath("//form[@name='login']")).submit();
        assertThat(driver.getTitle(), equalTo("We Arrive Here"));
    }

    public void testShouldSubmitAFormWhenAnyInputElementWithinThatFormIsSubmitted() {
        driver.get(formPage);
        driver.findElement(By.xpath("//input[@id='checky']")).submit();
        assertThat(driver.getTitle(), equalTo("We Arrive Here"));
    }

    public void testShouldSubmitAFormWhenAnyElementWihinThatFormIsSubmitted() {
        driver.get(formPage);
        driver.findElement(By.xpath("//form/p")).submit();
        assertThat(driver.getTitle(), equalTo("We Arrive Here"));
    }

    public void testShouldNotBeAbleToSubmitAFormThatDoesNotExist() {
        driver.get(formPage);
        
        try {
        	driver.findElement(By.xpath("//form[@name='there is no spoon']")).submit();
        	fail("Should not have succeeded");
        } catch (NoSuchElementException e) {
        	// this is expected
        }
    }

    public void testShouldThrowAnUnsupportedOperationExceptionIfTryingToSetTheValueOfAnElementNotInAForm() {
        driver.get(xhtmlTestPage);
        
        WebElement element = driver.findElement(By.xpath("//h1"));
        try {
        	element.setValue("Fishy");
        	fail("SHould not have succeeded");
        } catch (UnsupportedOperationException e) {
        	// this is expected
        }
    }

    public void testShouldBeAbleToEnterTextIntoATextAreaBySettingItsValue() {
        driver.get(javascriptPage);
        WebElement textarea = driver.findElement(By.xpath("//textarea[@id='keyUpArea']"));
        String cheesey = "Brie and cheddar";
        textarea.setValue(cheesey);
        assertThat(textarea.getValue(), equalTo(cheesey));
    }

    public void testShouldEnterDataIntoFormFields() {
        driver.get(xhtmlTestPage);
        WebElement element = driver.findElement(By.xpath("//form[@name='someForm']/input[@id='username']"));
        String originalValue = element.getValue();
        assertThat(originalValue, equalTo("change"));
        element.setValue("some text");

        element = driver.findElement(By.xpath("//form[@name='someForm']/input[@id='username']"));
        String newFormValue = element.getValue();
        assertThat(newFormValue, equalTo("some text"));
    }

    public void testShouldFindElementsByXPath() {
        driver.get(xhtmlTestPage);
        List<WebElement> divs = driver.findElements(By.xpath("//div"));
        assertThat(divs.size(), equalTo(3));
    }

    public void testShouldBeAbleToFindManyElementsRepeatedlyByXPath() {
        driver.get(xhtmlTestPage);
        String xpathString = "//node()[contains(@id,'id')]";
        assertThat(driver.findElements(By.xpath(xpathString)).size(), equalTo(3));

        xpathString = "//node()[contains(@id,'nope')]";
        assertThat(driver.findElements(By.xpath(xpathString)).size(), equalTo(0));
    }

    public void testShouldReturnTheTextContentOfASingleElementWithNoChildren() {
        driver.get(simpleTestPage);
        String selectText = driver.findElement(By.id("oneline")).getText();
        assertThat(selectText, equalTo("A single line of text"));

        String getText = driver.findElement(By.id("oneline")).getText();
        assertThat(getText, equalTo("A single line of text"));
    }

    public void testShouldReturnTheEntireTextContentOfChildElements() {
        driver.get(simpleTestPage);
        String text = driver.findElement(By.id("multiline")).getText();

        assertThat(text.contains("A div containing"), is(true));
        assertThat(text.contains("More than one line of text"), is(true));
        assertThat(text.contains("and block level elements"), is(true));
    }

    public void testShouldRepresentABlockLevelElementAsANewline() {
        driver.get(simpleTestPage);
        String text = driver.findElement(By.id("multiline")).getText();

        assertThat(text, equalTo(" A div containing\n" +
                " More than one line of text\n" +
                " and block level elements"));
    }

    public void testShouldCollapseMultipleWhitespaceCharactersIntoASingleSpace() {
        driver.get(simpleTestPage);
        String text = driver.findElement(By.id("lotsofspaces")).getText();

        assertThat(text, equalTo("This line has lots of spaces."));
    }

    public void testShouldConvertANonBreakingSpaceIntoANormalSpaceCharacter() {
        driver.get(simpleTestPage);
        String text = driver.findElement(By.id("nbsp")).getText();

        assertThat(text, equalTo("This line has a non-breaking space"));
    }

    public void testShouldTreatANonBreakingSpaceAsAnyOtherWhitespaceCharacterWhenCollapsingWhitespace() {
      driver.get(simpleTestPage);
      WebElement element = driver.findElement(By.id("nbspandspaces"));
      String text = element.getText();

      assertThat(text, equalTo("This line has a non-breaking space and spaces"));
    }

    public void testHavingInlineElementsShouldNotAffectHowTextIsReturned() {
        driver.get(simpleTestPage);
        String text = driver.findElement(By.id("inline")).getText();

        assertThat(text, equalTo("This line has text within elements that are meant to be displayed inline"));
    }

    public void testShouldReturnTheEntireTextOfInlineElements() {
        driver.get(simpleTestPage);
        String text = driver.findElement(By.id("span")).getText();

        assertThat(text, equalTo("An inline element"));
    }

//    public void testShouldRetainTheFormatingOfTextWithinAPreElement() {
//        driver.get(simpleTestPage);
//        String text = driver.findElement(By.id("preformatted")).getText();
//
//        assertThat(text, equalTo("This section has a\npreformatted\n   text block\n" +
//                "  within in\n" +
//                "        "));
//    }


    public void testShouldFindSingleElementByXPath() {
        driver.get(xhtmlTestPage);
        WebElement element = driver.findElement(By.xpath("//h1"));
        assertThat(element.getText(), equalTo("XHTML Might Be The Future"));
    }

    public void testShouldBeAbleToFindChildrenOfANode() {
        driver.get(xhtmlTestPage);
        List<WebElement> elements = driver.findElements(By.xpath("/html/head"));
        WebElement head = elements.get(0);
        List<WebElement> importedScripts = head.getChildrenOfType("script");
        assertThat(importedScripts.size(), equalTo(2));
    }

    public void testShouldBeAbleToChangeTheSelectedOptionInASelect() {
        driver.get(formPage);
        WebElement selectBox = driver.findElement(By.xpath("//select[@name='selectomatic']"));
        List<WebElement> options = selectBox.getChildrenOfType("option");
        WebElement one = options.get(0);
        WebElement two = options.get(1);
        assertThat(one.isSelected(), is(true));
        assertThat(two.isSelected(), is(false));

        two.setSelected();
        assertThat(one.isSelected(), is(false));
        assertThat(two.isSelected(), is(true));
    }

    public void testShouldBeAbleToSelectMoreThanOneOptionFromASelectWhichAllowsMultipleChoices() {
        driver.get(formPage);

        WebElement multiSelect = driver.findElement(By.id("multi"));
        List<WebElement> options = multiSelect.getChildrenOfType("option");
        for (WebElement option : options)
            option.setSelected();

        for (int i = 0; i < options.size(); i++) {
            WebElement option = options.get(i);
            assertThat("Option at index is not selected but should be: " + i, option.isSelected(), is(true));
        }
    }

    public void testShouldBePossibleToDeselectASingleOptionFromASelectWhichAllowsMultipleChoices() {
        driver.get(formPage);

        WebElement multiSelect = driver.findElement(By.id("multi"));
        List<WebElement> options = multiSelect.getChildrenOfType("option");

        WebElement option = options.get(0);
        assertThat(option.isSelected(), is(true));
        option.toggle();
        assertThat(option.isSelected(), is(false));
        option.toggle();
        assertThat(option.isSelected(), is(true));

        option = options.get(2);
        assertThat(option.isSelected(), is(true));
    }

    public void testShouldNotBeAbleToDeselectAnOptionFromANormalSelect() {
        driver.get(formPage);

        WebElement select = driver.findElement(By.xpath("//select[@name='selectomatic']"));
        List<WebElement> options = select.getChildrenOfType("option");
        WebElement option = options.get(0);

        try {
        	option.toggle();
        	fail("Should not have succeeded");
        } catch (RuntimeException e) {
        	// This is expected
        }
    }

    public void testShouldBeAbleToSelectACheckBox() {
        driver.get(formPage);
        WebElement checkbox = driver.findElement(By.xpath("//input[@id='checky']"));
        assertThat(checkbox.isSelected(), is(false));
        checkbox.setSelected();
        assertThat(checkbox.isSelected(), is(true));
        checkbox.setSelected();
        assertThat(checkbox.isSelected(), is(true));
    }

    public void testShouldToggleTheCheckedStateOfACheckbox() {
        driver.get(formPage);
        WebElement checkbox = driver.findElement(By.xpath("//input[@id='checky']"));
        assertThat(checkbox.isSelected(), is(false));
        checkbox.toggle();
        assertThat(checkbox.isSelected(), is(true));
        checkbox.toggle();
        assertThat(checkbox.isSelected(), is(false));
    }

    public void testTogglingACheckboxShouldReturnItsCurrentState() {
        driver.get(formPage);
        WebElement checkbox = driver.findElement(By.xpath("//input[@id='checky']"));
        assertThat(checkbox.isSelected(), is(false));
        boolean isChecked = checkbox.toggle();
        assertThat(isChecked, is(true));
        isChecked = checkbox.toggle();
        assertThat(isChecked, is(false));
    }

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

    public void testShouldBeAbleToSelectARadioButton() {
        driver.get(formPage);
        WebElement radioButton = driver.findElement(By.id("peas"));
        assertThat(radioButton.isSelected(), is(false));
        radioButton.setSelected();
        assertThat(radioButton.isSelected(), is(true));
    }

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

	public void testShouldReturnNullWhenGettingTheValueOfAnAttributeThatIsNotListed() {
        driver.get(simpleTestPage);
        WebElement head = driver.findElement(By.xpath("/html"));
        String attribute = head.getAttribute("cheese");
        assertThat(attribute, is(nullValue()));
    }

    public void testShouldReturnEmptyAttributeValuesWhenPresentAndTheValueIsActuallyEmpty() {
        driver.get(simpleTestPage);
        WebElement body = driver.findElement(By.xpath("//body"));
        assertThat(body.getAttribute("style"), equalTo(""));
    }

    public void testShouldReturnTheValueOfTheDisabledAttrbuteEvenIfItIsMissing() {
        driver.get(formPage);
        WebElement inputElement = driver.findElement(By.xpath("//input[@id='working']"));
        assertThat(inputElement.getAttribute("disabled"), equalTo("false"));
    }

    public void testShouldIndicateTheElementsThatAreDisabledAreNotEnabled() {
        driver.get(formPage);
        WebElement inputElement = driver.findElement(By.xpath("//input[@id='notWorking']"));
        assertThat(inputElement.isEnabled(), is(false));

        inputElement = driver.findElement(By.xpath("//input[@id='working']"));
        assertThat(inputElement.isEnabled(), is(true));
    }

    public void testShouldIndicateWhenATextAreaIsDisabled() {
        driver.get(formPage);
        WebElement textArea = driver.findElement(By.xpath("//textarea[@id='notWorkingArea']"));
        assertThat(textArea.isEnabled(), is(false));
    }

    public void testShouldReturnTheValueOfCheckedForACheckboxEvenIfItLacksThatAttribute() {
        driver.get(formPage);
        WebElement checkbox = driver.findElement(By.xpath("//input[@id='checky']"));
        assertThat(checkbox.getAttribute("checked"), equalTo("false"));
        checkbox.setSelected();
        assertThat(checkbox.getAttribute("checked"), equalTo("true"));
    }

    public void testShouldReturnTheValueOfSelectedForRadioButtonsEvenIfTheyLackThatAttribute() {

    }

    public void testShouldReturnTheValueOfSelectedForOptionsInSelectsEvenIfTheyLackThatAttribute() {
        driver.get(formPage);
        WebElement selectBox = driver.findElement(By.xpath("//select[@name='selectomatic']"));
        List<WebElement> options = selectBox.getChildrenOfType("option");
        WebElement one = options.get(0);
        WebElement two = options.get(1);
        assertThat(one.isSelected(), is(true));
        assertThat(two.isSelected(), is(false));
        assertThat(one.getAttribute("selected"), equalTo("true"));
        assertThat(two.getAttribute("selected"), equalTo("false"));
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

    public void testShouldBeAbleToIdentifyElementsByClass() {
        driver.get(xhtmlTestPage);

        String header = driver.findElement(By.xpath("//h1[@class='header']")).getText();
        assertThat(header, equalTo("XHTML Might Be The Future"));
    }

    public void testShouldReturnValueOfClassAttributeOfAnElement() {
        driver.get(xhtmlTestPage);

        WebElement heading = driver.findElement(By.xpath("//h1"));
        String className = heading.getAttribute("class");

        assertThat(className, equalTo("header"));
    }

    public void testShouldReturnTheContentsOfATextAreaAsItsValue() {
        driver.get(formPage);

        String value = driver.findElement(By.id("withText")).getValue();

        assertThat(value, equalTo("Example text"));
    }

    public void testShouldReturnTheValueOfTheStyleAttribute() {
        driver.get(formPage);

        WebElement element = driver.findElement(By.xpath("//form[3]"));
        String style = element.getAttribute("style");

        assertThat(style, equalTo("display: block"));
    }

    public void testShouldfindElementsBasedOnId() {
        driver.get(formPage);

        WebElement element = driver.findElement(By.id("checky"));

        assertThat(element.isSelected(), is(false));
    }

    public void testShouldNotBeAbleTofindElementsBasedOnIdIfTheElementIsNotThere() {
        driver.get(formPage);

        try {
        	driver.findElement(By.id("notThere"));
        	fail("Should not have succeeded");
        } catch (NoSuchElementException e) {
        	// this is expected
        }
    }

    public void testShouldBeAbleToLoadAPageWithFramesetsAndWaitUntilAllFramesAreLoaded() {
        driver.get(framesetPage);

        driver.switchTo().frame(0);
        WebElement pageNumber = driver.findElement(By.xpath("//span[@id='pageNumber']"));
        assertThat(pageNumber.getText().trim(), equalTo("1"));

        driver.switchTo().frame(1);
        pageNumber = driver.findElement(By.xpath("//span[@id='pageNumber']"));
        assertThat(pageNumber.getText().trim(), equalTo("2"));
    }

    public void testShouldContinueToReferToTheSameFrameOnceItHasBeenSelected() {
        driver.get(framesetPage);

        driver.switchTo().frame(2);
        WebElement checkbox = driver.findElement(By.xpath("//input[@name='checky']"));
        checkbox.toggle();
        checkbox.submit();

        assertThat(driver.findElement(By.xpath("//p")).getText(), equalTo("Success!"));
    }

    public void testShouldAutomaticallyUseTheFirstFrameOnAPage() {
        driver.get(framesetPage);

        // Notice that we've not switched to the 0th frame
        WebElement pageNumber = driver.findElement(By.xpath("//span[@id='pageNumber']"));
        assertThat(pageNumber.getText().trim(), equalTo("1"));
    }

    public void testShouldFocusOnTheReplacementWhenAFrameFollowsALinkToA_TopTargettedPage() {
        driver.get(framesetPage);

        driver.findElement(By.linkText("top")).click();
        assertThat(driver.getTitle(), equalTo("XHTML Test Page"));
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
        assertThat(hello, equalTo("Success!"));
    }

    public void testShouldReturnANewWebDriverWhichSendsCommandsToANewWindowWhenItIsOpened() {
        driver.get(xhtmlTestPage);

        WebDriver newWindow = driver.findElement(By.linkText("Open new window")).click();
        assertThat(driver.getTitle(), equalTo("XHTML Test Page"));
        assertThat(newWindow.getTitle(), equalTo("We Arrive Here"));

        driver = driver.switchTo().window("result");
        assertThat(driver.getTitle(), equalTo("We Arrive Here"));

        driver.switchTo().window("");
    }

    public void testShouldBeAbleToSelectAFrameByName() {
        driver.get(framesetPage);

        driver.switchTo().frame("second");
        assertThat(driver.findElement(By.id("pageNumber")).getText(), equalTo("2"));
    }

    public void testShouldSelectChildFramesByUsingADotSeparatedString() {
        driver.get(framesetPage);

        driver.switchTo().frame("fourth.child2");
        assertThat(driver.findElement(By.id("pageNumber")).getText(), equalTo("11"));
    }

    public void testShouldSwitchToChildFramesTreatingNumbersAsIndex() {
        driver.get(framesetPage);

        driver.switchTo().frame("fourth.1");
        assertThat(driver.findElement(By.id("pageNumber")).getText(), equalTo("11"));
    }

    public void testShouldBeAbleToPerformMultipleActionsOnDifferentDrivers() {
        driver.get(iframePage);
        driver.switchTo().frame(0);

        driver.findElement(By.id("submitButton")).click();
        String hello = driver.findElement(By.id("greeting")).getText();
        assertThat(hello, equalTo("Success!"));

        driver.get(xhtmlTestPage);

        WebDriver newWindow = driver.findElement(By.linkText("Open new window")).click();
        assertThat(driver.getTitle(), equalTo("XHTML Test Page"));
        assertThat(newWindow.getTitle(), equalTo("We Arrive Here"));

        driver = driver.switchTo().window("result");
        assertThat(driver.getTitle(), equalTo("We Arrive Here"));

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
        assertThat(seenText, equalTo(expectedText));
    }

    public void testShouldBeAbleToEnterDatesAfterFillingInOtherValuesFirst() {
        driver.get(formPage);
        WebElement input = driver.findElement(By.id("working"));
        String expectedValue = "10/03/2007 to 30/07/1993";
        input.setValue(expectedValue);
        String seenValue = input.getValue();

        assertThat(seenValue, equalTo(expectedValue));
    }

    public void testShouldBeAbleToAlterTheContentsOfAFileUploadInputElement() {
      driver.get(formPage);
      WebElement uploadElement = driver.findElement(By.id("upload"));
      assertThat(uploadElement.getValue(), equalTo(""));
      uploadElement.setValue("Cheese");
      assertThat(uploadElement.getValue(), equalTo("Cheese"));
    }

    public void testShouldReturnTheSourceOfAPage() {
        driver.get(simpleTestPage);

        String source = driver.getPageSource().toLowerCase();

        assertThat(source.contains("<html"), is(true));
        assertThat(source.contains("</html"), is(true));
        assertThat(source.contains("an inline element"), is(true));
        assertThat(source.contains("<p id=\"lotsofspaces\""), is(true));
    }

    public void testShouldReturnEmptyStringWhenTextIsOnlySpaces() {
        driver.get(xhtmlTestPage);

        String text = driver.findElement(By.id("spaces")).getText();
        assertThat(text, equalTo(""));
    }

    public void testShouldReturnEmptyStringWhenTextIsEmpty() {
        driver.get(xhtmlTestPage);

        String text = driver.findElement(By.id("empty")).getText();
        assertThat(text, equalTo(""));
    }

    public void testShouldReturnEmptyStringWhenTagIsSelfClosing() {
        driver.get(xhtmlTestPage);

        String text = driver.findElement(By.id("self-closed")).getText();
        assertThat(text, equalTo(""));
    }

    public void testSouldDoNothingIfThereIsNothingToGoBackTo() {
      if (storedDriver != null) {
          driver.close();
          storedDriver = getDriver();
          driver = storedDriver;
      }
      driver.get(formPage);

      driver.navigate().back();
      assertThat(driver.getTitle(), equalTo("We Leave From Here"));
    }

    public void testShouldBeAbleToNavigateBackInTheBrowserHistory() {
        driver.get(formPage);

        driver.findElement(By.id("imageButton")).submit();
        assertThat(driver.getTitle(), equalTo("We Arrive Here"));

        driver.navigate().back();
        assertThat(driver.getTitle(), equalTo("We Leave From Here"));
    }

    public void testShouldBeAbleToNavigateForwardsInTheBrowserHistory() {
        driver.get(formPage);

        driver.findElement(By.id("imageButton")).submit();
        assertThat(driver.getTitle(), equalTo("We Arrive Here"));

        driver.navigate().back();
        assertThat(driver.getTitle(), equalTo("We Leave From Here"));

        driver.navigate().forward();
        assertThat(driver.getTitle(), equalTo("We Arrive Here"));
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

    public void testAddCookiesWithDifferentPaths() {
        driver.get(simpleTestPage);
        driver.manage().deleteAllCookies();

        Cookie cookie1 = new Cookie("fish", "cod", hostName, "/animals", null, false);
        Cookie cookie2 = new Cookie("planet", "earth", hostName, "/galaxy", null, false);
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);
        options.addCookie(cookie2);

        driver.get(baseUrl + "animals");
        Set<Cookie> cookies = options.getCookies();

        assertThat(cookies.contains(cookie1), is(true));
        assertThat(cookies.contains(cookie2), is(false));

        driver.get(baseUrl + "galaxy");
        cookies = options.getCookies();
        assertThat(cookies.contains(cookie1), is(false));
        assertThat(cookies.contains(cookie2), is(true));
    }

    public void testGetAllCookies() {
        driver.get(simpleTestPage);
        driver.manage().deleteAllCookies();
        
        Calendar c = Calendar.getInstance();
        c.set(2009, 0, 1);
        Cookie cookie1 = new Cookie("fish", "cod", hostName, "", c.getTime(), false);
        Cookie cookie2 = new Cookie("planet", "earth", hostName, "", null, false);
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);
        options.addCookie(cookie2);

        Set<Cookie> cookies = options.getCookies();

        assertThat(cookies.contains(cookie1), is(true));
        assertThat(cookies.contains(cookie2), is(true));
    }

    public void testCookieIntegrity() {
        driver.get(alternateBaseUrl + "animals");
        driver.manage().deleteAllCookies();
        
        Calendar c = Calendar.getInstance();
        c.set(2009, 0, 1);
        Cookie cookie1 = new Cookie("fish", "cod", alternateHostName, "/animals", c.getTime(), false);
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);

        Set<Cookie> cookies = options.getCookies();
        Iterator<Cookie> iter = cookies.iterator();
        Cookie retrievedCookie = null;
        while(iter.hasNext()) {
            Cookie temp = iter.next();

            if (cookie1.equals(temp)) {
              retrievedCookie = temp;
              break;
            }
        }

        assertThat(retrievedCookie, is(notNullValue()));
        //Cookie.equals only compares name, domain and path
        assertThat(retrievedCookie, equalTo(cookie1));
        assertThat(retrievedCookie.getValue(), equalTo(cookie1.getValue()));
//        assertThat(retrievedCookie.getExpiry(), equalTo(cookie1.getExpiry()));
        assertThat(retrievedCookie.isSecure(), equalTo(cookie1.isSecure()));
    }

    public void testDeleteAllCookies() {
        driver.get(simpleTestPage);
        Cookie cookie1 = new Cookie("fish", "cod", hostName, "", null, false);
        Cookie cookie2 = new Cookie("planet", "earth", hostName, "", null, false);
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);
        options.addCookie(cookie2);
        Set<Cookie> cookies = options.getCookies();
        assertThat(cookies.contains(cookie1), is(true));
        assertThat(cookies.contains(cookie2), is(true));
        options.deleteAllCookies();
        driver.get(simpleTestPage);

        cookies = options.getCookies();
        assertThat(cookies.contains(cookie1), is(false));
        assertThat(cookies.contains(cookie2), is(false));
    }

    public void testDeleteCookie() {
        driver.get(simpleTestPage);
        Cookie cookie1 = new Cookie("fish", "cod", hostName, "", null, false);
        Cookie cookie2 = new Cookie("planet", "earth", hostName, "", null, false);
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);
        options.addCookie(cookie2);

        options.deleteCookie(cookie1);
        Set<Cookie> cookies = options.getCookies();

        assertThat(cookies.size(), equalTo(1));
        assertThat(cookies, hasItem(cookie2));
    }

    public void testDeleteCookieWithName() {
        driver.get(simpleTestPage);
        driver.manage().deleteAllCookies();
        
        String cookieOneName = "fish";
        String cookieTwoName = "planet";
        String cookieThreeName = "three";
        Cookie cookie1 = new Cookie(cookieOneName, "cod", hostName, "", null, false);
        Cookie cookie2 = new Cookie(cookieTwoName, "earth", hostName, "", null, false);
        Cookie cookie3 = new Cookie(cookieThreeName, "three", hostName, "", null, false);
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);
        options.addCookie(cookie2);
        options.addCookie(cookie3);

        options.deleteCookieNamed(cookieOneName);
        options.deleteCookieNamed(cookieTwoName);
        Set<Cookie> cookies = options.getCookies();
        //cookie without domain gets deleted
        assertThat(cookies, not(hasItem(cookie1)));
        //cookie with domain gets deleted
        assertThat(cookies, not(hasItem(cookie2)));
        //cookie not deleted
        assertThat(cookies, hasItem(cookie3));
    }

    public void testShouldNotDeleteCookiesWithASimilarName() {
        driver.get(simpleTestPage);
        driver.manage().deleteAllCookies();
        
        String cookieOneName = "fish";
        Cookie cookie1 = new Cookie(cookieOneName, "cod", hostName, "", null, false);
        Cookie cookie2 = new Cookie(cookieOneName + "x", "earth", hostName, "", null, false);
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);
        options.addCookie(cookie2);

        options.deleteCookieNamed(cookieOneName);
        Set<Cookie> cookies = options.getCookies();

        assertThat(cookies, not(hasItem(cookie1)));
        assertThat(cookies, hasItem(cookie2));
    }

    public void testGetCookieDoesNotRetriveBeyondCurrentDomain() {
        driver.get(simpleTestPage);
        driver.manage().deleteAllCookies();

        Cookie cookie1 = new Cookie("fish", "cod", hostName, "", null, false);
        WebDriver.Options options = driver.manage();
        options.addCookie(cookie1);

        driver.get(alternateBaseUrl);
        Set<Cookie> cookies = options.getCookies();
        assertThat(cookies, not(hasItem(cookie1)));
    }

    protected WebDriver driver;
    protected String hostName;
    protected String alternateHostName;
    protected String baseUrl;
    protected String alternateBaseUrl;
    protected String simpleTestPage;
    protected String xhtmlTestPage;
    protected String formPage;
    protected String metaRedirectPage;
    protected String redirectPage;
    protected String javascriptPage;
    protected String framesetPage;
    protected String iframePage;
}
