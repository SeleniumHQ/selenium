using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace OpenQA.Selenium.Internal
{
    public interface IFindsByName
    {
        IWebElement FindElementByName(String name);
        ReadOnlyCollection<IWebElement> FindElementsByName(String name);
    }
}
