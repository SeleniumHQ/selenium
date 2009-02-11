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
import static org.hamcrest.Matchers.is;
import static org.openqa.selenium.Ignore.Driver.*;

import java.util.List;

public class ChildrenFindingTest extends AbstractDriverTestCase {
    @Ignore(SAFARI)
    public void testFindElementByXPath() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("form2"));
        WebElement child = element.findElement(By.xpath("select"));
        assertThat(child.getAttribute("id"),  is("2"));
    }
    
    @Ignore(SAFARI)
    public void testFindElementByXPathWhenNoMatch() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("form2"));
        try {
        	element.findElement(By.xpath("select/x"));
        } catch (NoSuchElementException e) {
        	return;
        }
        fail();
    }

    @Ignore(SAFARI)
    public void testfindElementsByXPath() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("form2"));
        List<WebElement> children = element.findElements(By.xpath("select/option"));
        assertThat(children.size(), is(8));
        assertThat(children.get(0).getText(), is("One"));
        assertThat(children.get(1).getText(), is("Two"));
    }
    
    @Ignore(SAFARI)
    public void testfindElementsByXPathWhenNoMatch() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("form2"));
        List<WebElement> children = element.findElements(By.xpath("select/x"));
        assertEquals(0, children.size());
    }

    @Ignore(SAFARI)
    public void testfindElementByName() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("form2"));
        WebElement child = element.findElement(By.name("selectomatic"));
        assertThat(child.getAttribute("id"),  is("2"));
    }

    @Ignore(SAFARI)
    public void testfindElementsByName() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("form2"));
        List<WebElement> children = element.findElements(By.name("selectomatic"));
        assertThat(children.size(),  is(2));
    }

    @Ignore(SAFARI)
    public void testfindElementById() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("form2"));
        WebElement child = element.findElement(By.id("2"));
        assertThat(child.getAttribute("name"),  is("selectomatic"));
    }
    
    @Ignore(SAFARI)
    public void testfindElementByIdWhenMultipleMatchesExist() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.id("test_id_div"));
        WebElement child = element.findElement(By.id("test_id"));
        assertThat(child.getText(),  is("inside"));
    }
    
    @Ignore(SAFARI)
    public void testfindElementByIdWhenNoMatchInContext() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.id("test_id_div"));
        try {
        	element.findElement(By.id("test_id_out"));
        } catch (NoSuchElementException e) {
        	return;
        }
        fail();
    }

    @Ignore(SAFARI)
    public void testfindElementsById() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("form2"));
        List<WebElement> children = element.findElements(By.id("2"));
        assertThat(children.size(), is(2));
    }

    @Ignore(SAFARI)
    public void testFindElementByLinkText() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("div1"));
        WebElement child = element.findElement(By.linkText("hello world"));
        assertThat(child.getAttribute("name"),  is("link1"));
    }

    @Ignore(SAFARI)
    public void testFindElementsByLinkTest() {
    	driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("div1"));
        List<WebElement> elements = element.findElements(By.linkText("hello world"));
        
        assertEquals(2, elements.size());
        assertThat(elements.get(0).getAttribute("name"),  is("link1"));
        assertThat(elements.get(1).getAttribute("name"),  is("link2"));
    }
    
    @Ignore(SAFARI)
    public void testfindElementsByLinkText() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("div1"));
        List<WebElement> children = element.findElements(
                By.linkText("hello world"));
        assertThat(children.size(), is(2));
    }

    @Ignore({IE, SAFARI})
    public void testShouldFindChildElementsByClassName() {
        driver.get(nestedPage);
        WebElement parent = driver.findElement(By.name("classes"));

        WebElement element = parent.findElement(By.className("one"));

        assertEquals("Find me", element.getText());
    }

    @Ignore({IE, SAFARI})
    public void testShouldFindChildrenByClassName() {
        driver.get(nestedPage);
        WebElement parent = driver.findElement(By.name("classes"));

        List<WebElement> elements = parent.findElements(By.className("one"));

        assertEquals(2, elements.size());
    }

  @Ignore({SAFARI})
  public void testShouldFindChildElementsByTagName() {
    driver.get(nestedPage);
    WebElement parent = driver.findElement(By.name("div1"));

    WebElement element = parent.findElement(By.tagName("a"));

    assertEquals("link1", element.getAttribute("name"));
  }

  @Ignore({SAFARI})
  public void testShouldFindChildrenByTagName() {
    driver.get(nestedPage);
    WebElement parent = driver.findElement(By.name("div1"));

    List<WebElement> elements = parent.findElements(By.tagName("a"));

    assertEquals(2, elements.size());
  }
}
