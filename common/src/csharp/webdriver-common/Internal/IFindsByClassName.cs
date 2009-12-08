using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium.Internal
{
    public interface IFindsByClassName
    {
        IWebElement FindElementByClassName(String className);
        List<IWebElement> FindElementsByClassName(String className);
    }
}
