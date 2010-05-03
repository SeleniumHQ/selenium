using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    public interface IOptionSelectStrategy
    {
        bool Select(ReadOnlyCollection<IWebElement> fromOptions, string selectThis, bool setSelected, bool allowMultipleSelect);
    }
}
