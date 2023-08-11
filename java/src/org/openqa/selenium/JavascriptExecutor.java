// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;
import org.openqa.selenium.internal.Require;

/**
 * Indicates that a driver can execute JavaScript, providing access to the mechanism to do so.
 *
 * <p>Because of cross domain policies browsers enforce your script execution may fail unexpectedly
 * and without adequate error messaging. This is particularly pertinent when creating your own XHR
 * request or when trying to access another frame. Most times when troubleshooting failure it's best
 * to view the browser's console after executing the WebDriver request.
 */
public interface JavascriptExecutor {
  /**
   * Executes JavaScript in the context of the currently selected frame or window. The script
   * fragment provided will be executed as the body of an anonymous function.
   *
   * <p>Within the script, use <code>document</code> to refer to the current document. Note that
   * local variables will not be available once the script has finished executing, though global
   * variables will persist.
   *
   * <p>If the script has a return value (i.e. if the script contains a <code>return</code>
   * statement), then the following steps will be taken:
   *
   * <ul>
   *   <li>For an HTML element, this method returns a WebElement
   *   <li>For a decimal, a Double is returned
   *   <li>For a non-decimal number, a Long is returned
   *   <li>For a boolean, a Boolean is returned
   *   <li>For all other cases, a String is returned.
   *   <li>For an array, return a List&lt;Object&gt; with each object following the rules above. We
   *       support nested lists.
   *   <li>For a map, return a Map&lt;String, Object&gt; with values following the rules above.
   *   <li>Unless the value is null or there is no return value, in which null is returned
   * </ul>
   *
   * <p>Arguments must be a number, a boolean, a String, WebElement, or a List of any combination of
   * the above. An exception will be thrown if the arguments do not meet these criteria. The
   * arguments will be made available to the JavaScript via the "arguments" magic variable, as if
   * the function were called via "Function.apply"
   *
   * @param script The JavaScript to execute
   * @param args The arguments to the script. May be empty
   * @return One of Boolean, Long, Double, String, List, Map or WebElement. Or null.
   */
  Object executeScript(String script, Object... args);

  /**
   * Execute an asynchronous piece of JavaScript in the context of the currently selected frame or
   * window. Unlike executing {@link #executeScript(String, Object...) synchronous JavaScript},
   * scripts executed with this method must explicitly signal they are finished by invoking the
   * provided callback. This callback is always injected into the executed function as the last
   * argument.
   *
   * <p>The first argument passed to the callback function will be used as the script's result. This
   * value will be handled as follows:
   *
   * <ul>
   *   <li>For an HTML element, this method returns a WebElement
   *   <li>For a number, a Long is returned
   *   <li>For a boolean, a Boolean is returned
   *   <li>For all other cases, a String is returned.
   *   <li>For an array, return a List&lt;Object&gt; with each object following the rules above. We
   *       support nested lists.
   *   <li>For a map, return a Map&lt;String, Object&gt; with values following the rules above.
   *   <li>Unless the value is null or there is no return value, in which null is returned
   * </ul>
   *
   * <p>The default timeout for a script to be executed is 0ms. In most cases, including the
   * examples below, one must set the script timeout {@link
   * WebDriver.Timeouts#scriptTimeout(java.time.Duration)} beforehand to a value sufficiently large
   * enough.
   *
   * <p>Example #1: Performing a sleep in the browser under test.
   *
   * <pre>{@code
   * long start = System.currentTimeMillis();
   * ((JavascriptExecutor) driver).executeAsyncScript(
   *     "window.setTimeout(arguments[arguments.length - 1], 500);");
   * System.out.println(
   *     "Elapsed time: " + (System.currentTimeMillis() - start));
   * }</pre>
   *
   * <p>Example #2: Synchronizing a test with an AJAX application:
   *
   * <pre>{@code
   * WebElement composeButton = driver.findElement(By.id("compose-button"));
   * composeButton.click();
   * ((JavascriptExecutor) driver).executeAsyncScript(
   *     "var callback = arguments[arguments.length - 1];" +
   *     "mailClient.getComposeWindowWidget().onload(callback);");
   * driver.switchTo().frame("composeWidget");
   * driver.findElement(By.id("to")).sendKeys("bog@example.com");
   * }</pre>
   *
   * <p>Example #3: Injecting a XMLHttpRequest and waiting for the result:
   *
   * <pre>{@code
   * Object response = ((JavascriptExecutor) driver).executeAsyncScript(
   *     "var callback = arguments[arguments.length - 1];" +
   *     "var xhr = new XMLHttpRequest();" +
   *     "xhr.open('GET', '/resource/data.json', true);" +
   *     "xhr.onreadystatechange = function() {" +
   *     "  if (xhr.readyState == 4) {" +
   *     "    callback(xhr.responseText);" +
   *     "  }" +
   *     "};" +
   *     "xhr.send();");
   * JsonObject json = new JsonParser().parse((String) response);
   * assertEquals("cheese", json.get("food").getAsString());
   * }</pre>
   *
   * <p>Script arguments must be a number, a boolean, a String, WebElement, or a List of any
   * combination of the above. An exception will be thrown if the arguments do not meet these
   * criteria. The arguments will be made available to the JavaScript via the "arguments" variable.
   *
   * @param script The JavaScript to execute.
   * @param args The arguments to the script. May be empty.
   * @return One of Boolean, Long, String, List, Map, WebElement, or null.
   * @see WebDriver.Timeouts#scriptTimeout(java.time.Duration)
   */
  Object executeAsyncScript(String script, Object... args);

  /**
   * Commonly used scripts may be "pinned" to the WebDriver session, allowing them to be called
   * efficiently by their handle rather than sending the entire script across the wire for every
   * call.
   *
   * <p>The default implementation of this adheres to the API's expectations but is inefficient.
   *
   * @see #executeScript(ScriptKey, Object...)
   * @param script The Javascript to execute.
   * @return A handle which may later be used in {@link #executeScript(ScriptKey, Object...)}
   * @throws JavascriptException If the script cannot be pinned for some reason.
   */
  default ScriptKey pin(String script) {
    Require.nonNull("Script to pin", script);
    return UnpinnedScriptKey.pin(this, script);
  }

  /**
   * Deletes the reference to a script that has previously been pinned. Subsequent calls to {@link
   * #executeScript(ScriptKey, Object...)} will fail for the given {@code key}.
   */
  default void unpin(ScriptKey key) {
    Require.nonNull("Key to unpin", key);
    Require.stateCondition(
        key instanceof UnpinnedScriptKey, "Script key should have been generated by this driver");

    UnpinnedScriptKey.unpin(this, (UnpinnedScriptKey) key);
  }

  /**
   * @return The {@link ScriptKey}s of all currently pinned scripts.
   */
  default Set<ScriptKey> getPinnedScripts() {
    return Collections.unmodifiableSet(
        UnpinnedScriptKey.getPinnedScripts(this).stream()
            .map(key -> (ScriptKey) key)
            .collect(Collectors.toSet()));
  }

  /**
   * Calls a script by the {@link ScriptKey} returned by {@link #pin(String)}. This can be thought
   * of as inlining the pinned script and simply calling {@link #executeScript(String, Object...)}.
   *
   * @see #executeScript(String, Object...)
   */
  default Object executeScript(ScriptKey key, Object... args) {
    Require.stateCondition(
        key instanceof UnpinnedScriptKey, "Script key should have been generated by this driver");

    if (!getPinnedScripts().contains(key)) {
      throw new JavascriptException("Script is unpinned");
    }

    return executeScript(((UnpinnedScriptKey) key).getScript(), args);
  }
}
