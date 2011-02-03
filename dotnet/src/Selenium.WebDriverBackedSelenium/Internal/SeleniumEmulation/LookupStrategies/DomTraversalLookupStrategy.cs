using System;
using System.Globalization;
using OpenQA.Selenium;

namespace Selenium
{
    /// <summary>
    /// Defines a strategy to look up elements based on traversing the DOM.
    /// </summary>
    internal class DomTraversalLookupStrategy : ILookupStrategy
    {
        /// <summary>
        /// Finds an element by traversing the DOM.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> to use in finding the element.</param>
        /// <param name="use">The locator string to use.</param>
        /// <returns>An <see cref="IWebElement"/> that matches the locator string.</returns>
        public IWebElement Find(IWebDriver driver, string use)
        {
            IJavaScriptExecutor executor = driver as IJavaScriptExecutor;
            if (executor == null)
            {
                throw new NotSupportedException("DOM lookups only work when the driver supports Javascript");
            }

            return (IWebElement)executor.ExecuteScript(string.Format(CultureInfo.InvariantCulture, "return {0}", use));
        }
    }
}
