using System;
using System.Collections.Generic;
using System.Text;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium.Internal
{
    /// <summary>
    /// Utility class used to execute "asynchronous" scripts. This class should
    /// only be used by browsers that do not natively support asynchronous
    /// script execution.
    /// 
    /// <para>Warning: this class is intended for internal use
    /// only. This class will be removed without warning after all
    /// native asynchronous implemenations have been completed.
    /// </para>
    /// </summary>
    public class AsyncJavaScriptExecutor
    {
        private IJavaScriptExecutor executor;
        private TimeSpan timeout = TimeSpan.FromMilliseconds(0);

        private const string AsyncScriptTemplate = @"document.__$webdriverPageId = '{0}';
var timeoutId = window.setTimeout(function() {{
  window.setTimeout(function() {{
    document.__$webdriverAsyncTimeout = 1;
  }}, 0);
}}, {1});
document.__$webdriverAsyncTimeout = 0;
var callback = function(value) {{
  document.__$webdriverAsyncTimeout = 0;
  document.__$webdriverAsyncScriptResult = value;
  window.clearTimeout(timeoutId);
}};
var argsArray = Array.prototype.slice.call(arguments);
argsArray.push(callback);
if (document.__$webdriverAsyncScriptResult !== undefined) {{
  delete document.__$webdriverAsyncScriptResult;
}}
(function() {{
{2}
}}).apply(null, argsArray);";

        private const string PollingScriptTemplate = @"var pendingId = '{0}';
if (document.__$webdriverPageId != '{1}') {{
  return [pendingId, -1];
}} else if ('__$webdriverAsyncScriptResult' in document) {{
  var value = document.__$webdriverAsyncScriptResult;
  delete document.__$webdriverAsyncScriptResult;
  return value;
}} else {{
  return [pendingId, document.__$webdriverAsyncTimeout];
}}
";
        /// <summary>
        /// Initializes a new instance of the <see cref="AsyncJavaScriptExecutor"/> class.
        /// </summary>
        /// <param name="executor">An <see cref="IJavaScriptExecutor"/> object capable of executing JavaScript.</param>
        public AsyncJavaScriptExecutor(IJavaScriptExecutor executor)
        {
            this.executor = executor;
        }

        /// <summary>
        /// Gets or sets the timeout for the script executor.
        /// </summary>
        public TimeSpan Timeout
        {
            get { return timeout; }
            set { timeout = value; }
        }

        /// <summary>
        /// Executes a JavaScript script asynchronously.
        /// </summary>
        /// <param name="script">The script to execute.</param>
        /// <param name="args">An array of objects used as arguments in the script.</param>
        /// <returns>The object which is the return value of the script.</returns>
        /// <exception cref="InvalidOperationException">if the object executing the function doesn't support JavaScript.</exception>
        /// <exception cref="WebDriverException">if the page reloads during the JavaScript execution.</exception>
        /// <exception cref="TimeoutException">if the timeout expires during the JavaScript execution.</exception>
        public object ExecuteScript(string script, object[] args)
        {
            if (!executor.IsJavaScriptEnabled)
            {
                throw new InvalidOperationException(
                    "The underlying JavascriptExecutor must have JavaScript enabled");
            }

            // Injected into the page along with the user's script. Used to detect when a new page is
            // loaded while waiting for the script result.
            string pageId = Guid.NewGuid().ToString();

            string asyncScript = string.Format(AsyncScriptTemplate, pageId, timeout.TotalMilliseconds, script);

            // This is used by our polling function to return a result that indicates the script has
            // neither finished nor timed out yet.
            string pendingId = Guid.NewGuid().ToString();

            string pollFunction = string.Format(PollingScriptTemplate, pendingId, pageId);

            // Execute the async script.
            DateTime startTime = DateTime.Now;
            executor.ExecuteScript(asyncScript, args);

            // Finally, enter a loop running the poll function. This loop will run until one of the
            // following occurs:
            // - The async script invokes the callback with its result.
            // - The poll function detects that the script has timed out.
            // We rely on the polling function to detect timeouts so we stay in sync with the browser's
            // javascript event loop.
            while (true)
            {
                object result = executor.ExecuteScript(pollFunction);
                ReadOnlyCollection<object> resultList = result as ReadOnlyCollection<object>;
                if (resultList != null && resultList.Count == 2 && pendingId == resultList[0].ToString())
                {
                    long timeoutFlag = (long)resultList[1];
                    if (timeoutFlag < 0)
                    {
                        throw new WebDriverException(
                            "Detected a new page load while waiting for async script result."
                            + "\nScript: " + script);
                    }

                    TimeSpan elapsedTime = DateTime.Now - startTime;
                    if (timeoutFlag > 0)
                    {
                        throw new TimeoutException("Timed out waiting for async script callback."
                            + "\nElapsed time: " + elapsedTime.Milliseconds + "ms"
                            + "\nScript: " + script);
                    }
                }
                else
                {
                    return result;
                }
                System.Threading.Thread.Sleep(100);
            }
        }
    }
}
