package org.openqa.selenium;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

import java.util.List;

public class ChildrenFindingTest extends AbstractDriverTestCase {
    @Ignore("ie, safari")
    public void testFindElementByXPath() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("form2"));
        WebElement child = element.findElement(By.xpath("select"));
        assertThat(child.getAttribute("id"),  is("2"));
    }
    
    @Ignore("ie, safari")
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

    @Ignore("ie, safari")
    public void testfindElementsByXPath() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("form2"));
        List<WebElement> children = element.findElements(By.xpath("select/option"));
        assertThat(children.size(), is(8));
        assertThat(children.get(0).getText(), is("One"));
        assertThat(children.get(1).getText(), is("Two"));
    }
    
    @Ignore("ie, safari")
    public void testfindElementsByXPathWhenNoMatch() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("form2"));
        List<WebElement> children = element.findElements(By.xpath("select/x"));
        assertEquals(0, children.size());
    }

    @Ignore("ie, safari")
    public void testfindElementByName() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("form2"));
        WebElement child = element.findElement(By.name("selectomatic"));
        assertThat(child.getAttribute("id"),  is("2"));
    }

    @Ignore("ie, safari")
    public void testfindElementsByName() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("form2"));
        List<WebElement> children = element.findElements(By.name("selectomatic"));
        assertThat(children.size(),  is(2));
    }

    @Ignore("safari")
    public void testfindElementById() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("form2"));
        WebElement child = element.findElement(By.id("2"));
        assertThat(child.getAttribute("name"),  is("selectomatic"));
    }
    
    @Ignore("safari")
    public void testfindElementByIdWhenMultipleMatchesExist() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.id("test_id_div"));
        WebElement child = element.findElement(By.id("test_id"));
        assertThat(child.getText(),  is("inside"));
    }
    
    @Ignore("safari")
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

    @Ignore("ie, safari")
    public void testfindElementsById() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("form2"));
        List<WebElement> children = element.findElements(By.id("2"));
        assertThat(children.size(), is(2));
    }

    @Ignore("ie, safari")
    public void testfindElementByLinkText() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("div1"));
        WebElement child = element.findElement(By.linkText("hello world"));
        assertThat(child.getAttribute("href"),  is("2.html"));
    }

    @Ignore("ie, safari")
    public void testfindElementsByLinkText() {
        driver.get(nestedPage);
        WebElement element = driver.findElement(By.name("div1"));
        List<WebElement> children = element.findElements(
                By.linkText("hello world"));
        assertThat(children.size(), is(2));
    }
}
