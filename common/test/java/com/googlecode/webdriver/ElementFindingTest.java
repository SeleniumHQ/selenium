package com.googlecode.webdriver;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;

import java.util.List;

public class ElementFindingTest extends AbstractDriverTestCase {
    public void testShouldReturnTitleOfPageIfSet() {
        driver.get(xhtmlTestPage);
        assertThat(driver.getTitle(), equalTo(("XHTML Test Page")));

        driver.get(simpleTestPage);
        assertThat(driver.getTitle(), equalTo("Hello WebDriver"));
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

    public void testShouldThrowAnExceptionWhenThereIsNoLinkToClickAndItIsFoundWithLinkText() {
        driver.get(xhtmlTestPage);
        
        try {
        	driver.findElement(By.linkText("Not here either"));
        	fail("Should not have succeeded");
        } catch (NoSuchElementException e) {
        	// this is expected
        }
    }

    @Ignore("safari")
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
    
    @Ignore("safari")
    public void testShouldBeAbleToFindChildrenOfANode() {
        driver.get(xhtmlTestPage);
        List<WebElement> elements = driver.findElements(By.xpath("/html/head"));
        WebElement head = elements.get(0);
        List<WebElement> importedScripts = head.getChildrenOfType("script");
        assertThat(importedScripts.size(), equalTo(2));
    }
}
