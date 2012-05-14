/*
Copyright 2007-2010 Selenium committers
Portions copyright 2011 Software Freedom Conservancy

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

package org.openqa.selenium.htmlunit;

import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriverException;

import com.gargoylesoftware.htmlunit.ScriptException;
import com.gargoylesoftware.htmlunit.ScriptResult;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import net.sourceforge.htmlunit.corejs.javascript.Function;
import net.sourceforge.htmlunit.corejs.javascript.NativeJavaObject;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * Injects an asynchronous script into the current page for execution. The script should signla that
 * it is finished by invoking the callback function, which will always be the last argument passed
 * to the injected script.
 */
class AsyncScriptExecutor {

  private final HtmlPage page;
  private final long timeoutMillis;

  /**
   * Prepares a new asynchronous script for execution.
   * 
   * @param page The page to inject the script into.
   * @param timeoutMillis How long to wait for the script to complete, in milliseconds.
   */
  AsyncScriptExecutor(HtmlPage page, long timeoutMillis) {
    this.page = page;
    this.timeoutMillis = timeoutMillis;
  }

  /**
   * Injects an asynchronous script for execution and waits for its result.
   * 
   * @param scriptBody The script body.
   * @param parameters The script parameters, which can be referenced using the {@code arguments}
   *        JavaScript object.
   * @return The script result.
   */
  public Object execute(String scriptBody, Object[] parameters) {
    AsyncScriptResult asyncResult = new AsyncScriptResult();
    Function function = createInjectedScriptFunction(scriptBody, asyncResult);

    try {
      page.executeJavaScriptFunctionIfPossible(function, function, parameters,
          page.getDocumentElement());
    } catch (ScriptException e) {
      throw new WebDriverException(e);
    }

    try {
      return asyncResult.waitForResult();
    } catch (InterruptedException e) {
      throw new WebDriverException(e);
    }
  }

  private Function createInjectedScriptFunction(String userScript, AsyncScriptResult asyncResult) {
    String script =
        "function() {" +
            "  var self = this, timeoutId;" +
            "  var cleanUp = function() {" +
            "    window.clearTimeout(timeoutId);" +
            "    if (window.detachEvent) {" +
            "      window.detachEvent('onunload', catchUnload);" +
            "    } else {" +
            "      window.removeEventListener('unload', catchUnload, false);" +
            "    }" +
            "  };" +
            "  var self = this, timeoutId, catchUnload = function() {" +
            "    cleanUp();" +
            "    self.host.unload();" +
            "  };" +
            // Convert arguments into an actual array, then add the callback object.
            "  arguments = Array.prototype.slice.call(arguments, 0);" +
            "  arguments.push(function(value) {" +
            "    cleanUp();" +
            "    self.host.callback(typeof value == 'undefined' ? null : value);" +
            "  });" +
            // Add an event listener to trap unload events; page loads are not supported with async
            // script execution.
            "  if (window.attachEvent) {" +
            "    window.attachEvent('onunload', catchUnload);" +
            "  } else {" +
            "    window.addEventListener('unload', catchUnload, false);" +
            "  }" +
            // Execute the user's script
            "  (function() {" + userScript + "}).apply(null, arguments);" +
            // Register our timeout for the script. If the script invokes the callback immediately
            // (e.g. it's not really async), then this will still fire. That's OK because the host
            // object should ignore the extra timeout.
            "  timeoutId = window.setTimeout(function() {" +
            "    self.host.timeout();" +
            "  }, " + timeoutMillis + ");" +
            "}";

    // Compile our script.
    ScriptResult result = page.executeJavaScript(script);
    Function function = (Function) result.getJavaScriptResult();

    // Finally, update the script with the callback host object.
    function.put("host", function, new NativeJavaObject(function, asyncResult, null));

    return function;
  }

  /**
   * Host object used to capture the result of an asynchronous script.
   * 
   * <p/>
   * This class has public visibility so it can be correctly wrapped in a {@link NativeJavaObject}.
   * 
   * @see AsyncScriptExecutor
   */
  public static class AsyncScriptResult {

    private final CountDownLatch latch = new CountDownLatch(1);

    private volatile Object value = null;
    private volatile boolean isTimeout = false;
    private volatile boolean unloadDetected = false;

    /**
     * Waits for the script to signal it is done by calling {@link #callback(Object) callback}.
     * 
     * @return The script result.
     * @throws InterruptedException If this thread is interrupted before a result is ready.
     */
    Object waitForResult() throws InterruptedException {
      long startTimeNanos = System.nanoTime();
      latch.await();
      if (isTimeout) {
        long elapsedTimeNanos = System.nanoTime() - startTimeNanos;
        long elapsedTimeMillis = TimeUnit.NANOSECONDS.toMillis(elapsedTimeNanos);
        throw new TimeoutException(
            "Timed out waiting for async script result after " + elapsedTimeMillis + "ms");
      }

      if (unloadDetected) {
        throw new WebDriverException(
            "Detected a page unload event; executeAsyncScript does not work across page loads");
      }
      return value;
    }

    /**
     * Callback function to be exposed in JavaScript.
     * 
     * <p/>
     * This method has public visibility for Rhino and should never be called by code outside of
     * Rhino.
     * 
     * @param value The asynchronous script result.
     */
    public void callback(Object value) {
      if (latch.getCount() > 0) {
        this.value = value;
        latch.countDown();
      }
    }

    /**
     * Function exposed in JavaScript to signal a timeout. Has no effect if called after the
     * {@link #callback(Object) callback} function.
     * 
     * <p/>
     * This method has public visibility for Rhino and should never be called by code outside of
     * Rhino.
     */
    public void timeout() {
      if (latch.getCount() > 0) {
        isTimeout = true;
        latch.countDown();
      }
    }

    /**
     * Function exposed to JavaScript to signal that a page unload event was fired. WebDriver's
     * asynchronous script execution model does not permit new page loads.
     * 
     * <p/>
     * This method has public visibility for Rhino and should never be called by code outside of
     * Rhino.
     */
    public void unload() {
      if (latch.getCount() > 0) {
        unloadDetected = true;
        latch.countDown();
      }
    }
  }
}
