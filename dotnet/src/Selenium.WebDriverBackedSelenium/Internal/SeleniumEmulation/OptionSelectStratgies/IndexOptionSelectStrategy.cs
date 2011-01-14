using System;
using System.Collections.ObjectModel;
using System.Globalization;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class IndexOptionSelectStrategy : IOptionSelectStrategy
    {
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