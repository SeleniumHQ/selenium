
using System;
using OpenQA.Selenium;

namespace Selenium
{
    /// <summary>
    /// Defines a strategy to look up elements based on the appropriate method determined by the locator string.
    /// </summary>
    internal class ImplicitLookupStrategy : ILookupStrategy
    {
        /// <summary>
        /// Finds an element using the appropriate method determined by the locator string.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> to use in finding the element.</param>
        /// <param name="use">The locator string to use.</param>
        /// <returns>An <see cref="IWebElement"/> that matches the locator string.</returns>
        /// <remarks>If the locator string begins with "document.", this method uses the 
        /// <see cref="DomTraversalLookupStrategy">DOM traversal lookup strategy</see>.
        /// If the locator string begins with "//", this method uses the <see cref="XPathLookupStrategy">
        /// XPath lookup strategy</see>. Otherwise, it uses the <see cref="IdentifierLookupStrategy">
        /// Identifier lookup strategy</see>, which looks up first by ID, then by name.</remarks>
        public IWebElement Find(IWebDriver driver, string use)
        {
            if (use.StartsWith("document.", StringComparison.Ordinal))
            {
                return new DomTraversalLookupStrategy().Find(driver, use);
            }
            else if (use.StartsWith("//", StringComparison.Ordinal))
            {
                return new XPathLookupStrategy().Find(driver, use);
            }
            else
            {
                return new IdentifierLookupStrategy().Find(driver, use);
            }
        }
    }
}
