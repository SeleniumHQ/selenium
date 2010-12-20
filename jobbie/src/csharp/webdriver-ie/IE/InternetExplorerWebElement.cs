using System;
using System.Collections.ObjectModel;
using System.Drawing;
using System.Globalization;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// InternetExplorerWebElement allows you to have access to specific items that are found on the page.
    /// </summary>
    /// <seealso cref="IRenderedWebElement"/>
    /// <seealso cref="ILocatable"/>
    /// <example>
    /// <code>
    /// [Test]
    /// public void TestGoogle()
    /// {
    ///     driver = new InternetExplorerDriver();
    ///     InternetExplorerWebElement elem = driver.FindElement(By.Name("q"));
    ///     elem.SendKeys("Cheese please!");
    /// }
    /// </code>
    /// </example>
    public class InternetExplorerWebElement : RenderedRemoteWebElement, IFindsByCssSelector
    {
        /// <summary>
        /// Initializes a new instance of the InternetExplorerWebElement class.
        /// </summary>
        /// <param name="parent">Driver in use.</param>
        /// <param name="id">ID of the element.</param>
        public InternetExplorerWebElement(InternetExplorerDriver parent, string id)
            : base(parent, id)
        {
        }

        #region IFindsByCssSelector Members
        /// <summary>
        /// Finds the first child element matching the specified CSS selector.
        /// </summary>
        /// <param name="cssSelector">The CSS selector to match.</param>
        /// <returns>The first child <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByCssSelector(string cssSelector)
        {
            return FindElement("css selector", cssSelector);
        }

        /// <summary>
        /// Finds all child elements matching the specified CSS selector.
        /// </summary>
        /// <param name="cssSelector">The CSS selector to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all child
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByCssSelector(string cssSelector)
        {
            return FindElements("css selector", cssSelector);
        }

        #endregion
    }
}
