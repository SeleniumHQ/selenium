package com.thoughtworks.selenium.embedded.jetty;

import org.mortbay.jetty.servlet.ServletHttpContext;

/**
 * @author Paul Hammant
 * @version $Revision: 1.1 $
 */
public class SeleniumApplicationContentHandler implements StaticContentHandler {
    private String seleniumApplicationRoot;

    public SeleniumApplicationContentHandler(String seleniumApplicationRoot) {
        this.seleniumApplicationRoot = seleniumApplicationRoot;
    }

    public void addStaticContent(ServletHttpContext context) {

    }
}
