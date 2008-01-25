package com.googlecode.webdriver;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

import java.util.List;

public class XPathElementFindingTest extends AbstractDriverTestCase {
    public void testShouldThrowAnExceptionWhenThereIsNoLinkToClickAndItIsFoundWithXPath() {
        driver.get(xhtmlTestPage);
        
        try {
        	driver.findElement(By.xpath("//a[@id='Not here']"));
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
    
    public void testShouldFindSingleElementByXPath() {
        driver.get(xhtmlTestPage);
        WebElement element = driver.findElement(By.xpath("//h1"));
        assertThat(element.getText(), equalTo("XHTML Might Be The Future"));
    }

    @Ignore(value = "safari", reason = "Test fails")
    public void testShouldFindElementsByXPath() {
        driver.get(xhtmlTestPage);
        List<WebElement> divs = driver.findElements(By.xpath("//div"));
        assertThat(divs.size(), equalTo(3));
    }

    @Ignore(value = "safari", reason = "Test fails")
    public void testShouldBeAbleToFindManyElementsRepeatedlyByXPath() {
        driver.get(xhtmlTestPage);
        String xpathString = "//node()[contains(@id,'id')]";
        assertThat(driver.findElements(By.xpath(xpathString)).size(), equalTo(3));

        xpathString = "//node()[contains(@id,'nope')]";
        assertThat(driver.findElements(By.xpath(xpathString)).size(), equalTo(0));
    }
    
    public void testShouldBeAbleToIdentifyElementsByClass() {
        driver.get(xhtmlTestPage);

        String header = driver.findElement(By.xpath("//h1[@class='header']")).getText();
        assertThat(header, equalTo("XHTML Might Be The Future"));
    }
}
