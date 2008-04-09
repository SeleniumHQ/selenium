package com.googlecode.webdriver;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

import java.io.FileInputStream;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.jaxen.JaxenException;
import org.jaxen.Navigator;
import org.jaxen.XPath;
import org.jaxen.dom.DOMXPath;
import org.w3c.dom.Node;
import org.xml.sax.InputSource;

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
    
    public void testShouldBeAbleToSearchForMultipleAttributes() throws Exception {
//    	DocumentBuilderFactory factory 
//        = DocumentBuilderFactory.newInstance();
//       factory.setNamespaceAware(true);   
//       DocumentBuilder builder = factory.newDocumentBuilder();    
//       
//       InputSource data = new InputSource(new FileInputStream("/work/webdriver/common/src/web/formPage.html"));
//       Node doc = builder.parse(data);
//       
//       // There are different XPath classes in different packages
//       // for the different APIs Jaxen supports
//       XPath expression = new DOMXPath("//input[@type = 'submit' and @value = 'Click!']");
////       Navigator navigator = expression.getNavigator();
//    	
//       Object singleNode = expression.selectSingleNode(doc);
//       assertNotNull(singleNode);
//       System.out.println(((Node) singleNode).getNodeValue());
//       
    	driver.get(formPage);
    	
//    	driver.findElement(By.xpath("//form[@name='optional']"));
//    	driver.findElement(By.xpath("//form[@name='optional']/input[@type='submit']"));
    	
    	try {
    		
    		driver.findElement(By.xpath("//form[@name='optional']/input[@type='submit' and @value='Click!']")).click();
    	} catch (NoSuchElementException e) {
    		fail("Should be able to find the submit button");
    	}
    }
}
