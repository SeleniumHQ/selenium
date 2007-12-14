package com.thoughtworks.webdriver.safari;

import com.thoughtworks.webdriver.By;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;
import com.thoughtworks.webdriver.NoSuchElementException;
import com.thoughtworks.webdriver.internal.FindsByLinkText;
import com.thoughtworks.webdriver.internal.FindsById;
import com.thoughtworks.webdriver.internal.FindsByXPath;

import java.util.List;
import java.util.ArrayList;

public class SafariDriver implements WebDriver, FindsByLinkText, FindsById, FindsByXPath {
    protected final static String ELEMENTS = "document.webdriverElements";
    private AppleScript appleScript;

    public SafariDriver() {
        appleScript = new AppleScript();
        appleScript.executeApplescript("tell application \"" + AppleScript.APP + "\"\ractivate\rend tell");
        appleScript.executeJavascript("if (!" + ELEMENTS + ") { " + ELEMENTS + " = new Array(); }");
    }

    // Navigation
    public WebDriver get(String url) {
        appleScript.executeApplescript("tell application \"" + AppleScript.APP + "\"\rset URL in document 1 to \"" + url + "\"\rend tell");
        waitForLoadToComplete();
        
        return this;
    }

    public String getCurrentUrl() {
        return appleScript.executeJavascript("return document.location");
    }

    public String getTitle() {
        return appleScript.executeJavascript("return document.title");
    }

    public boolean getVisible() {
        return true;
    }

    public WebDriver setVisible(boolean visible) {
        return this;
    }

    public List<WebElement> findElements(By by) {
        return by.findElements(this);
    }

    public WebElement findElement(By by) {
        return by.findElement(this);
    }

    public String getPageSource() {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    public WebDriver close() {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    public TargetLocator switchTo() {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    public Navigation navigate() {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    public void waitForLoadToComplete() {
        while (!"complete".equals(appleScript.executeJavascript("return document.readyState"))) {
            try {
                Thread.sleep(200);
            } catch (InterruptedException e) {
                // Do nothing
            }
        }
    }

    public WebElement findElementByLinkText(String using) {
        String res = appleScript.executeJavascript(
                "for (var i = 0; i < document.links.length; i++) {\r" +
                "  var element = document.links[i];\r" +
                "  if (element.text == '" + using +"') {\r" +
                addToElements() +
                "  }\r" +
                "} return \"No element found\";");

        if (!"No element found".equals(res)) {
            return new SafariWebElement(this, res);
        }

        throw new NoSuchElementException("Cannot find element with link text: " + using);
    }

    public List<WebElement> findElementsByLinkText(String using) {
        return null;
    }


    public WebElement findElementById(String using) {
        String id = appleScript.executeJavascript(
                "var element = document.getElementById(\"" + using + "\");" +
                 addToElements()
                );

        if (!"No element found".equals(id)) {
            return new SafariWebElement(this, id);
        }

        throw new NoSuchElementException("Cannot find element with id: " + using);
    }

    public List<WebElement> findElementsById(String using) {
        throw new UnsupportedOperationException("findElementsById");
    }


    public WebElement findElementByXPath(String using) {
        String result = appleScript.executeJavascript(
                "var element = document.evaluate(\"" + using + "\", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE,  null).singleNodeValue;\r" +
                addToElements());


        if (!"No element found".equals(result)) {
            return new SafariWebElement(this, result);
        }

        throw new NoSuchElementException("Cannot find element using xpath: " + using);
    }

    public List<WebElement> findElementsByXPath(String using) {
        String result = appleScript.executeJavascript(
            "var result = document.evaluate(\"" + using + "\", document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE,  null).singleNodeValue;\r" +
            "var elements = new Array();\r" +
            "var element = result.iterateNext();\r" +
            "while (element) {" +
            "  elements.push(element);\r" +
            "  element = result.iterateNext();\r" +
            "}\r" +
            addManyElements()
        );

        String[] ids = result.split(" ");
        List<WebElement> toReturn = new ArrayList<WebElement>();
        for (String id : ids)
            toReturn.add(new SafariWebElement(this, id));
        return toReturn;
    }

    private String addToElements()  {
        return "if (element) { " +
               "    if (!" + ELEMENTS + ")\r" +
               "      " + ELEMENTS + " = new Array();\r" +
               "    return " + ELEMENTS + ".push(element) - 1;\r" +
               "} return \"No element found\"";
    }

    private String addManyElements() {
        return "var toReturn = \"\"\r" +
        "for (var i = 0; i < elements.length; i++) {\r" +
        "  toReturn += (" + ELEMENTS + ".push(elements[i]) - 1) + \" \"\r" +
        "}\r" +
        "return toReturn;";

    }
}
