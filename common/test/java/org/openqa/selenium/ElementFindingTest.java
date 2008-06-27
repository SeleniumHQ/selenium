package org.openqa.selenium;

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
    public void testShouldfindAnElementBasedOnId() {
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

    public void testShouldFindElementsByName() {
        driver.get(formPage);

        WebElement element = driver.findElement(By.name("checky"));

        assertThat(element.getValue(), is("furrfu"));
    }

    public void testShouldFindElementsByClass() {
        driver.get(xhtmlTestPage);

        WebElement element = driver.findElement(By.className("extraDiv"));
        assertTrue(element.getText().startsWith("Another div starts here."));
    }

    public void testShouldFindElementsByClassWhenItIsTheFirstNameAmongMany() {
        driver.get(xhtmlTestPage);

        WebElement element = driver.findElement(By.className("nameA"));
        assertThat(element.getText(), equalTo("An H2 title"));
    }

    public void testShouldFindElementsByClassWhenItIsTheLastNameAmongMany() {
        driver.get(xhtmlTestPage);

        WebElement element = driver.findElement(By.className("nameC"));
        assertThat(element.getText(), equalTo("An H2 title"));
    }

    public void testShouldFindElementsByClassWhenItIsInTheMiddleAmongMany() {
        driver.get(xhtmlTestPage);

        WebElement element = driver.findElement(By.className("nameBnoise"));
        assertThat(element.getText(), equalTo("An H2 title"));
    }

    public void testShouldNotFindElementsByClassWhenTheNameQueriedIsShorterThanCandidateName() {
        driver.get(xhtmlTestPage);

        try {
            driver.findElement(By.className("nameB"));
            fail("Should not have succeeded");
        } catch (NoSuchElementException e) {
        	// this is expected
        }
    }
    
    @Ignore("safari")
    public void testShouldBeAbleToFindMultipleElementsByXPath() {
    	driver.get(xhtmlTestPage);
    	
    	List<WebElement> elements = driver.findElements(By.xpath("//div"));
    	
    	assertTrue(elements.size() > 1);
    }
    
    @Ignore("safari, firefox")
    public void testShouldBeAbleToFindMultipleElementsByLinkText() {
    	driver.get(xhtmlTestPage);
    	
    	List<WebElement> elements = driver.findElements(By.linkText("click me"));
    	
    	assertTrue(elements.size() == 2);
    }
    
    @Ignore("safari")
    public void testShouldBeAbleToFindMultipleElementsByName() {
    	driver.get(nestedPage);
    	
    	List<WebElement> elements = driver.findElements(By.name("checky"));
    	
    	assertTrue(elements.size() > 1);
    }

    @Ignore("safari, firefox")
    public void testShouldBeAbleToFindMultipleElementsById() {
    	driver.get(nestedPage);
    	
    	List<WebElement> elements = driver.findElements(By.id("2"));
    	
    	assertTrue(elements.size() > 1);
    }
    
    @Ignore("safari")
    public void testShouldBeAbleToFindMultipleElementsByClassName() {
    	driver.get(xhtmlTestPage);
    	
    	List<WebElement> elements = driver.findElements(By.className("nameC"));
    	
    	assertTrue(elements.size() > 1);
    }
    
    // You don't want to ask why this is here
    public void testWhenFindingByNameShouldNotReturnById() {
        driver.get(formPage);

        WebElement element = driver.findElement(By.name("id-name1"));
        assertThat(element.getValue(), is("name"));

        element = driver.findElement(By.id("id-name1"));
        assertThat(element.getValue(), is("id"));

        element = driver.findElement(By.name("id-name2"));
        assertThat(element.getValue(), is("name"));

        element = driver.findElement(By.id("id-name2"));      
        assertThat(element.getValue(), is("id"));
    }
}
