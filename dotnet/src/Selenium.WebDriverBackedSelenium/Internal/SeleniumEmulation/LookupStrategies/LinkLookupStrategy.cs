using System;
using OpenQA.Selenium;

namespace Selenium
{
    /// <summary>
    /// Defines a strategy to look up elements based on the link text.
    /// </summary>
    internal class LinkLookupStrategy : ILookupStrategy
    {
        /// <summary>
        /// Finds an element using the link text.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> to use in finding the element.</param>
        /// <param name="use">The locator string to use.</param>
        /// <returns>An <see cref="IWebElement"/> that matches the locator string.</returns>
        public IWebElement Find(IWebDriver driver, string use)
        {
            return driver.FindElement(By.LinkText(use));
        }
    }
}
