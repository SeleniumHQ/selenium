using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the removeAllSelections keyword.
    /// </summary>
    internal class RemoveAllSelections : SeleneseCommand
    {
        private ElementFinder finder;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoveAllSelections"/> class.
        /// </summary>
        /// <param name="elementFinder">An <see cref="ElementFinder"/> used to find the element on which to execute the command.</param>
        public RemoveAllSelections(ElementFinder elementFinder)
        {
            this.finder = elementFinder;
        }

        /// <summary>
        /// Handles the command.
        /// </summary>
        /// <param name="driver">The driver used to execute the command.</param>
        /// <param name="locator">The first parameter to the command.</param>
        /// <param name="value">The second parameter to the command.</param>
        /// <returns>The result of the command.</returns>
        protected override object HandleSeleneseCommand(IWebDriver driver, string locator, string value)
        {
            IWebElement select = this.finder.FindElement(driver, locator);
            ReadOnlyCollection<IWebElement> options = select.FindElements(By.TagName("option"));

            string multiple = select.GetAttribute("multiple");
            if (string.IsNullOrEmpty(multiple))
            {
                return null;
            }

            foreach (IWebElement option in options)
            {
                if (option.Selected)
                {
                    option.Click();
                }
            }

            return null;
        }
    }
}
