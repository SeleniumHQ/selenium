package org.openqa.selenium.internal;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriverException;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Utility class used to execute "asynchronous" scripts. This class should
 * only be used by browsers that do not natively support asynchronous
 * script execution.
 *
 * <p/><strong>Warning:</strong> this class is intended for internal use
 * <em>only</em>. This class will be removed without warning after all
 * native asynchronous implemenations have been completed.
 */
public class AsyncJavascriptExecutor {

  private final JavascriptExecutor executor;
  private long timeout;
  private TimeUnit timeoutUnit;

  public AsyncJavascriptExecutor(JavascriptExecutor executor, long timeout, TimeUnit timeoutUnit) {
    this.executor = executor;
    this.timeout = timeout;
    this.timeoutUnit = timeoutUnit;
  }

  /**
   * Sets the amount of time to wait for an asynchronous script to finish
   * execution before throwing an error. If the timeout is negative, then the
   * script will be allowed to run indefinitely.
   *
   * @param timeout The timeout value.
   * @param timeoutUnit The unit of time for {@code timeout}.
   */
  public void setTimeout(long timeout, TimeUnit timeoutUnit) {
    this.timeout = timeout;
    this.timeoutUnit = timeoutUnit;
  }

  /**
   * Executes an asynchronous script in the context of the current page and
   * frame.
   *
   * @param script The script to execute.
   * @param args The script arguments.
   * @return The script result.
   * @see JavascriptExecutor#executeAsyncScript(String, Object...)
   */
  public Object executeScript(String script, Object... args) {
    if (!executor.isJavascriptEnabled()) {
      throw new IllegalStateException(
          "The underlying JavascriptExecutor must have JavaScript enabled");
    }

    // Injected into the page along with the user's script. Used to detect when a new page is
    // loaded while waiting for the script result.
    String pageId = UUID.randomUUID().toString();

    String asyncScript = new StringBuilder()
        .append("document.__$webdriverPageId = '").append(pageId).append("';")
        // Register the timeout for the user's script.
        .append("var timeoutId = window.setTimeout(function() {")
        // Wait one more event loop to signal the timeout. This catches cases where the script
        // timeout is 0, and the inject script invokes the callback in 0-timeout.
        .append("  window.setTimeout(function() {")
        .append("    document.__$webdriverAsyncTimeout = 1;")
        .append("  }, 0);")
        .append("}, ").append(timeoutUnit.toMillis(timeout)).append(");")
        // If the script times out, this will be the elapsed time. We track this on the document so
        // the polling function can query it. Why are we tracking our time outs in the browser and
        // not in Java? So we stay in sync with the browser's event loop, of course!
        .append("document.__$webdriverAsyncTimeout = 0;")
        // Define our callback. We'll store the script result on the document so the polling
        // function can check for it.
        .append("var callback = function(value) {")
        .append("  document.__$webdriverAsyncTimeout = 0;")
        .append("  document.__$webdriverAsyncScriptResult = value;")
        .append("  window.clearTimeout(timeoutId);")
        .append("};")
        // Add the callback to the end of the user supplied arguments.
        .append("var argsArray = Array.prototype.slice.call(arguments);")
        .append("argsArray.push(callback);")
        // Make sure the value that signals completion isn't set already.
        .append("delete document.__$webdriverAsyncScriptResult;")
        // Finally, execute the user's script.
        .append("(function() {")
        .append(script)
        .append("}).apply(null, argsArray);")
        .toString();

    // This is used by our polling function to return a result that indicates the script has
    // neither finished nor timed out yet.
    String pendingId = UUID.randomUUID().toString();

    String pollFunction = new StringBuilder()
        .append("var pendingId = '").append(pendingId).append("';")
        // Check that we're still on the page we injected the async script into.
        .append("if (document.__$webdriverPageId != '").append(pageId).append("') {")
        .append("  return [pendingId, -1];")
        // Check if the script made its callback yet.
        .append("} else if ('__$webdriverAsyncScriptResult' in document) {")
        .append("  var value = document.__$webdriverAsyncScriptResult;")
        .append("  delete document.__$webdriverAsyncScriptResult;")
        .append("  return value;")
        // The script hasn't finished yet.  Perhaps it timedout?
        .append("} else {")
        // Note: not all browsers support returning object literals from injected scripts, so we
        // have to return a 2-tuple.
        .append("  return [pendingId, document.__$webdriverAsyncTimeout];")
        .append("}")
        .toString();

    // Execute the async script.
    long startTimeNanos = System.nanoTime();
    executor.executeScript(asyncScript, args);

    // Finally, enter a loop running the poll function. This loop will run until one of the
    // following occurs:
    // - The async script invokes the callback with its result.
    // - The poll function detects that the script has timed out.
    // We rely on the polling function to detect timeouts so we stay in sync with the browser's
    // javascript event loop.
    while (true) {
      Object result = executor.executeScript(pollFunction);
      if (result instanceof List
          && ((List) result).size() == 2
          && pendingId.equals(((List) result).get(0))) {
        long timeoutFlag = ((Number) ((List) result).get(1)).longValue();
        if (timeoutFlag < 0) {
          throw new WebDriverException(
              "Detected a new page load while waiting for async script result."
              + "\nScript: " + script);
        }

        long elapsedTime = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startTimeNanos);
        if (timeoutFlag > 0) {
          throw new TimeoutException("Timed out waiting for async script callback."
              + "\nElapsed time: " + elapsedTime + "ms"
              + "\nScript: " + script);
        }
      } else {
        return result;
      }
      sleep(100);
    }
  }

  private void sleep(long durationMillis) {
    try {
      Thread.sleep(durationMillis);
    } catch (InterruptedException e) {
      throw new WebDriverException(e);
    }
  }
}
