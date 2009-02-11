/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;

import static org.openqa.selenium.Ignore.Driver.*;

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

    @Ignore(SAFARI)
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
    
    @Ignore(SAFARI)
    public void testShouldBeAbleToFindChildrenOfANode() {
        driver.get(xhtmlTestPage);
        List<WebElement> elements = driver.findElements(By.xpath("/html/head"));
        WebElement head = elements.get(0);
        List<WebElement> importedScripts = head.findElements(By.tagName("script"));
        assertThat(importedScripts.size(), equalTo(2));
    }

    @Ignore(SAFARI)
    public void testReturnAnEmptyListWhenThereAreNoChildrenOfANode() {
        driver.get(xhtmlTestPage);
        WebElement table = driver.findElement(By.id("table"));
        List<WebElement> rows = table.findElements(By.tagName("tr"));

        assertThat(rows.size(), equalTo(0));
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
    
    @Ignore(SAFARI)
    public void testShouldBeAbleToFindMultipleElementsByXPath() {
    	driver.get(xhtmlTestPage);
    	
    	List<WebElement> elements = driver.findElements(By.xpath("//div"));
    	
    	assertTrue(elements.size() > 1);
    }
    
    @Ignore(SAFARI)
    public void testShouldBeAbleToFindMultipleElementsByLinkText() {
    	driver.get(xhtmlTestPage);
    	
    	List<WebElement> elements = driver.findElements(By.linkText("click me"));
    	
    	assertTrue("Expected 2 links, got " + elements.size(), elements.size() == 2);
    }

    @Ignore({IE, REMOTE, SAFARI})
    public void testShouldBeAbleToFindMultipleElementsByPartialLinkText() {
    	driver.get(xhtmlTestPage);

    	List<WebElement> elements = driver.findElements(By.partialLinkText("ick me"));

    	assertTrue(elements.size() == 2);
    }

    @Ignore({IE, REMOTE, SAFARI})
    public void testShouldBeAbleToFindElementByPartialLinkText() {
    	driver.get(xhtmlTestPage);

      try {
        driver.findElement(By.partialLinkText("anon"));
      } catch (NoSuchElementException e) {
        fail("Expected element to be found");
      }
    }
    
    @Ignore(SAFARI)
    public void testShouldBeAbleToFindMultipleElementsByName() {
    	driver.get(nestedPage);
    	
    	List<WebElement> elements = driver.findElements(By.name("checky"));
    	
    	assertTrue(elements.size() > 1);
    }

    @Ignore({FIREFOX, SAFARI})
    public void testShouldBeAbleToFindMultipleElementsById() {
    	driver.get(nestedPage);
    	
    	List<WebElement> elements = driver.findElements(By.id("2"));
    	
    	assertTrue(elements.size() > 1);
    }
    
    @Ignore(SAFARI)
    public void testShouldBeAbleToFindMultipleElementsByClassName() {
    	driver.get(xhtmlTestPage);
    	
    	List<WebElement> elements = driver.findElements(By.className("nameC"));
    	
    	assertTrue(elements.size() > 1);
    }

    @Ignore(SAFARI)
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

    @Ignore(SAFARI)
    public void testShouldFindGrandChildren() {
        driver.get(formPage);
        WebElement form = driver.findElement(By.id("nested_form"));
        form.findElement(By.name("x"));
    }


    @Ignore(SAFARI)
    public void testShouldNotFindElementOutSideTree() {
        driver.get(formPage);
        WebElement element = driver.findElement(By.name("login"));
        try {
            element.findElement(By.name("x"));
        } catch (NoSuchElementException e) {
            // this is expected
        }
    }
    
    @Ignore(SAFARI)
    public void testShouldReturnElementsThatDoNotSupportTheNameProperty() {
    	driver.get(nestedPage);
    	
    	driver.findElement(By.name("div1"));
    	// If this works, we're all good
    }

    public void testShouldFindHiddenElementsByName() {
        driver.get(formPage);

        try {
            driver.findElement(By.name("hidden"));
        } catch (NoSuchElementException e) {
            fail("Expected to be able to find hidden element");
        }
    }

  @Ignore(SAFARI)
  public void testShouldfindAnElementBasedOnTagName() {
    driver.get(formPage);

    WebElement element = driver.findElement(By.tagName("input"));

    assertNotNull(element);
  }

  @Ignore(SAFARI)
  public void testShouldfindElementsBasedOnTagName() {
    driver.get(formPage);

    List<WebElement> elements = driver.findElements(By.tagName("input"));

    assertNotNull(elements);
  }
}
