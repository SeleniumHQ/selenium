package com.thoughtworks.selenium;

/**
 * This interface represents the Selenium Javascript API. When the Selenium API
 * changes, new functions can be supported by simply adding more methods here.
 *
 * To Create an instance of a Browser, see {@link Selenium}.
 *
 * @see Selenium
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public interface Browser {
    String open(String url);
    void click(String element);
    void click(String element, String waitOrNoWait);
    void onclick(String element);
    void onclick(String element, String waitOrNoWait);
    void type(String element, String value);
    void selectWindow(String windowId);
    void storeValue(String variableName);
    void pause(long millisaconds);
    void verifyLocation(String url);
    void verifyValue(String elementId, String expectedValue);
    void verifyText(String elementId, String expectedValue);
    void verifyTextPresent(String expectedValue);
    void verifyElementPresent(String elementId);
    void verifyElementNotPresent(String elementId);
    void verifyTable(String tableId, int col, int row, String expectedValue);
}
