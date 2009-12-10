using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace OpenQA.Selenium.Internal
{
    public interface IFindsByXPath
    {
        IWebElement FindElementByXPath(String xpath);
        ReadOnlyCollection<IWebElement> FindElementsByXPath(String xpath);
    }
}
