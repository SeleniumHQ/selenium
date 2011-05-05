using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the command for the getSelectOptions keyword.
    /// </summary>
    internal class GetSelectOptions : SeleneseCommand
    {
        private ElementFinder finder;

        /// <summary>
        /// Initializes a new instance of the <see cref="GetSelectOptions"/> class.
        /// </summary>
        /// <param name="finder">A <see cref="ElementFinder"/> used in getting the select options.</param>
        public GetSelectOptions(ElementFinder finder)
        {
            this.finder = finder;
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
            SeleniumSelect select = new SeleniumSelect(this.finder, driver, locator);

            ReadOnlyCollection<IWebElement> allOptions = select.AllOptions;
            List<string> labels = new List<string>();
            foreach (IWebElement label in allOptions)
            {
                labels.Add(label.Text);
            }

            return labels.ToArray();
        }
    }
}
