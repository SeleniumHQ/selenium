using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium.Internal
{
    public interface IFindsByXPath
    {
        IWebElement FindElementByXPath(String xpath);
        List<IWebElement> FindElementsByXPath(String xpath);
    }
}
