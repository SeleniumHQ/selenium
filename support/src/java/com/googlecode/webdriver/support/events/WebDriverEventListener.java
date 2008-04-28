package com.googlecode.webdriver.support.events;

import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.WebDriver;

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
     * Called before {@link WebElement#click WebElement.click()}.
     */
    void beforeClickOn(WebElement element, WebDriver driver);

    /**
     * Called after {@link WebElement#click WebElement.click()}.
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
     */
    void afterChangeValueOf(WebElement element, WebDriver driver);

}
