package com.googlecode.webdriver.support.events;

import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.By;
import com.googlecode.webdriver.SearchContext;

/**
 * Use this class as base class, if you want to implement
 * a {@link WebDriverEventListener} and are only interested
 * in some events. All methods provided by this class have
 * an empty method body.
 *
 * @author Michael Tamm
 */
public abstract class AbstractWebDriverEventListener implements WebDriverEventListener {

    public void beforeNavigateTo(String url, WebDriver driver) {
        // Do nothing.
    }

    public void afterNavigateTo(String url, WebDriver driver) {
        // Do nothing.
    }

    public void beforeNavigateBack(WebDriver driver) {
        // Do nothing.
    }

    public void afterNavigateBack(WebDriver driver) {
        // Do nothing.
    }

    public void beforeNavigateForward(WebDriver driver) {
        // Do nothing.
    }

    public void afterNavigateForward(WebDriver driver) {
        // Do nothing.
    }

    public void beforeFindBy(By by, WebDriver driver) {
        // Do nothing.
    }

    public void beforeFindBy(By by, WebElement element) {
        // Do nothing.
    }

    public void afterFindBy(By by, WebDriver driver) {
        // Do nothing.
    }

    public void afterFindBy(By by, WebElement element) {
        // Do nothing.
    }

    public void beforeClickOn(WebElement element, WebDriver driver) {
        // Do nothing.
    }

    public void afterClickOn(WebElement element, WebDriver driver) {
        // Do nothing.
    }

    public void beforeChangeValueOf(WebElement element, WebDriver driver) {
        // Do nothing.
    }

    public void afterChangeValueOf(WebElement element, WebDriver driver) {
        // Do nothing.
    }

}
