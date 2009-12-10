using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace OpenQA.Selenium.Internal
{
    public interface IFindsById
    {
        IWebElement FindElementById(String id);
        ReadOnlyCollection<IWebElement> FindElementsById(String id);
    }
}
