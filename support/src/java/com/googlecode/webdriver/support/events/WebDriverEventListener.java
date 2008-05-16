package com.googlecode.webdriver.support.events;

import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.By;
import com.googlecode.webdriver.SearchContext;

/**
 * @author Michael Tamm
 */
public interface WebDriverEventListener {

    /**
     * Called before {@link WebDriver#get WebDriver.get(String url)}
     * respectively {@link WebDriver.Navigation#to WebDriver.navigate().to(String url)}.
     */
    void beforeNavigateTo(String url, WebDriver driver);

    /**
     * Called after {@link WebDriver#get WebDriver.get(String url)}
     * respectively {@link WebDriver.Navigation#to WebDriver.navigate().to(String url)}.
     * Not called, if an exception is thrown.
     */
    void afterNavigateTo(String url, WebDriver driver);

    /**
     * Called before {@link WebDriver.Navigation#back WebDriver.navigate().back()}.
     */
    void beforeNavigateBack(WebDriver driver);

    /**
     * Called after {@link WebDriver.Navigation#back WebDriver.navigate().back()}.
     * Not called, if an exception is thrown.
     */
    void afterNavigateBack(WebDriver driver);

    /**
     * Called before {@link WebDriver.Navigation#forward WebDriver.navigate().forward()}.
     */
    void beforeNavigateForward(WebDriver driver);

    /**
     * Called after {@link WebDriver.Navigation#forward WebDriver.navigate().forward()}.
     * Not called, if an exception is thrown.
     */
    void afterNavigateForward(WebDriver driver);

    /**
     * Called before {@link WebDriver#findElement WebDriver.findElement(...)}
     * or {@link WebDriver#findElements WebDriver.findElements(...)}.
     */
    void beforeFindBy(By by, WebDriver driver);

    /**
     * Called before {@link WebElement#findElement(com.googlecode.webdriver.By)}
     * or {@link WebElement#findElements(com.googlecode.webdriver.By)} }.
     */
    void beforeFindBy(By by, WebElement element);

    /**
     * Called after {@link WebDriver#findElement WebDriver.findElement(...)}
     * or {@link WebDriver#findElements WebDriver.findElements(...)}.
     * Not called, if an exception is thrown.
     */
    void afterFindBy(By by, WebDriver driver);

    /**
     * Called after {@link WebElement#findElement(com.googlecode.webdriver.By)}
     * or {@link WebElement#findElements(com.googlecode.webdriver.By)} }.
     */
    void afterFindBy(By by, WebElement element);

    /**
     * Called before {@link WebElement#click WebElement.click()}.
     */
    void beforeClickOn(WebElement element, WebDriver driver);

    /**
     * Called after {@link WebElement#click WebElement.click()}.
     * Not called, if an exception is thrown.
     */
    void afterClickOn(WebElement element, WebDriver driver);

    /**
     * Called before {@link WebElement#clear WebElement.clear()},
     * {@link WebElement#sendKeys WebElement.sendKeys(...)}, or
     * {@link WebElement#toggle WebElement.toggle()}.
     */
    void beforeChangeValueOf(WebElement element, WebDriver driver);

    /**
     * Called after {@link WebElement#clear WebElement.clear()},
     * {@link WebElement#sendKeys WebElement.sendKeys(...)}, or
     * {@link WebElement#toggle WebElement.toggle()}.
     * Not called, if an exception is thrown.
     */
    void afterChangeValueOf(WebElement element, WebDriver driver);

}
