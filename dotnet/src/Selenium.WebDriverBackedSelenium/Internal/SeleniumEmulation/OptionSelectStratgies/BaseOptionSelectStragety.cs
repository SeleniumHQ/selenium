using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Provides methods for selecting options.
    /// </summary>
    internal abstract class BaseOptionSelectStrategy : IOptionSelectStrategy
    {
        /// <summary>
        /// Selects an option in the specified list of options.
        /// </summary>
        /// <param name="fromOptions">The list of options from which to select an option.</param>
        /// <param name="selectThis">The string determining which option to select.</param>
        /// <param name="setSelected"><see langword="true"/> to select the option; <see langword="false"/> to unselect.</param>
        /// <param name="allowMultipleSelect"><see langword="true"/> if multiple selections are allowed; <see langword="false"/> if not.</param>
        /// <returns><see langword="true"/> if the option is selected; otherwise, <see langword="false"/>.</returns>
        public bool SelectOption(ReadOnlyCollection<IWebElement> fromOptions, string selectThis, bool setSelected, bool allowMultipleSelect)
        {
            bool matchMade = false;
            IEnumerator<IWebElement> allOptions = fromOptions.GetEnumerator();

            while (allOptions.MoveNext())
            {
                IWebElement option = allOptions.Current;
                bool matchThisTime = this.SelectOption(option, selectThis);
                if (matchThisTime)
                {
                    if (setSelected)
                    {
                        option.Select();
                    }
                    else if (option.Selected)
                    {
                        option.Toggle();
                    }
                }

                matchMade |= matchThisTime;
                if (matchMade && !allowMultipleSelect)
                {
                    return true;
                }
            }

            return matchMade;
        }

        /// <summary>
        /// Gets a value indicating whether an option meets the criteria for selection.
        /// </summary>
        /// <param name="optionElement">The candidate option element to select.</param>
        /// <param name="selectThis">The string determining whether to select the option.</param>
        /// <returns><see langword="true"/> if the option meets the criteria; otherwise, <see langword="false"/>.</returns>
        protected abstract bool SelectOption(IWebElement optionElement, string selectThis);
    }
}