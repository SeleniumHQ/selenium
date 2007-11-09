package com.thoughtworks.webdriver;

import java.awt.Dimension;
import java.awt.Point;

public interface RenderedWebElement extends WebElement {
    /**
     * Is this element displayed or not? This method avoids the problem of having
     * to parse an element's "style" attribute.
     *
     * @return Whether or not the element is displayed
     */
    boolean isDisplayed();

    /**
     * Where on the page is the top left-hand corner of the rendered element?
     *
     * @return A point, containing the location of the top left-hand corner of the element
     */
      public Point getLocation();

    /**
     * What is the width and height of the rendered element?
     *
     * @return The size of the element on the page.
     */
      public Dimension getSize();
}
