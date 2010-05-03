using System;
using System.Collections.ObjectModel;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    public class IndexOptionSelectStrategy : IOptionSelectStrategy
    {
        public bool Select(ReadOnlyCollection<IWebElement> fromOptions, string selectThis, bool setSelected, bool allowMultipleSelect)
        {
            try
            {
                int index = Int32.Parse(selectThis);
                IWebElement option = (IWebElement)fromOptions[index];
                if (setSelected)
                    option.Select();
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