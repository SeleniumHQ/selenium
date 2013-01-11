using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Provides a method by which to select options.
    /// </summary>
    internal interface IOptionSelectStrategy
    {
        /// <summary>
        /// Selects an option.
        /// </summary>
        /// <param name="fromOptions">A list of options to select from.</param>
        /// <param name="selectThis">The option to select.</param>
        /// <param name="setSelected"><see langword="true"/> to select the option; <see langword="false"/> to unselect.</param>
        /// <param name="allowMultipleSelect"><see langword="true"/> to allow multiple selections; otherwise, <see langword="false"/>.</param>
        /// <returns><see langword="true"/> if the option is selected; otherwise, <see langword="false"/>.</returns>
        bool SelectOption(ReadOnlyCollection<IWebElement> fromOptions, string selectThis, bool setSelected, bool allowMultipleSelect);
    }
}
