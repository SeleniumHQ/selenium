package org.openqa.selenium;

/**
 * Indicates that a driver can execute Javascript, providing access to the mechanism to do so.
 */
public interface JavascriptExecutor {
    /**
   * Execute javascript in the context of the currently selected frame or window. This means that
     * "document" will refer to the current document. If the script has a return value, then the
     * following steps will be taken:
     *
     * <ul> <li>For an HTML element, this method returns a WebElement</li> <li>For a number, a Long is
     * returned</li> <li>For a boolean, a Boolean is returned</li> <li>For all other cases, a String is
     * returned.</li> <li>For an array, we check the first element, and attempt to return a List of
     * that type, following the rules above. We do not support nested lists.</li> <li>Unless the value
     * is null or there is no return value</li> </ul>
     *
     * @return One of Boolean, Long, String, List or WebElement. Or null.
     */
    Object executeScript(String script);
}
