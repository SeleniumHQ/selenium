package org.openqa.selenium.support.ui;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.internal.WrapsElement;

public class ContextInfo {

    /**
     * Get driver reference for the specified search context
     * @param context search context (WebDriver, WebElement, or PageComponent)
     * @return WebDriver associated with the specified search context
     */
    public static WebDriver getDriver(SearchContext context) {
        if (context instanceof WebDriver) {
            return (WebDriver) context;
        } else if (context instanceof WrapsDriver) {
            return ((WrapsDriver) context).getWrappedDriver();
        } else if (context instanceof WrapsElement) {
            return ((WrapsDriver) ((WrapsElement) context).getWrappedElement()).getWrappedDriver();
        }
        throw new IllegalArgumentException("Driver could not be extracted from the specified context");
    }
    
    /**
     * Get driver capabilities for the specified search context
     * @param context search context (WebDriver, WebElement, or PageComponent)
     * @return Capabilities associated with the specified search context
     */
    public static Capabilities getCapabilities(SearchContext context) {
        WebDriver driver = getDriver(context);
        if (driver instanceof HasCapabilities) {
            return ((HasCapabilities) driver).getCapabilities();
        }
        throw new IllegalArgumentException("Capabilities could not be extracted from the specified context");
    }

}
