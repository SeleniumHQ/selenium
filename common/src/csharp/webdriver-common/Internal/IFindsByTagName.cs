using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace OpenQA.Selenium.Internal
{
    public interface IFindsByTagName
    {
        IWebElement FindElementByTagName(String tagName);
        ReadOnlyCollection<IWebElement> FindElementsByTagName(String tagName);
    }
}
