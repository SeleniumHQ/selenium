package org.openqa.selenium.support.events;

import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.interactions.internal.Coordinates;

public interface WebDriverInputDeviceEventListener extends WebDriverEventListener {

    /**
     * Called before {@link Actions#keyDown(org.openqa.selenium.Keys)} (or)
     * {@link Actions#keyDown(org.openqa.selenium.WebElement, org.openqa.selenium.Keys)}.
     */
    void beforePressKey(CharSequence... keysToSend);

    /**
     * Called after {@link Actions#keyDown(org.openqa.selenium.Keys)} (or)
     * {@link Actions#keyDown(org.openqa.selenium.WebElement, org.openqa.selenium.Keys)}
     */
    void afterPressKey(CharSequence... keysToSend);

    /**
     * Called before {@link Actions#keyUp(org.openqa.selenium.Keys)} (or)
     * {@link Actions#keyUp(org.openqa.selenium.WebElement, org.openqa.selenium.Keys)}
     */
    void beforeReleaseKey(CharSequence... keysToSend);

    /**
     * Called after {@link Actions#keyUp(org.openqa.selenium.Keys)} (or)
     * {@link Actions#keyUp(org.openqa.selenium.WebElement, org.openqa.selenium.Keys)}
     */
    void afterReleaseKey(CharSequence... keysToSend);

    /**
     * Called before {@link Actions#sendKeys(CharSequence...)} (or)
     * {@link Actions#sendKeys(org.openqa.selenium.WebElement, CharSequence...)}
     */
    void beforeSendKeys(CharSequence... keysToSend);

    /**
     * Called after {@link Actions#sendKeys(CharSequence...)} (or)
     * {@link Actions#sendKeys(org.openqa.selenium.WebElement, CharSequence...)}
     * 
     */
    void afterSendKeys(CharSequence... keysToSend);

    /**
     * Called before {@link Actions#click()} (or) {@link Actions#click(org.openqa.selenium.WebElement)} .
     */
    void beforeClick(Coordinates where);

    /**
     * Called after {@link Actions#click()} (or) {@link Actions#click(org.openqa.selenium.WebElement)} .
     */
    void afterClick(Coordinates where);

    /**
     * Called before {@link Actions#doubleClick()} (or) {@link Actions#doubleClick(org.openqa.selenium.WebElement)}
     */
    void beforeDoubleClick(Coordinates where);

    /**
     * Called after {@link Actions#doubleClick()} (or) {@link Actions#doubleClick(org.openqa.selenium.WebElement)}
     */
    void afterDoubleClick(Coordinates where);

    /**
     * Called before {@link Actions#clickAndHold()} (or) {@link Actions#clickAndHold(org.openqa.selenium.WebElement)}
     */
    void beforeMouseDown(Coordinates where);

    /**
     * Called after {@link Actions#clickAndHold()} (or) {@link Actions#clickAndHold(org.openqa.selenium.WebElement)}
     */
    void afterMouseDown(Coordinates where);

    /**
     * Called before {@link Actions#release()} (or) {@link Actions#release(org.openqa.selenium.WebElement)}
     */
    void beforeMouseUp(Coordinates where);

    /**
     * Called after {@link Actions#release()} (or) {@link Actions#release(org.openqa.selenium.WebElement)}
     */
    void afterMouseUp(Coordinates where);

    /**
     * Called before {@link Actions#moveToElement(org.openqa.selenium.WebElement)}
     */
    void beforeMouseMove(Coordinates where);

    /**
     * Called after {@link Actions#moveToElement(org.openqa.selenium.WebElement)}
     */
    void afterMouseMove(Coordinates where);

    /**
     * Called before {@link Actions#moveToElement(org.openqa.selenium.WebElement, int, int)}
     * 
     */
    void beforeMouseMove(Coordinates where, long xOffset, long yOffset);

    /**
     * Called after {@link Actions#moveToElement(org.openqa.selenium.WebElement, int, int)}
     * 
     */
    void afterMouseMove(Coordinates where, long xOffset, long yOffset);

    /**
     * Called before {@link Actions#contextClick()} (or) {@link Actions#contextClick(org.openqa.selenium.WebElement)}
     */
    void beforeContextClick(Coordinates where);

    /**
     * Called after {@link Actions#contextClick()} (or) {@link Actions#contextClick(org.openqa.selenium.WebElement)}
     * 
     */
    void afterContextClick(Coordinates where);

}
