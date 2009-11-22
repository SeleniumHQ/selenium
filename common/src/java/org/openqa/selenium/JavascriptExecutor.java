/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium;

/**
 * Indicates that a driver can execute Javascript, providing access to the mechanism to do so.
 */
public interface JavascriptExecutor {
    /**
     * Execute javascript in the context of the currently selected frame or
     * window. This means that "document" will refer to the current document.
     * If the script has a return value, then the following steps will be taken:
     *
     * <ul> <li>For an HTML element, this method returns a WebElement</li>
     * <li>For a number, a Long is returned</li>
     * <li>For a boolean, a Boolean is returned</li>
     * <li>For all other cases, a String is returned.</li>
     * <li>For an array, return a List&lt;Object&gt; with each object
     * following the rules above.  We support nested lists.</li>
     * <li>Unless the value is null or there is no return value,
     * in which null is returned</li> </ul>
     *
     * <p>Arguments must be a number, a boolean, a String, WebElement,
     * or a List of any combination of the above. An exception will be
     * thrown if the arguments do not meet these criteria. The arguments
     * will be made available to the javascript via the "arguments" magic
     * variable, as if the function were called via "Function.apply"
     *
     * @param script The javascript to execute
     * @param args The arguments to the script. May be empty
     * @return One of Boolean, Long, String, List or WebElement. Or null.
     */
    Object executeScript(String script, Object... args);

    /**
     * It's not enough to simply support javascript, it also needs to be enabled too.
     */
      boolean isJavascriptEnabled();
}
