using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium.Internal
{
    public interface IFindsByTagName
    {
        IWebElement FindElementByTagName(String tagName);
        List<IWebElement> FindElementsByTagName(String tagName);
    }
}
