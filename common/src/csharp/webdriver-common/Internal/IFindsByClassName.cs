using System;
using System.Collections.Generic;
using System.Text;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium.Internal
{
    public interface IFindsByClassName
    {
        IWebElement FindElementByClassName(String className);
        ReadOnlyCollection<IWebElement> FindElementsByClassName(String className);
    }
}
