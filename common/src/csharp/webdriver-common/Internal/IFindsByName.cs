using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium.Internal
{
    public interface IFindsByName
    {
        IWebElement FindElementByName(String name);
        List<IWebElement> FindElementsByName(String name);
    }
}
