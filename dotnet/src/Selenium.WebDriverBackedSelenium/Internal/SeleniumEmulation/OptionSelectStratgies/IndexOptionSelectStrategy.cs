using System;
using System.Collections.ObjectModel;
using System.Globalization;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Provides methods for selecting options based on the index of the option.
    /// </summary>
    internal class IndexOptionSelectStrategy : IOptionSelectStrategy
    {
        /// <summary>
        /// Selects an option in the specified list of options.
        /// </summary>
        /// <param name="fromOptions">The list of options from which to select an option.</param>
        /// <param name="selectThis">The index of the option to select.</param>
        /// <param name="setSelected"><see langword="true"/> to select the option; <see langword="false"/> to unselect.</param>
        /// <param name="allowMultipleSelect"><see langword="true"/> if multiple selections are allowed; <see langword="false"/> if not.</param>
        /// <returns><see langword="true"/> if the option is selected; otherwise, <see langword="false"/>.</returns>
        public bool SelectOption(ReadOnlyCollection<IWebElement> fromOptions, string selectThis, bool setSelected, bool allowMultipleSelect)
        {
            try
            {
                int index = Int32.Parse(selectThis, CultureInfo.InvariantCulture);
                IWebElement option = (IWebElement)fromOptions[index];
                if (setSelected)
                {
                    option.Select();
                }
                else if (option.Selected)
                {
                    option.Toggle();
                }

                return true;
            }
            catch (Exception)
            {
                // Do nothing. Handled below
            }

            return false; 
        }
    }
}