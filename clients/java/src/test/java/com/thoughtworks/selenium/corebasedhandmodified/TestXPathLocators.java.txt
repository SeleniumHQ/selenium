package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * @author XlateHtmlSeleneseToJava
 * Generated from C:\svn\selenium\rc\trunk\clients\java\target\selenium-server\tests/TestXPathLocators.html.
 */
public class TestXPathLocators extends SeleneseTestCase
{
   public void testXPathLocators() throws Throwable {
        try {
            

/* Test XPath Locators */
            // open|../tests/html/test_locators.html|
            selenium.open("/selenium-server/tests/html/test_locators.html");
            // verifyText|xpath=//a|this is the first element
            verifyEquals("this is the first element", selenium.getText("xpath=//a"));
            // verifyText|xpath=//a[@class='a2']|this is the second element
            verifyEquals("this is the second element", selenium.getText("xpath=//a[@class='a2']"));
            // verifyText|xpath=//*[@class='a2']|this is the second element
            verifyEquals("this is the second element", selenium.getText("xpath=//*[@class='a2']"));
            // verifyText|xpath=//a[2]|this is the second element
            verifyEquals("this is the second element", selenium.getText("xpath=//a[2]"));
            // verifyText|xpath=//a[position()=2]|this is the second element
            verifyEquals("this is the second element", selenium.getText("xpath=//a[position()=2]"));

            boolean sawThrow9 = false;
            try {
                // originally verifyElementNotPresent|xpath=//a[@href='foo']|
                        assertTrue(!selenium.isElementPresent("xpath=//a[@href='foo']"));
            }
            catch (Throwable e) {
                sawThrow9 = true;
            }
            verifyFalse(sawThrow9);
            
            // verifyAttribute|xpath=//a[contains(@href,'#id1')]/@class|a1
            verifyEquals("a1", selenium.getAttribute("xpath=//a[contains(@href,'#id1')]/@class"));

            boolean sawThrow11 = false;
            try {
                // originally verifyElementPresent|xpath=//a[text()="this is the${nbsp}third element"]|
                        assertTrue(selenium.isElementPresent("xpath=//a[text()=\"this is the\u00a0third element\"]"));
            }
            catch (Throwable e) {
                sawThrow11 = true;
            }
            verifyFalse(sawThrow11);
            
            // verifyText|//a|this is the first element
            verifyEquals("this is the first element", selenium.getText("//a"));
            // verifyAttribute|//a[contains(@href,'#id1')]/@class|a1
            verifyEquals("a1", selenium.getAttribute("//a[contains(@href,'#id1')]/@class"));
            // verifyText|xpath=(//table[@class='stylee'])//th[text()='theHeaderText']/../td|theCellText
            verifyEquals("theCellText", selenium.getText("xpath=(//table[@class='stylee'])//th[text()='theHeaderText']/../td"));
            // click|//input[@name='name2' and @value='yes']|
            selenium.click("//input[@name='name2' and @value='yes']");

/* test for SEL-242 */

            boolean sawThrow18 = false;
            try {
                // originally verifyElementPresent|xpath=//*[text()="right"]|
                        assertTrue(selenium.isElementPresent("xpath=//*[text()=\"right\"]"));
            }
            catch (Throwable e) {
                sawThrow18 = true;
            }
            verifyFalse(sawThrow18);
            

/* test for SEL-444 */
            // verifyValue|xpath=//div[@id='nested1']/div[1]//input[2]|nested3b
            verifyEquals("nested3b", selenium.getValue("xpath=//div[@id='nested1']/div[1]//input[2]"));

/* test for SEL-486 and assignId */
            // verifyValue|xpath=id('nested1')/div[1]//input[2]|nested3b
            verifyEquals("nested3b", selenium.getValue("xpath=id('nested1')/div[1]//input[2]"));
            // verifyValue|xpath=id('anotherNested')//div[contains(@id, 'useful')]//input|winner
            verifyEquals("winner", selenium.getValue("xpath=id('anotherNested')//div[contains(@id, 'useful')]//input"));
            // assignId|xpath=//*[text()="right"]|rightButton
            selenium.assignId("xpath=//*[text()=\"right\"]", "rightButton");

            boolean sawThrow27 = false;
            try {
                // originally verifyElementPresent|rightButton|
                        assertTrue(selenium.isElementPresent("rightButton"));
            }
            catch (Throwable e) {
                sawThrow27 = true;
            }
            verifyFalse(sawThrow27);
            

/* xpath counting */
            // verifyXpathCount|id('nested1')/div[1]//input|2
            assertEquals(new Integer(2), selenium.getXpathCount("id(\'nested1\')/div[1]//input"));
            // verifyXpathCount|//div[@id='nonexistent']|0
            assertEquals(new Integer(0), selenium.getXpathCount("//div[@id=\'nonexistent\']"));

/* test for SEL-347 */

            boolean sawThrow34 = false;
            try {
                // originally verifyElementPresent|xpath=//a[@href="javascript:doFoo('a', 'b')"]|
                        assertTrue(selenium.isElementPresent("xpath=//a[@href=\"javascript:doFoo('a', 'b')\"]"));
            }
            catch (Throwable e) {
                sawThrow34 = true;
            }
            verifyFalse(sawThrow34);
            

/* test for SEL-492 */

            boolean sawThrow37 = false;
            try {
                // originally verifyElementNotPresent|xpath=id('foo')//applet|
                        assertTrue(!selenium.isElementPresent("xpath=id('foo')//applet"));
            }
            catch (Throwable e) {
                sawThrow37 = true;
            }
            verifyFalse(sawThrow37);
            

            boolean sawThrow38 = false;
            try {
                            assertTrue(selenium.isElementPresent("xpath=//a["));
            }
            catch (Throwable e) {
                sawThrow38 = true;
            }
            verifyTrue(sawThrow38);
            

            checkForVerificationErrors();
        }
        finally {
            clearVerificationErrors();
        }
    }
}
