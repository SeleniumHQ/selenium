package com.googlecode.webdriver;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;

import com.googlecode.webdriver.internal.OperatingSystem;

public class TextHandlingTest extends AbstractDriverTestCase {
	private String newLine;
	
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		
		newLine = OperatingSystem.getCurrentPlatform().getLineEnding();
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

    @Ignore(value = "ie, safari", reason = "Safari: Test fails. IE: Underlying model removes the necessary spaces. Bah!")
    public void testShouldRepresentABlockLevelElementAsANewline() {
        driver.get(simpleTestPage);
        String text = driver.findElement(By.id("multiline")).getText();

        
        assertThat(text, equalTo(" A div containing" + newLine +
                " More than one line of text" + newLine +
                " and block level elements"));
    }

    public void testShouldCollapseMultipleWhitespaceCharactersIntoASingleSpace() {
        driver.get(simpleTestPage);
        String text = driver.findElement(By.id("lotsofspaces")).getText();

        assertThat(text, equalTo("This line has lots of spaces."));
    }

    @Ignore(value = "safari", reason = "Test fails")
    public void testShouldConvertANonBreakingSpaceIntoANormalSpaceCharacter() {
        driver.get(simpleTestPage);
        String text = driver.findElement(By.id("nbsp")).getText();

        assertThat(text, equalTo("This line has a non-breaking space"));
    }

    @Ignore(value = "safari", reason = "Test fails")
    public void testShouldTreatANonBreakingSpaceAsAnyOtherWhitespaceCharacterWhenCollapsingWhitespace() {
      driver.get(simpleTestPage);
      WebElement element = driver.findElement(By.id("nbspandspaces"));
      String text = element.getText();

      assertThat(text, equalTo("This line has a non-breaking space and spaces"));
    }

    @Ignore(value = "safari", reason = "Test fails")
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

    @Ignore(value = "safari", reason = "Test fails")
    public void testShouldBeAbleToSetMoreThanOneLineOfTextInATextArea() {
        driver.get(formPage);
        WebElement textarea = driver.findElement(By.id("withText"));
        textarea.clear();
        String expectedText = "I like cheese" + newLine + newLine  + "It's really nice";
        textarea.sendKeys(expectedText);

        String seenText = textarea.getValue();
        assertThat(seenText, equalTo(expectedText));
    }

    public void testShouldBeAbleToEnterDatesAfterFillingInOtherValuesFirst() {
        driver.get(formPage);
        WebElement input = driver.findElement(By.id("working"));
        String expectedValue = "10/03/2007 to 30/07/1993";
        input.sendKeys(expectedValue);
        String seenValue = input.getValue();

        assertThat(seenValue, equalTo(expectedValue));
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

    @Ignore("safari")
    public void testShouldHandleSiblingBlockLevelElements() {
    	driver.get(simpleTestPage);
    	
    	String text = driver.findElement(By.id("twoblocks")).getText();
    	
    	assertThat(text, is("Some text" + newLine + "Some more text"));
    }

    @Ignore("htmlunit, firefox, safari")
    public void testShouldHandleNestedBlockLevelElements() {
    	driver.get(simpleTestPage);
    	
    	String text = driver.findElement(By.id("nestedblocks")).getText();
    	
    	assertThat(text, is("Cheese " + newLine + "Some text" + newLine + "Some more text" + newLine + "and also" + newLine + "Brie"));
    }

    @Ignore("htmlunit, firefox, safari")
    public void testShouldHandleWhitespaceInInlineElements() {
    	driver.get(simpleTestPage);
    	
    	String text = driver.findElement(By.id("inlinespan")).getText();
    	
    	assertThat(text, is("line has text"));
    }

}
