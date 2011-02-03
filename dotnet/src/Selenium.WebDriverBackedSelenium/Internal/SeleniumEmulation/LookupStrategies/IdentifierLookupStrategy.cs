using System;
using OpenQA.Selenium;

namespace Selenium
{
    /// <summary>
    /// Defines a strategy to look up elements based on the name and ID.
    /// </summary>
    internal class IdentifierLookupStrategy : ILookupStrategy
    {
        /// <summary>
        /// Finds an element using the ID and name.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> to use in finding the element.</param>
        /// <param name="use">The locator string to use.</param>
        /// <returns>An <see cref="IWebElement"/> that matches the locator string.</returns>
        /// <remarks>This method looks up elements first by ID, then by name.</remarks>
        public IWebElement Find(OpenQA.Selenium.IWebDriver driver, string use)
        {
            try
            {
                return new IdLookupStrategy().Find(driver, use);
            }
            catch (NoSuchElementException)
            {
                return new NameLookupStrategy().Find(driver, use);
            }
        }
    }
}
