using OpenQA.Selenium;

namespace Selenium
{
    /// <summary>
    /// Defines a strategy to look up elements based on a CSS selector.
    /// </summary>
    internal class CssSelectorLookupStrategy : ILookupStrategy
    {
        /// <summary>
        /// Finds an element using CSS Selectors.
        /// </summary>
        /// <param name="driver">The <see cref="IWebDriver"/> to use in finding the element.</param>
        /// <param name="use">The locator string to use.</param>
        /// <returns>An <see cref="IWebElement"/> that matches the locator string.</returns>
        public IWebElement Find(IWebDriver driver, string use)
        {
            return driver.FindElement(By.CssSelector(use));
        }
    }
}